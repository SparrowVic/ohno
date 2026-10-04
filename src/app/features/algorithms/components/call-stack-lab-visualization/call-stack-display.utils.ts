import { I18N_KEY } from '../../../../core/i18n/i18n-keys';
import { TranslatableText } from '../../../../core/i18n/translatable-text';
import { RackRowTone } from '../../../../shared/instrument/rack/rack-row/rack-row';
import {
  CallStackFrame,
  CallStackFrameLocal,
  CallStackFramePhase,
  CallStackLabTraceState,
} from '../../models/call-stack-lab';

const CALL_STACK = I18N_KEY.features.algorithms.display.callStack;

export type CallStackFrameTone = 'cyan' | 'lime' | 'pink' | 'slate';
export type CallStackLocalTone = 'arg' | 'result' | 'active' | 'idle';

export const CALL_STACK_PHASE_KEYS: Readonly<Record<CallStackFramePhase, string>> = {
  entering: CALL_STACK.phases.entering,
  active: CALL_STACK.phases.active,
  'descending-left': CALL_STACK.phases.descendingLeft,
  'descending-right': CALL_STACK.phases.descendingRight,
  combining: CALL_STACK.phases.combining,
  returning: CALL_STACK.phases.returning,
  cached: CALL_STACK.phases.cached,
  pruned: CALL_STACK.phases.pruned,
};

const LOCAL_TONES: Readonly<Record<CallStackFrameLocal['tone'], CallStackLocalTone>> = {
  default: 'idle',
  arg: 'arg',
  result: 'result',
  active: 'active',
};

const RECENT_RETURN_AGE = 0;
const FADED_RETURN_AGE = 4;

export interface CallStackSignature {
  readonly name: string;
  readonly args: string;
}

export interface CallStackLocalView {
  readonly id: string;
  readonly label: TranslatableText;
  readonly value: string;
  readonly tone: CallStackLocalTone;
}

export interface CallStackFrameView {
  readonly id: string;
  readonly depth: number;
  readonly name: string;
  readonly args: string;
  readonly phaseKey: string;
  readonly tone: CallStackFrameTone;
  readonly top: boolean;
  readonly returnValue: string | null;
  readonly locals: readonly CallStackLocalView[];
}

export interface CallStackReturnRow {
  readonly id: string;
  readonly name: string;
  readonly args: string;
  readonly value: string;
  readonly tone: RackRowTone;
}

export function frameSignature(title: string): CallStackSignature {
  const match = /^([^()]+)\((.*)\)$/.exec(title.trim());
  if (!match) return { name: title.trim(), args: '' };
  return { name: match[1] ?? '', args: match[2] ?? '' };
}

export function frameTone(frame: CallStackFrame, top: boolean): CallStackFrameTone {
  if (frame.phase === 'returning' || frame.phase === 'cached') return 'lime';
  if (frame.phase === 'pruned') return 'pink';
  return top ? 'cyan' : 'slate';
}

export function callStackFrames(state: CallStackLabTraceState | null): readonly CallStackFrameView[] {
  if (!state) return [];
  const lastIndex = state.frames.length - 1;
  return state.frames
    .map((frame, index): CallStackFrameView => {
      const top = index === lastIndex;
      const signature = frameSignature(frame.title);
      return {
        id: frame.id,
        depth: frame.depth,
        name: signature.name,
        args: signature.args,
        phaseKey: CALL_STACK_PHASE_KEYS[frame.phase],
        tone: frameTone(frame, top),
        top,
        returnValue: frame.returnValue,
        locals: frame.locals.map((local, index) => ({
          id: `${frame.id}:${index}`,
          label: local.label,
          value: local.value,
          tone: LOCAL_TONES[local.tone],
        })),
      };
    })
    .reverse();
}

export function returnRowTone(age: number): RackRowTone {
  if (age <= RECENT_RETURN_AGE) return 'done';
  return age >= FADED_RETURN_AGE ? 'dim' : 'default';
}

export function callStackReturnRows(state: CallStackLabTraceState | null): readonly CallStackReturnRow[] {
  if (!state) return [];
  return state.recentReturns.map((entry) => {
    const signature = frameSignature(entry.title);
    return {
      id: entry.id,
      name: signature.name,
      args: signature.args,
      value: entry.returnValue,
      tone: returnRowTone(entry.age),
    };
  });
}

export function callStackTopTitle(state: CallStackLabTraceState | null): string | null {
  const frames = state?.frames ?? [];
  return frames.length > 0 ? (frames[frames.length - 1]?.title ?? null) : null;
}
