import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  faBackwardStep,
  faChevronLeft,
  faCopy,
  faForwardStep,
  faPlay,
  faRotateLeft,
} from '@fortawesome/pro-solid-svg-icons';

import { ALGORITHM_CATALOG } from '../../features/algorithms/data/catalog/catalog';
import { moduleId } from '../../features/algorithms/data/catalog/module-id/module-id';
import { OhnoModuleCard } from '../../features/algorithms/module-card/module-card';
import { OhnoEngraving } from '../../shared/instrument/engraving/engraving';
import { OhnoFloatingPlate } from '../../shared/instrument/floating-plate/floating-plate';
import { OhnoGauge } from '../../shared/instrument/gauge/gauge';
import { OhnoKbd } from '../../shared/instrument/kbd/kbd';
import { OhnoKey } from '../../shared/instrument/key/key';
import { OhnoKnob } from '../../shared/instrument/knob/knob';
import { OhnoLangToggle } from '../../shared/instrument/lang-toggle/lang-toggle';
import { OhnoLatch } from '../../shared/instrument/latch/latch';
import { OhnoLed } from '../../shared/instrument/led/led';
import { OhnoMenu } from '../../shared/instrument/menu/menu';
import { MenuItem } from '../../shared/instrument/menu/menu.types';
import { OhnoMeter } from '../../shared/instrument/meter/meter';
import { OhnoOpLine } from '../../shared/instrument/opline/opline';
import { LedColor } from '../../shared/instrument/led/led.types';
import { OhnoPlate } from '../../shared/instrument/plate/plate';
import { OhnoRack } from '../../shared/instrument/rack/rack';
import { OhnoRackRow } from '../../shared/instrument/rack/rack-row/rack-row';
import { OhnoReadout } from '../../shared/instrument/readout/readout';
import { OhnoScreen } from '../../shared/instrument/screen/screen';
import { OhnoSearchField } from '../../shared/instrument/search-field/search-field';
import { OhnoSlot } from '../../shared/instrument/slot/slot';
import { OhnoTape } from '../../shared/instrument/tape/tape';
import { TapeRow } from '../../shared/instrument/tape/tape.types';
import { OhnoWindowStepper } from '../../shared/instrument/window-stepper/window-stepper';
import { Difficulty } from '../../features/algorithms/models/algorithm';
import { LegendEntry, LegendHint, OhnoLegendRow } from '../../features/algorithms/workbench/legend-row/legend-row';
import { OhnoStageHead } from '../../features/algorithms/workbench/stage-head/stage-head';
import { OhnoStageScreen } from '../../features/algorithms/workbench/stage-screen/stage-screen';
import { StageMeter } from '../../features/algorithms/workbench/utils/stage-readout.utils';
import { OhnoWorkbenchTopbar } from '../../features/algorithms/workbench/workbench-topbar/workbench-topbar';
import { OhnoTransportDeck } from '../../features/algorithms/workbench/transport-deck/transport-deck';
import { TaskInputSchema } from '../../features/algorithms/models/task';
import { PlaybackStatus, TransportAction } from '../../features/algorithms/workbench/utils/transport.utils';
import { getAlgorithmViewConfig } from '../../features/algorithms/algorithm-detail/algorithm-detail-config/algorithm-detail-config';
import { InspectorTab, OhnoInspector } from '../../features/algorithms/workbench/inspector/inspector';
import { OhnoLogPrinter } from '../../features/algorithms/workbench/log-printer/log-printer';
import { EMPTY_TRACES, WorkbenchTraces } from '../../features/algorithms/workbench/models/workbench-traces';
import { TapeFilter } from '../../features/algorithms/workbench/utils/tape-rows.utils';
import { deriveSortTrace } from '../../features/algorithms/utils/helpers/derive-sort-trace/derive-sort-trace';

