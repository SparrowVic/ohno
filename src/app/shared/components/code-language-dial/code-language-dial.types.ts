import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { CodeLanguage } from '../../../features/algorithms/models/detail';

export type CodeLanguageDialId =
  | CodeLanguage
  | 'javascript'
  | 'go'
  | 'rust'
  | 'swift'
  | 'php'
  | 'kotlin';

export interface CodeLanguageDialOption {
  readonly id: CodeLanguageDialId;
  readonly language?: CodeLanguage;
  readonly label: string;
  readonly disabled?: boolean;
  readonly hint?: string;
}

export interface CodeLanguageDialItem extends CodeLanguageDialOption {
  readonly shortLabel: string;
  readonly accent: string;
  readonly icon?: IconDefinition;
  readonly x: number;
  readonly y: number;
  readonly launchSpinDeg: number;
  readonly delayMs: number;
}

export interface CodeLanguageDialMeta {
  readonly shortLabel: string;
  readonly accent: string;
  readonly icon?: IconDefinition;
}

export interface TriggerRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
