import { LedColor } from '../led/led.types';

export interface TapeRow {
  readonly step: number;
  readonly kind: 'event' | 'separator';
  readonly tone: LedColor;
  readonly event: string;
  readonly detail: string;
}
