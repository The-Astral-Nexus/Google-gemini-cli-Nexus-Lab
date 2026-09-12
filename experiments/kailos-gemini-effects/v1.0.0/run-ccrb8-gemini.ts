import {GoogleGenAI} from '@google/genai';
import {buildCcrb8SystemContext, buildRoleVectors, bind8CanonicalRoles, KAILOS_ROLES} from '../../../packages/core/src/kailos/ccrb8.js';
import {writeFile, mkdir} from 'node:fs/promises';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;
if (!apiKey) throw new Error('GEMINI_API_KEY is required.');
if (!model) throw new Error('GEMINI_MODEL is required; set it to the Google Gemini model under test.');

const ai = new GoogleGenAI({apiKey});
const task = process.env.KAILOS_TEST_PROMPT ??
  'Analyze this scenario: a research system has two memories that disagree about whether an event occurred on Tuesday or Friday. Explain how you would determine which memory should control the answer, and identify the evidence you would need.';

async function call(contents: string, systemInstruction?: string) {
  const started = performance.now();
  const response = await ai.models.generateContent({
    model,
    contents,
    config: systemInstruction ? {systemInstruction} : undefined,
  });
  return {
    text: response.text ?? '',
    latencyMs: Math.round(performance.now() - started),
  };
}

const roleVectors = buildRoleVectors(task);
const z = bind8CanonicalRoles(roleVectors);
const kailosContext = buildCcrb8SystemContext(task);

// Baseline: Gemini receives the task with no CCRB-8 representation.
const baseline = await call(task);

// Treatment: identical task plus the actual computed CCRB-8 representation.
const treatment = await call(task, kailosContext);

// A representation-aware probe asks Gemini whether the supplied representation
// should be treated as evidence or merely as an experimental external signal.
const probe = await call(
  `${task}\n\n${kailosContext}\n\nState explicitly whether the CCRB-8 vector itself provides a trustworthy semantic interpretation without an independently defined decoder.`,
);

const result = {
  experiment: 'CCRB8-GEMINI-V1',
  timestamp: new Date().toISOString(),
  model,
  dimension: z.length,
  roles: KAILOS_ROLES,
  binding: 'normalize(Re(IFFT(product FFT(E_i))))',
  baseline,
  ccrb8Treatment: treatment,
  decoderProbe: probe,
  vectorL2Norm: Math.sqrt(z.reduce((s, x) => s + x * x, 0)),
  scientificInterpretation:
    'A difference between baseline and treatment is behavioral evidence about the API-level context intervention. It is not evidence that CCRB-8 entered Gemini transformer weights.',
};

await mkdir(new URL('./results/', import.meta.url), {recursive: true});
await writeFile(
  new URL(`./results/ccrb8-${Date.now()}.json`, import.meta.url),
  JSON.stringify(result, null, 2),
  'utf8',
);

console.log(JSON.stringify(result, null, 2));
