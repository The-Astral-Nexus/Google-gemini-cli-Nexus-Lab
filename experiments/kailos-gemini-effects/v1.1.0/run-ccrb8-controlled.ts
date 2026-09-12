import {GoogleGenAI} from '@google/genai';
import {buildRoleVectors, bind8CanonicalRoles, KAILOS_DIMENSION, KAILOS_ROLES} from '../../../packages/core/src/kailos/ccrb8.js';
import {mkdir, writeFile} from 'node:fs/promises';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL?.trim();
const rawTrials = Number.parseInt(process.env.KAILOS_TRIALS ?? '12', 10);
const trials = Number.isFinite(rawTrials) ? Math.min(Math.max(rawTrials, 1), 50) : 12;

const DEFAULT_TASK =
  'A research system has two memories that disagree about whether an event occurred on Tuesday or Friday. ' +
  'Explain how you would determine which memory should control the answer, and identify the evidence you would need. ' +
  'Give a concise, evidence-based answer and explicitly separate observations from interpretations.';

const task = process.env.KAILOS_TEST_PROMPT?.trim() || DEFAULT_TASK;

if (!apiKey) throw new Error('GEMINI_API_KEY is required.');
if (!model) throw new Error('GEMINI_MODEL is required.');

const ai = new GoogleGenAI({apiKey});

type Condition = 'baseline' | 'roles' | 'ccrb8' | 'random-vector';
const CONDITIONS: Condition[] = ['baseline', 'roles', 'ccrb8', 'random-vector'];

function l2(v: number[]): number {
  return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
}

function seededRandomVector(seed: number): number[] {
  let state = seed >>> 0;
  const v = new Array<number>(KAILOS_DIMENSION);
  for (let i = 0; i < v.length; i++) {
    state = (Math.imul(state ^ (state >>> 16), 0x45d9f3b) + 0x27100001) >>> 0;
    const u = state / 0x100000000;
    v[i] = u * 2 - 1;
  }
  const norm = l2(v);
  return v.map((x) => x / norm);
}

function formatVector(v: number[]): string {
  return JSON.stringify(v.map((x) => Number(x.toPrecision(7))));
}

function contextFor(condition: Condition, ccrb8: number[], randomVector: number[]): string | undefined {
  if (condition === 'baseline') return undefined;
  if (condition === 'roles') {
    return [
      '[KAILOS-CONTROL-BEGIN]',
      'Experimental role metadata only. No numerical semantic vector is supplied.',
      `Roles: ${KAILOS_ROLES.join(', ')}`,
      `Dimension target: ${KAILOS_DIMENSION}`,
      '[KAILOS-CONTROL-END]',
    ].join('\n');
  }
  const label = condition === 'ccrb8' ? 'CCRB-8 semantic binding representation' : 'random normalized control vector';
  const vector = condition === 'ccrb8' ? ccrb8 : randomVector;
  return [
    '[KAILOS-EXPERIMENT-BEGIN]',
    label + '.',
    `Roles: ${KAILOS_ROLES.join(', ')}`,
    `Dimension: ${KAILOS_DIMENSION}`,
    'Binding: normalize(Re(IFFT(product FFT(E_i))))',
    `L2 norm: ${l2(vector).toFixed(12)}`,
    `z_t: ${formatVector(vector)}`,
    '[KAILOS-EXPERIMENT-END]',
  ].join('\n');
}

function shuffled<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    state = (Math.imul(state ^ (state >>> 16), 0x45d9f3b) + 0x27100001) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function call(condition: Condition, trial: number, systemInstruction?: string) {
  const started = performance.now();
  const response = await ai.models.generateContent({
    model,
    contents: task,
    config: systemInstruction ? {systemInstruction, temperature: 0.2} : {temperature: 0.2},
  });
  return {
    condition,
    trial,
    text: response.text ?? '',
    latencyMs: Math.round(performance.now() - started),
  };
}

const roleVectors = buildRoleVectors(task);
const ccrb8 = bind8CanonicalRoles(roleVectors);
const results: Array<Awaited<ReturnType<typeof call>>> = [];

for (let trial = 1; trial <= trials; trial++) {
  const randomVector = seededRandomVector(0xCCRB8000 + trial);
  const order = shuffled(CONDITIONS, 0xA11CE000 + trial);
  for (const condition of order) {
    const context = contextFor(condition, ccrb8, randomVector);
    results.push(await call(condition, trial, context));
  }
}

const byCondition = Object.fromEntries(CONDITIONS.map((condition) => {
  const rows = results.filter((r) => r.condition === condition);
  return [condition, {
    n: rows.length,
    meanLatencyMs: rows.reduce((s, r) => s + r.latencyMs, 0) / rows.length,
  }];
}));

const result = {
  experiment: 'CCRB8-GEMINI-V1.1-CONTROLLED',
  timestamp: new Date().toISOString(),
  model,
  trials,
  prompt: task,
  dimension: KAILOS_DIMENSION,
  roles: KAILOS_ROLES,
  binding: 'normalize(Re(IFFT(product FFT(E_i))))',
  vectorL2Norm: l2(ccrb8),
  design: {
    pairedPrompt: true,
    randomizedConditionOrderPerTrial: true,
    conditions: CONDITIONS,
    temperature: 0.2,
    interpretation: 'This tests API-level context effects. It does not test modification of Gemini weights.',
  },
  summary: byCondition,
  results,
};

await mkdir(new URL('./results/', import.meta.url), {recursive: true});
await writeFile(
  new URL(`./results/ccrb8-controlled-${Date.now()}.json`, import.meta.url),
  JSON.stringify(result, null, 2),
  'utf8',
);
console.log(JSON.stringify(result, null, 2));
