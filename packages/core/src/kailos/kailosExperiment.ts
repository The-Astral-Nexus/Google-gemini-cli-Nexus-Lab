import type {Content} from '@google/genai';
import type {GenerateContentOptions} from '../core/baseLlmClient.js';
import {buildCcrb8SystemContext, ccrb8Enabled} from './ccrb8.js';

export interface KailosExperimentRecord {
  experiment: 'CCRB8-GEMINI-V1';
  enabled: boolean;
  roleCount: 8;
  dimension: 4096;
  binding: 'frequency-domain-circular-convolution';
  inputCharacterCount: number;
  systemContextInjected: boolean;
  timestamp: string;
  modelConfigKey?: string;
  promptId: string;
  response?: string;
  error?: string;
}

function contentsToExperimentText(contents: Content[]): string {
  return JSON.stringify(contents).slice(0, 16000);
}

/**
 * Adds CCRB-8 to the same GenerateContentOptions consumed by Gemini CLI's
 * BaseLlmClient. This is the controlled experimental integration point.
 */
export function augmentGenerateContentForKailos(
  options: GenerateContentOptions,
): GenerateContentOptions {
  if (!ccrb8Enabled()) return options;

  const source = contentsToExperimentText(options.contents);
  const representation = buildCcrb8SystemContext(source);
  const existing = options.systemInstruction;

  let systemInstruction = representation;
  if (typeof existing === 'string') {
    systemInstruction = `${existing}\n\n${representation}`;
  } else if (existing !== undefined) {
    // Preserve structured Google GenAI system instructions rather than
    // silently replacing them. The harness can use a string system prompt
    // when the experimental path is enabled.
    return options;
  }

  return {...options, systemInstruction};
}

export function createKailosExperimentRecord(
  options: GenerateContentOptions,
  response?: string,
  error?: unknown,
): KailosExperimentRecord {
  const record: KailosExperimentRecord = {
    experiment: 'CCRB8-GEMINI-V1',
    enabled: ccrb8Enabled(),
    roleCount: 8,
    dimension: 4096,
    binding: 'frequency-domain-circular-convolution',
    inputCharacterCount: contentsToExperimentText(options.contents).length,
    systemContextInjected: ccrb8Enabled() && typeof options.systemInstruction === 'string',
    timestamp: new Date().toISOString(),
    modelConfigKey: options.modelConfigKey?.model,
    promptId: options.promptId,
  };

  if (response !== undefined) record.response = response;
  if (error !== undefined) record.error = error instanceof Error ? error.message : String(error);
  return record;
}