// Dev-only specimen sheet: literal Polish labels are intentional, it never ships.
@Component({
  selector: 'app-instrument-specimen',
  imports: [OhnoPlate, OhnoScreen, OhnoEngraving, OhnoLed, OhnoKbd, OhnoReadout, OhnoMeter, OhnoKey, OhnoLatch, OhnoKnob, OhnoSlot, OhnoGauge, OhnoWindowStepper, OhnoOpLine, OhnoRack, OhnoRackRow, OhnoTape, OhnoFloatingPlate, OhnoMenu, OhnoSearchField, OhnoLangToggle, OhnoModuleCard, OhnoWorkbenchTopbar, OhnoStageHead, OhnoStageScreen, OhnoLegendRow, OhnoTransportDeck, OhnoInspector, OhnoLogPrinter],
  templateUrl: './instrument-specimen.html',
  styleUrl: './instrument-specimen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentSpecimen {
  protected readonly ledColors: readonly LedColor[] = [
    'signal', 'cyan', 'pink', 'lime', 'amber', 'red', 'violet', 'slate', 'easy',
  ];

  protected readonly speed = signal(5);
  protected readonly size = signal(16);
  protected readonly step = signal(66);
  protected readonly menuOpen = signal(false);
  protected readonly language = signal('pl');
  protected readonly codeLanguage = signal('ts');
  protected readonly languageItems: readonly MenuItem[] = [
    { id: 'ts', label: 'TypeScript' },
    { id: 'py', label: 'Python' },
    { id: 'rs', label: 'Rust', disabled: true },
  ];

  protected readonly icons = {
    back: faChevronLeft,
    copy: faCopy,
    reset: faRotateLeft,
    previous: faBackwardStep,
    play: faPlay,
    next: faForwardStep,
  };
  protected readonly difficulties = signal<readonly { id: string; label: string; led: LedColor; on: boolean }[]>([
    { id: 'easy', label: 'Łatwe', led: 'easy', on: true },
    { id: 'medium', label: 'Średnie', led: 'amber', on: true },
    { id: 'hard', label: 'Trudne', led: 'signal', on: true },
    { id: 'ultra', label: 'Ekstremalne', led: 'red', on: false },
  ]);

  protected toggleDifficulty(id: string, on: boolean): void {
    this.difficulties.update((items) => items.map((item) => (item.id === id ? { ...item, on } : item)));
  }

  protected readonly tapeRows: readonly TapeRow[] = [
    { step: 56, kind: 'separator', tone: 'slate', event: '── PRZEBIEG 2 ZAKOŃCZONY ──', detail: '' },
    { step: 57, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '56[0] : 13[1]' },
    { step: 58, kind: 'event', tone: 'pink', event: 'ZAMIEŃ', detail: '56[0] ↔ 13[1]' },
    { step: 59, kind: 'event', tone: 'cyan', event: 'PORÓWNAJ', detail: '56[1] : 74[2]' },
    { step: 60, kind: 'event', tone: 'lime', event: 'USTAL', detail: '99[15]' },
  ];

  protected readonly stageView = signal<'bar' | 'block'>('bar');
  protected readonly stageDifficulty = Difficulty.Easy;
  protected readonly stageViews = [
    { value: 'bar' as const, label: 'Słupki' },
    { value: 'block' as const, label: 'Bloki' },
  ];
  protected readonly stageMeters: readonly StageMeter[] = [
    { id: 'passes', label: 'Przebieg', value: 3, total: 15, pad: 2 },
    { id: 'comparisons', label: 'Porównania', value: 35, total: null, pad: 3 },
    { id: 'swaps', label: 'Zamiany', value: 28, total: null, pad: 3 },
  ];
  protected readonly stageRegisters = [
    { label: 'i', value: '5' },
    { label: 'j', value: '6' },
    { label: 'granica', value: '14' },
    { label: 'ustalone', value: '2' },
  ];
  protected readonly stageLegend: readonly LegendEntry[] = [
    { label: 'Nieposortowane', color: 'slate' },
    { label: 'Porównanie', color: 'cyan' },
    { label: 'Zamiana', color: 'pink' },
    { label: 'Posortowane', color: 'lime' },
  ];
  protected readonly stageHints: readonly LegendHint[] = [
    { keys: ['[', ']'], label: 'tempo' },
    { keys: ['C'], label: 'kod' },
    { keys: ['L'], label: 'log' },
  ];

  protected readonly deckPlaying = signal(false);
  protected readonly deckAction = computed<TransportAction>(() => (this.deckPlaying() ? 'pause' : this.step() >= 196 ? 'restart' : 'play'));
  protected readonly deckStatus = computed<PlaybackStatus>(() =>
    this.deckPlaying() ? 'playing' : this.step() >= 196 ? 'complete' : this.step() === 0 ? 'idle' : 'paused',
  );
  protected readonly deckTaskId = signal('known-gcd');
  protected readonly deckTasks = [
    { id: 'known-gcd', label: 'Znany gcd · 735, 210' },
    { id: 'coprime', label: 'Liczby względnie pierwsze' },
  ];
  protected readonly deckSchema: TaskInputSchema<Record<string, unknown>> = {
    a: { kind: 'int', label: 'a', min: 1, max: 9999 },
    b: { kind: 'int', label: 'b', min: 1, max: 9999, nonZero: true },
  };
  protected readonly deckValues = signal<Record<string, unknown>>({ a: 735, b: 210 });

  protected readonly inspectorTab = signal<InspectorTab>('code');
  protected readonly inspectorAlgorithm = ALGORITHM_CATALOG.find((item) => item.id === 'bubble-sort')!;
  protected readonly inspectorConfig = getAlgorithmViewConfig('bubble-sort');
  protected readonly inspectorTraces: WorkbenchTraces = {
    ...EMPTY_TRACES,
    sort: deriveSortTrace({
      array: [13, 56, 35, 11, 48, 74, 12, 72, 84, 57, 96, 58, 35, 27, 97, 99],
      comparing: [5, 6],
      swapping: null,
      sorted: [14, 15],
      boundary: 14,
      activeCodeLine: 6,
      description: 'Porównaj 74 na indeksie 5 z 12 na indeksie 6.',
    }),
  };
  protected readonly logFilter = signal<TapeFilter>('all');

  protected readonly displayCells = [
    { value: '0', tone: 'idle', tag: null, mark: null },
    { value: '6', tone: 'slate', tag: null, mark: null },
    { value: '6', tone: 'pink', tag: 'take', mark: null },
    { value: '9', tone: 'pink', tag: 'skip', mark: null },
    { value: '13', tone: 'cyan', tag: null, mark: '?' },
    { value: '10', tone: 'lime', tag: null, mark: null },
    { value: '·', tone: 'dim', tag: null, mark: null },
  ];
  protected readonly displayTape = [
    { char: 'A', index: 10, tone: 'lime' },
    { char: 'B', index: 11, tone: 'lime' },
    { char: 'C', index: 12, tone: 'cyan' },
    { char: 'A', index: 13, tone: 'slate' },
    { char: 'B', index: 14, tone: 'dim' },
    { char: 'D', index: 15, tone: 'pink' },
  ];
  protected readonly planeTicks = [0, 20, 40, 60, 80, 100];
  protected readonly sampleModules = ['bubble-sort', 'counting-sort', 'heap-sort', 'knapsack-01', 'kmp-pattern-matching', 'euclidean-gcd', 'convex-hull', 'recursion-call-stack']
    .map((id) => ALGORITHM_CATALOG.find((item) => item.id === id)!)
    .map((item) => ({ item, moduleId: moduleId(item, ALGORITHM_CATALOG) }));
}
