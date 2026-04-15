import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { StructureItem } from '../models/structure';

interface PreviewRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rx?: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly dasharray?: string;
}

interface PreviewLine {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly stroke: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly dasharray?: string;
}

interface PreviewCircle {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
}

interface PreviewPath {
  readonly d: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly dasharray?: string;
}

interface PreviewSpec {
  readonly rects: readonly PreviewRect[];
  readonly lines: readonly PreviewLine[];
  readonly circles: readonly PreviewCircle[];
  readonly paths: readonly PreviewPath[];
}

interface NodePoint {
  readonly x: number;
  readonly y: number;
}

interface PaintPalette {
  readonly amberFill: string;
  readonly amberStroke: string;
  readonly amberSoft: string;
  readonly coolFill: string;
  readonly coolStroke: string;
  readonly mintFill: string;
  readonly mintStroke: string;
  readonly roseFill: string;
  readonly roseStroke: string;
  readonly ghostFill: string;
  readonly ghostStroke: string;
  readonly mutedStroke: string;
  readonly whiteGlow: string;
}

const PAINT: PaintPalette = {
  amberFill: 'rgba(255, 197, 98, 0.16)',
  amberStroke: 'rgba(255, 197, 98, 0.96)',
  amberSoft: 'rgba(255, 197, 98, 0.38)',
  coolFill: 'rgba(120, 217, 255, 0.15)',
  coolStroke: 'rgba(120, 217, 255, 0.94)',
  mintFill: 'rgba(110, 231, 183, 0.15)',
  mintStroke: 'rgba(110, 231, 183, 0.94)',
  roseFill: 'rgba(251, 113, 133, 0.18)',
  roseStroke: 'rgba(251, 113, 133, 0.94)',
  ghostFill: 'rgba(255, 255, 255, 0.04)',
  ghostStroke: 'rgba(255, 255, 255, 0.14)',
  mutedStroke: 'rgba(255, 255, 255, 0.08)',
  whiteGlow: 'rgba(255, 255, 255, 0.74)',
};

const EMPTY_SPEC: PreviewSpec = {
  rects: [],
  lines: [],
  circles: [],
  paths: [],
};

const TREE_POS = {
  root: { x: 160, y: 14 },
  left: { x: 116, y: 32 },
  right: { x: 204, y: 32 },
  leftLeft: { x: 84, y: 58 },
  leftRight: { x: 138, y: 58 },
  rightLeft: { x: 182, y: 58 },
  rightRight: { x: 236, y: 58 },
} satisfies Record<string, NodePoint>;

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string = PAINT.ghostFill,
  stroke: string = PAINT.ghostStroke,
  rx = 6,
  strokeWidth = 1.4,
  opacity = 1,
  dasharray?: string,
): PreviewRect {
  return { x, y, width, height, fill, stroke, rx, strokeWidth, opacity, dasharray };
}

function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string = PAINT.ghostStroke,
  strokeWidth = 1.8,
  opacity = 1,
  dasharray?: string,
): PreviewLine {
  return { x1, y1, x2, y2, stroke, strokeWidth, opacity, dasharray };
}

function circle(
  cx: number,
  cy: number,
  r: number,
  fill: string = PAINT.ghostFill,
  stroke: string = PAINT.ghostStroke,
  strokeWidth = 1.4,
  opacity = 1,
): PreviewCircle {
  return { cx, cy, r, fill, stroke, strokeWidth, opacity };
}

function path(
  d: string,
  fill: string = 'none',
  stroke: string = PAINT.ghostStroke,
  strokeWidth = 1.8,
  opacity = 1,
  dasharray?: string,
): PreviewPath {
  return { d, fill, stroke, strokeWidth, opacity, dasharray };
}

function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 4): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const leftX = x2 - Math.cos(angle - Math.PI / 6) * size;
  const leftY = y2 - Math.sin(angle - Math.PI / 6) * size;
  const rightX = x2 - Math.cos(angle + Math.PI / 6) * size;
  const rightY = y2 - Math.sin(angle + Math.PI / 6) * size;
  return `M ${x2} ${y2} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`;
}

function treeEdge(
  from: NodePoint,
  to: NodePoint,
  stroke: string = PAINT.ghostStroke,
  opacity = 0.94,
): PreviewLine {
  return line(from.x, from.y, to.x, to.y, stroke, 1.8, opacity);
}

function treeNode(
  point: NodePoint,
  fill: string = PAINT.ghostFill,
  stroke: string = PAINT.amberStroke,
): PreviewCircle {
  return circle(point.x, point.y, 5.5, fill, stroke, 1.8, 1);
}

function baseTreeLines(stroke: string = PAINT.ghostStroke): PreviewLine[] {
  return [
    treeEdge(TREE_POS.root, TREE_POS.left, stroke),
    treeEdge(TREE_POS.root, TREE_POS.right, stroke),
    treeEdge(TREE_POS.left, TREE_POS.leftLeft, stroke),
    treeEdge(TREE_POS.left, TREE_POS.leftRight, stroke),
    treeEdge(TREE_POS.right, TREE_POS.rightLeft, stroke),
    treeEdge(TREE_POS.right, TREE_POS.rightRight, stroke),
  ];
}

function baseTreeNodes(
  fill: string = PAINT.ghostFill,
  stroke: string = PAINT.amberStroke,
): PreviewCircle[] {
  return [
    treeNode(TREE_POS.root, fill, stroke),
    treeNode(TREE_POS.left, fill, stroke),
    treeNode(TREE_POS.right, fill, stroke),
    treeNode(TREE_POS.leftLeft, fill, stroke),
    treeNode(TREE_POS.leftRight, fill, stroke),
    treeNode(TREE_POS.rightLeft, fill, stroke),
    treeNode(TREE_POS.rightRight, fill, stroke),
  ];
}

function buildStackSpec(): PreviewSpec {
  const rects = [
    rect(122, 18, 76, 10, PAINT.ghostFill, PAINT.ghostStroke),
    rect(118, 31, 84, 10, PAINT.ghostFill, PAINT.ghostStroke),
    rect(114, 44, 92, 10, PAINT.ghostFill, PAINT.ghostStroke),
    rect(110, 57, 100, 10, PAINT.amberFill, PAINT.amberStroke),
  ];

  return {
    rects,
    lines: [line(220, 60, 220, 20, PAINT.coolStroke, 2.2)],
    circles: [circle(220, 20, 2.5, PAINT.coolStroke, 'none', 0)],
    paths: [path(arrowHead(220, 60, 220, 20, 5), PAINT.coolStroke, 'none', 0)],
  };
}

function buildQueueSpec(): PreviewSpec {
  const rects = [0, 1, 2, 3].map((index) =>
    rect(70 + index * 42, 30, 34, 20, index === 0 ? PAINT.coolFill : PAINT.ghostFill, index === 0 ? PAINT.coolStroke : PAINT.ghostStroke),
  );
  return {
    rects,
    lines: [
      line(24, 40, 60, 40, PAINT.amberStroke, 2.1),
      line(246, 40, 292, 40, PAINT.mintStroke, 2.1),
    ],
    circles: [],
    paths: [
      path(arrowHead(24, 40, 60, 40, 5), PAINT.amberStroke, 'none', 0),
      path(arrowHead(246, 40, 292, 40, 5), PAINT.mintStroke, 'none', 0),
    ],
  };
}

function buildDequeSpec(): PreviewSpec {
  const rects = [0, 1, 2, 3].map((index) =>
    rect(
      74 + index * 42,
      30,
      34,
      20,
      index === 1 || index === 2 ? PAINT.amberFill : PAINT.ghostFill,
      index === 1 || index === 2 ? PAINT.amberStroke : PAINT.ghostStroke,
      7,
    ),
  );

  return {
    rects,
    lines: [
      line(28, 40, 64, 40, PAINT.coolStroke, 2.1),
      line(256, 40, 292, 40, PAINT.coolStroke, 2.1),
    ],
    circles: [],
    paths: [
      path(arrowHead(28, 40, 64, 40, 5), PAINT.coolStroke, 'none', 0),
      path(arrowHead(292, 40, 256, 40, 5), PAINT.coolStroke, 'none', 0),
    ],
  };
}

function buildCircularBufferSpec(): PreviewSpec {
  const centerX = 160;
  const centerY = 42;
  const outerR = 30;
  const innerR = 16;
  const slotAngles = [210, 255, 300, 345, 30, 75, 120, 165];

  const paths = slotAngles.map((angle, index) => {
    const next = angle + 34;
    const startOuterX = centerX + Math.cos((angle * Math.PI) / 180) * outerR;
    const startOuterY = centerY + Math.sin((angle * Math.PI) / 180) * outerR;
    const endOuterX = centerX + Math.cos((next * Math.PI) / 180) * outerR;
    const endOuterY = centerY + Math.sin((next * Math.PI) / 180) * outerR;
    const startInnerX = centerX + Math.cos((next * Math.PI) / 180) * innerR;
    const startInnerY = centerY + Math.sin((next * Math.PI) / 180) * innerR;
    const endInnerX = centerX + Math.cos((angle * Math.PI) / 180) * innerR;
    const endInnerY = centerY + Math.sin((angle * Math.PI) / 180) * innerR;
    const fill =
      index === 1 || index === 2 || index === 3 ? PAINT.coolFill : index === 6 ? PAINT.amberFill : PAINT.ghostFill;
    const stroke =
      index === 1 || index === 2 || index === 3 ? PAINT.coolStroke : index === 6 ? PAINT.amberStroke : PAINT.ghostStroke;

    return path(
      [
        `M ${startOuterX} ${startOuterY}`,
        `A ${outerR} ${outerR} 0 0 1 ${endOuterX} ${endOuterY}`,
        `L ${startInnerX} ${startInnerY}`,
        `A ${innerR} ${innerR} 0 0 0 ${endInnerX} ${endInnerY}`,
        'Z',
      ].join(' '),
      fill,
      stroke,
      1.2,
      1,
    );
  });

  return {
    rects: [],
    lines: [
      line(118, 12, 138, 22, PAINT.amberStroke, 1.8),
      line(205, 68, 186, 58, PAINT.coolStroke, 1.8),
    ],
    circles: [
      circle(centerX, centerY, 10, 'rgba(255,255,255,0.025)', PAINT.ghostStroke, 1.1),
      circle(112, 9, 3, PAINT.amberFill, PAINT.amberStroke, 1.2),
      circle(209, 71, 3, PAINT.coolFill, PAINT.coolStroke, 1.2),
    ],
    paths: [
      ...paths,
      path(arrowHead(118, 12, 138, 22, 4), PAINT.amberStroke, 'none', 0),
      path(arrowHead(205, 68, 186, 58, 4), PAINT.coolStroke, 'none', 0),
    ],
  };
}

function buildLinkedListSpec(double = false): PreviewSpec {
  const rects: PreviewRect[] = [];
  const lines: PreviewLine[] = [];
  const paths: PreviewPath[] = [];

  [28, 116, 204].forEach((x) => {
    rects.push(rect(x, 28, 54, 24, PAINT.ghostFill, PAINT.ghostStroke, 8));
    rects.push(rect(x + 34, 28, 20, 24, PAINT.amberFill, PAINT.amberStroke, 8));
  });

  const forwardLinks: Array<[number, number]> = [
    [82, 116],
    [170, 204],
  ];

  forwardLinks.forEach(([x1, x2]) => {
    lines.push(line(x1, 40, x2, 40, PAINT.coolStroke, 2));
    paths.push(path(arrowHead(x1, 40, x2, 40, 4.5), PAINT.coolStroke, 'none', 0));
  });

  if (double) {
    forwardLinks.forEach(([x1, x2]) => {
      lines.push(line(x2, 46, x1, 46, PAINT.amberStroke, 1.8, 0.94));
      paths.push(path(arrowHead(x2, 46, x1, 46, 4.2), PAINT.amberStroke, 'none', 0));
    });
  }

  return { rects, lines, circles: [circle(16, 40, 5, PAINT.mintFill, PAINT.mintStroke)], paths };
}

function buildDsuSpec(): PreviewSpec {
  const leftSet = [
    circle(54, 22, 5, PAINT.coolFill, PAINT.coolStroke, 1.6),
    circle(38, 52, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(70, 52, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
  ];
  const rightSet = [
    circle(186, 20, 5, PAINT.amberFill, PAINT.amberStroke, 1.6),
    circle(160, 50, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(212, 50, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(238, 50, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
  ];

  return {
    rects: [],
    lines: [
      line(38, 52, 54, 22, PAINT.coolStroke, 1.8),
      line(70, 52, 54, 22, PAINT.coolStroke, 1.8),
      line(160, 50, 186, 20, PAINT.amberStroke, 1.8),
      line(212, 50, 186, 20, PAINT.amberStroke, 1.8),
      line(238, 50, 186, 20, PAINT.amberStroke, 1.8),
      line(74, 22, 166, 20, PAINT.mintStroke, 2.2, 0.9, '5 5'),
    ],
    circles: [...leftSet, ...rightSet],
    paths: [path(arrowHead(74, 22, 166, 20, 4.4), PAINT.mintStroke, 'none', 0)],
  };
}

function buildHashOpenSpec(): PreviewSpec {
  const rects = Array.from({ length: 8 }, (_, index) =>
    rect(28 + index * 33, 26, 28, 20, index === 2 ? PAINT.coolFill : index === 3 ? PAINT.amberFill : PAINT.ghostFill, index === 2 ? PAINT.coolStroke : index === 3 ? PAINT.amberStroke : PAINT.ghostStroke, 6),
  );
  const lines = [
    line(66, 62, 110, 48, PAINT.coolStroke, 2),
    line(110, 48, 143, 48, PAINT.coolStroke, 1.8, 0.9, '4 4'),
  ];
  const circles = [circle(52, 62, 8, PAINT.coolFill, PAINT.coolStroke)];
  const paths = [
    path(arrowHead(66, 62, 110, 48, 4.5), PAINT.coolStroke, 'none', 0),
    path(arrowHead(110, 48, 143, 48, 4.5), PAINT.coolStroke, 'none', 0),
  ];
  return { rects, lines, circles, paths };
}

function buildHashChainingSpec(): PreviewSpec {
  const rects: PreviewRect[] = [];
  const lines: PreviewLine[] = [];
  const paths: PreviewPath[] = [];

  [14, 30, 46, 62].forEach((y, index) => {
    rects.push(rect(28, y, 34, 10, PAINT.ghostFill, PAINT.ghostStroke, 5));
    if (index === 1) {
      rects.push(rect(94, y - 1, 28, 12, PAINT.amberFill, PAINT.amberStroke, 6));
      rects.push(rect(140, y - 1, 28, 12, PAINT.coolFill, PAINT.coolStroke, 6));
      lines.push(line(62, y + 5, 94, y + 5, PAINT.ghostStroke, 1.8));
      lines.push(line(122, y + 5, 140, y + 5, PAINT.ghostStroke, 1.8));
      paths.push(path(arrowHead(62, y + 5, 94, y + 5, 4), PAINT.ghostStroke, 'none', 0));
      paths.push(path(arrowHead(122, y + 5, 140, y + 5, 4), PAINT.ghostStroke, 'none', 0));
    }
  });

  return { rects, lines, circles: [], paths };
}

function buildBstFamilySpec(mode: 'bst' | 'avl' | 'red-black' | 'splay' | 'treap'): PreviewSpec {
  const lines = baseTreeLines();
  const circles = baseTreeNodes();
  const rects: PreviewRect[] = [];

  if (mode === 'bst') {
    lines.push(line(160, 14, 116, 32, PAINT.coolStroke, 2.4));
    lines.push(line(116, 32, 138, 58, PAINT.coolStroke, 2.4));
    circles.splice(0, circles.length, ...baseTreeNodes(PAINT.ghostFill, PAINT.amberStroke));
    circles.push(circle(TREE_POS.root.x, TREE_POS.root.y, 6.1, PAINT.coolFill, PAINT.coolStroke, 2));
    circles.push(circle(TREE_POS.left.x, TREE_POS.left.y, 6.1, PAINT.coolFill, PAINT.coolStroke, 2));
    circles.push(circle(TREE_POS.leftRight.x, TREE_POS.leftRight.y, 6.1, PAINT.coolFill, PAINT.coolStroke, 2));
  }

  if (mode === 'avl') {
    circles.splice(0, circles.length, ...baseTreeNodes(PAINT.mintFill, PAINT.mintStroke));
    rects.push(rect(152, 4, 16, 5, PAINT.mintFill, PAINT.mintStroke, 3));
    rects.push(rect(106, 22, 18, 5, PAINT.mintFill, PAINT.mintStroke, 3));
    rects.push(rect(196, 22, 18, 5, PAINT.mintFill, PAINT.mintStroke, 3));
  }

  if (mode === 'red-black') {
    circles.splice(
      0,
      circles.length,
      circle(TREE_POS.root.x, TREE_POS.root.y, 5.8, PAINT.ghostFill, PAINT.amberStroke, 1.8),
      circle(TREE_POS.left.x, TREE_POS.left.y, 5.8, PAINT.roseFill, PAINT.roseStroke, 1.8),
      circle(TREE_POS.right.x, TREE_POS.right.y, 5.8, PAINT.ghostFill, PAINT.amberStroke, 1.8),
      circle(TREE_POS.leftLeft.x, TREE_POS.leftLeft.y, 5.8, PAINT.ghostFill, PAINT.amberStroke, 1.8),
      circle(TREE_POS.leftRight.x, TREE_POS.leftRight.y, 5.8, PAINT.ghostFill, PAINT.amberStroke, 1.8),
      circle(TREE_POS.rightLeft.x, TREE_POS.rightLeft.y, 5.8, PAINT.roseFill, PAINT.roseStroke, 1.8),
      circle(TREE_POS.rightRight.x, TREE_POS.rightRight.y, 5.8, PAINT.ghostFill, PAINT.amberStroke, 1.8),
    );
  }

  if (mode === 'splay') {
    lines.push(line(TREE_POS.leftLeft.x, TREE_POS.leftLeft.y, TREE_POS.left.x, TREE_POS.left.y, PAINT.coolStroke, 2.6));
    lines.push(line(TREE_POS.left.x, TREE_POS.left.y, TREE_POS.root.x, TREE_POS.root.y, PAINT.coolStroke, 2.6));
    circles.push(circle(TREE_POS.leftLeft.x, TREE_POS.leftLeft.y, 6.2, PAINT.coolFill, PAINT.coolStroke, 2));
    circles.push(circle(TREE_POS.left.x, TREE_POS.left.y, 6.2, PAINT.coolFill, PAINT.coolStroke, 2));
    circles.push(circle(TREE_POS.root.x, TREE_POS.root.y, 6.2, PAINT.coolFill, PAINT.coolStroke, 2));
  }

  if (mode === 'treap') {
    [TREE_POS.root, TREE_POS.left, TREE_POS.right, TREE_POS.leftLeft, TREE_POS.leftRight, TREE_POS.rightLeft, TREE_POS.rightRight].forEach((point, index) => {
      rects.push(rect(point.x - 5, point.y - 12, 10, 4, index % 2 === 0 ? PAINT.coolFill : PAINT.amberFill, index % 2 === 0 ? PAINT.coolStroke : PAINT.amberStroke, 2, 1.2));
    });
  }

  return { rects, lines, circles, paths: [] };
}

function buildHeapSpec(priority = false): PreviewSpec {
  const lines = baseTreeLines(PAINT.ghostStroke);
  const circles = baseTreeNodes(PAINT.ghostFill, PAINT.amberStroke);
  const rects = Array.from({ length: 7 }, (_, index) => {
    const x = 64 + index * 28;
    const y = 70;
    const tone = index === 0 ? [PAINT.coolFill, PAINT.coolStroke] : [PAINT.ghostFill, PAINT.ghostStroke];
    return rect(x, y, 22, 8, tone[0], tone[1], 3, 1.1);
  });

  if (priority) {
    lines.push(line(236, 14, 286, 14, PAINT.mintStroke, 2));
    return {
      rects,
      lines,
      circles: [...circles, circle(TREE_POS.root.x, TREE_POS.root.y, 6.2, PAINT.mintFill, PAINT.mintStroke, 2)],
      paths: [path(arrowHead(236, 14, 286, 14, 4.4), PAINT.mintStroke, 'none', 0)],
    };
  }

  return {
    rects,
    lines,
    circles: [
      ...circles,
      circle(TREE_POS.root.x, TREE_POS.root.y, 6.2, PAINT.coolFill, PAINT.coolStroke, 2),
      circle(TREE_POS.left.x, TREE_POS.left.y, 6.2, PAINT.amberFill, PAINT.amberStroke, 2),
    ],
    paths: [],
  };
}

function buildTrieSpec(mode: 'trie' | 'suffix-tree' | 'suffix-automaton'): PreviewSpec {
  if (mode === 'suffix-automaton') {
    return {
      rects: [],
      lines: [
        line(54, 24, 116, 24, PAINT.coolStroke, 1.8),
        line(116, 24, 182, 24, PAINT.coolStroke, 1.8),
        line(116, 24, 116, 58, PAINT.ghostStroke, 1.6),
        line(116, 58, 182, 58, PAINT.amberStroke, 1.8),
        line(182, 24, 250, 40, PAINT.coolStroke, 1.8),
        line(182, 58, 250, 40, PAINT.amberStroke, 1.8),
      ],
      circles: [
        circle(54, 24, 7, PAINT.ghostFill, PAINT.amberStroke, 1.8),
        circle(116, 24, 7, PAINT.coolFill, PAINT.coolStroke, 1.8),
        circle(116, 58, 7, PAINT.amberFill, PAINT.amberStroke, 1.8),
        circle(182, 24, 7, PAINT.coolFill, PAINT.coolStroke, 1.8),
        circle(182, 58, 7, PAINT.amberFill, PAINT.amberStroke, 1.8),
        circle(250, 40, 8, PAINT.mintFill, PAINT.mintStroke, 1.8),
      ],
      paths: [
        path('M 182 24 C 196 4, 238 6, 238 24', 'none', PAINT.ghostStroke, 1.6, 0.85),
      ],
    };
  }

  const lines = [
    line(48, 42, 108, 18, PAINT.ghostStroke, 1.8),
    line(48, 42, 108, 42, PAINT.ghostStroke, 1.8),
    line(48, 42, 108, 66, PAINT.ghostStroke, 1.8),
    line(108, 18, 186, 12, mode === 'suffix-tree' ? PAINT.amberStroke : PAINT.coolStroke, 1.8),
    line(108, 18, 186, 30, PAINT.ghostStroke, 1.8),
    line(108, 42, 186, 42, PAINT.coolStroke, 1.8),
    line(108, 66, 186, 54, PAINT.ghostStroke, 1.8),
    line(108, 66, 186, 72, mode === 'suffix-tree' ? PAINT.amberStroke : PAINT.mintStroke, 1.8),
  ];
  const circles = [
    circle(48, 42, 6, PAINT.ghostFill, PAINT.amberStroke, 1.8),
    circle(108, 18, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(108, 42, 5, PAINT.coolFill, PAINT.coolStroke, 1.6),
    circle(108, 66, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(186, 12, 5, PAINT.amberFill, PAINT.amberStroke, 1.6),
    circle(186, 30, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(186, 42, 5, PAINT.coolFill, PAINT.coolStroke, 1.6),
    circle(186, 54, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(186, 72, 5, PAINT.mintFill, PAINT.mintStroke, 1.6),
  ];
  const rects = mode === 'suffix-tree' ? [rect(224, 8, 42, 10, PAINT.ghostFill, PAINT.ghostStroke, 5), rect(224, 66, 42, 10, PAINT.ghostFill, PAINT.ghostStroke, 5)] : [];

  return { rects, lines, circles, paths: [] };
}

function buildSegmentFamilySpec(mode: 'segment' | 'lazy' | 'fenwick' | 'persistent' | 'wavelet'): PreviewSpec {
  if (mode === 'fenwick') {
    return {
      rects: Array.from({ length: 8 }, (_, index) =>
        rect(24 + index * 34, 58, 26, 12, index % 2 === 0 ? PAINT.ghostFill : PAINT.amberFill, index % 2 === 0 ? PAINT.ghostStroke : PAINT.amberStroke, 4, 1.1),
      ),
      lines: [
        line(38, 58, 72, 40, PAINT.coolStroke, 1.8),
        line(72, 58, 140, 24, PAINT.coolStroke, 1.8),
        line(106, 58, 140, 24, PAINT.coolStroke, 1.8),
        line(174, 58, 276, 12, PAINT.mintStroke, 1.8),
        line(208, 58, 276, 12, PAINT.mintStroke, 1.8),
        line(242, 58, 276, 12, PAINT.mintStroke, 1.8),
      ],
      circles: [
        circle(72, 40, 6, PAINT.coolFill, PAINT.coolStroke, 1.8),
        circle(140, 24, 6, PAINT.coolFill, PAINT.coolStroke, 1.8),
        circle(276, 12, 6, PAINT.mintFill, PAINT.mintStroke, 1.8),
      ],
      paths: [],
    };
  }

  if (mode === 'persistent') {
    const baseLines = [
      line(160, 10, 102, 28, PAINT.mutedStroke, 1.6),
      line(160, 10, 218, 28, PAINT.mutedStroke, 1.6),
      line(102, 28, 66, 52, PAINT.mutedStroke, 1.6),
      line(102, 28, 138, 52, PAINT.mutedStroke, 1.6),
      line(218, 28, 182, 52, PAINT.mutedStroke, 1.6),
      line(218, 28, 254, 52, PAINT.mutedStroke, 1.6),
    ];

    return {
      rects: [],
      lines: [
        ...baseLines,
        line(160, 16, 188, 30, PAINT.coolStroke, 2.2),
        line(188, 30, 210, 54, PAINT.coolStroke, 2.2),
      ],
      circles: [
        circle(160, 10, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6, 0.6),
        circle(102, 28, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6, 0.6),
        circle(218, 28, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6, 0.6),
        circle(66, 52, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6, 0.6),
        circle(138, 52, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6, 0.6),
        circle(182, 52, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6, 0.6),
        circle(254, 52, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6, 0.6),
        circle(160, 16, 5.8, PAINT.coolFill, PAINT.coolStroke, 1.8),
        circle(188, 30, 5.8, PAINT.coolFill, PAINT.coolStroke, 1.8),
        circle(210, 54, 5.8, PAINT.coolFill, PAINT.coolStroke, 1.8),
      ],
      paths: [],
    };
  }

  if (mode === 'wavelet') {
    return {
      rects: [
        rect(120, 10, 80, 12, PAINT.amberFill, PAINT.amberStroke, 5),
        rect(64, 34, 72, 12, PAINT.coolFill, PAINT.coolStroke, 5),
        rect(184, 34, 72, 12, PAINT.mintFill, PAINT.mintStroke, 5),
        rect(38, 58, 54, 12, PAINT.ghostFill, PAINT.ghostStroke, 5),
        rect(100, 58, 54, 12, PAINT.ghostFill, PAINT.ghostStroke, 5),
        rect(166, 58, 54, 12, PAINT.ghostFill, PAINT.ghostStroke, 5),
        rect(228, 58, 54, 12, PAINT.ghostFill, PAINT.ghostStroke, 5),
      ],
      lines: [
        line(160, 22, 100, 34, PAINT.coolStroke, 1.8),
        line(160, 22, 220, 34, PAINT.mintStroke, 1.8),
        line(100, 46, 65, 58, PAINT.coolStroke, 1.8),
        line(100, 46, 127, 58, PAINT.coolStroke, 1.8),
        line(220, 46, 193, 58, PAINT.mintStroke, 1.8),
        line(220, 46, 255, 58, PAINT.mintStroke, 1.8),
      ],
      circles: [],
      paths: [],
    };
  }

  const lines = [
    line(160, 10, 102, 28, PAINT.ghostStroke, 1.8),
    line(160, 10, 218, 28, PAINT.ghostStroke, 1.8),
    line(102, 28, 66, 52, PAINT.ghostStroke, 1.8),
    line(102, 28, 138, 52, PAINT.ghostStroke, 1.8),
    line(218, 28, 182, 52, PAINT.ghostStroke, 1.8),
    line(218, 28, 254, 52, PAINT.ghostStroke, 1.8),
  ];
  const circles = [
    circle(160, 10, 5.5, PAINT.amberFill, PAINT.amberStroke, 1.8),
    circle(102, 28, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(218, 28, 5.5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(66, 52, 5.5, PAINT.coolFill, PAINT.coolStroke, 1.8),
    circle(138, 52, 5.5, PAINT.coolFill, PAINT.coolStroke, 1.8),
    circle(182, 52, 5.5, PAINT.mintFill, PAINT.mintStroke, 1.8),
    circle(254, 52, 5.5, PAINT.mintFill, PAINT.mintStroke, 1.8),
  ];
  const rects = Array.from({ length: 8 }, (_, index) =>
    rect(26 + index * 34, 70, 28, 8, PAINT.ghostFill, PAINT.ghostStroke, 3, 1.1),
  );

  if (mode === 'lazy') {
    return {
      rects: [
        ...rects,
        rect(94, 15, 18, 8, PAINT.roseFill, PAINT.roseStroke, 4, 1),
        rect(210, 15, 18, 8, PAINT.roseFill, PAINT.roseStroke, 4, 1),
      ],
      lines,
      circles,
      paths: [],
    };
  }

  return { rects, lines, circles, paths: [] };
}

function buildSparseTableSpec(): PreviewSpec {
  return {
    rects: [
      rect(28, 58, 30, 10, PAINT.ghostFill, PAINT.ghostStroke, 4),
      rect(62, 58, 30, 10, PAINT.ghostFill, PAINT.ghostStroke, 4),
      rect(96, 58, 30, 10, PAINT.ghostFill, PAINT.ghostStroke, 4),
      rect(130, 58, 30, 10, PAINT.ghostFill, PAINT.ghostStroke, 4),
      rect(164, 58, 30, 10, PAINT.ghostFill, PAINT.ghostStroke, 4),
      rect(198, 58, 30, 10, PAINT.ghostFill, PAINT.ghostStroke, 4),
      rect(232, 58, 30, 10, PAINT.ghostFill, PAINT.ghostStroke, 4),
      rect(44, 42, 64, 10, PAINT.coolFill, PAINT.coolStroke, 4),
      rect(112, 42, 64, 10, PAINT.coolFill, PAINT.coolStroke, 4),
      rect(180, 42, 64, 10, PAINT.coolFill, PAINT.coolStroke, 4),
      rect(78, 26, 132, 10, PAINT.amberFill, PAINT.amberStroke, 4),
      rect(112, 10, 64, 10, PAINT.mintFill, PAINT.mintStroke, 4),
    ],
    lines: [line(110, 73, 144, 73, PAINT.coolStroke, 2), line(144, 73, 178, 73, PAINT.coolStroke, 2)],
    circles: [circle(110, 73, 2.8, PAINT.coolStroke, 'none', 0), circle(178, 73, 2.8, PAINT.coolStroke, 'none', 0)],
    paths: [],
  };
}

function buildIntervalTreeSpec(): PreviewSpec {
  return {
    rects: [
      rect(44, 14, 96, 10, PAINT.coolFill, PAINT.coolStroke, 5),
      rect(96, 30, 110, 10, PAINT.amberFill, PAINT.amberStroke, 5),
      rect(150, 46, 100, 10, PAINT.mintFill, PAINT.mintStroke, 5),
      rect(192, 62, 72, 10, PAINT.ghostFill, PAINT.ghostStroke, 5),
    ],
    lines: [line(182, 8, 182, 76, PAINT.roseStroke, 1.8, 0.94, '4 4')],
    circles: [circle(182, 8, 3, PAINT.roseFill, PAINT.roseStroke, 1.2), circle(182, 76, 3, PAINT.roseFill, PAINT.roseStroke, 1.2)],
    paths: [],
  };
}

function buildMultiwayTreeSpec(mode: 'b-tree' | 'b-plus'): PreviewSpec {
  const rects = [
    rect(116, 10, 88, 14, PAINT.amberFill, PAINT.amberStroke, 6),
    rect(28, 44, 52, 14, PAINT.ghostFill, PAINT.ghostStroke, 6),
    rect(96, 44, 52, 14, PAINT.ghostFill, PAINT.ghostStroke, 6),
    rect(172, 44, 52, 14, PAINT.ghostFill, PAINT.ghostStroke, 6),
    rect(240, 44, 52, 14, PAINT.ghostFill, PAINT.ghostStroke, 6),
  ];
  const lines = [
    line(132, 24, 54, 44, PAINT.ghostStroke, 1.8),
    line(148, 24, 122, 44, PAINT.ghostStroke, 1.8),
    line(172, 24, 198, 44, PAINT.ghostStroke, 1.8),
    line(188, 24, 266, 44, PAINT.ghostStroke, 1.8),
  ];
  const paths = [
    path('M 146 10 L 146 24', 'none', PAINT.ghostStroke, 1.3),
    path('M 174 10 L 174 24', 'none', PAINT.ghostStroke, 1.3),
    path('M 54 44 L 54 58', 'none', PAINT.ghostStroke, 1.2),
    path('M 122 44 L 122 58', 'none', PAINT.ghostStroke, 1.2),
    path('M 198 44 L 198 58', 'none', PAINT.ghostStroke, 1.2),
    path('M 266 44 L 266 58', 'none', PAINT.ghostStroke, 1.2),
  ];

  if (mode === 'b-plus') {
    lines.push(line(54, 68, 266, 68, PAINT.coolStroke, 1.8));
    return {
      rects: [...rects, rect(28, 62, 52, 10, PAINT.coolFill, PAINT.coolStroke, 5), rect(96, 62, 52, 10, PAINT.coolFill, PAINT.coolStroke, 5), rect(172, 62, 52, 10, PAINT.coolFill, PAINT.coolStroke, 5), rect(240, 62, 52, 10, PAINT.coolFill, PAINT.coolStroke, 5)],
      lines,
      circles: [],
      paths,
    };
  }

  return { rects, lines, circles: [], paths };
}

function buildSkipListSpec(): PreviewSpec {
  const lines: PreviewLine[] = [];
  const rects: PreviewRect[] = [];
  const levels = [18, 32, 46, 60];
  const xs = [46, 94, 142, 190, 238];

  levels.forEach((y, levelIndex) => {
    lines.push(line(28, y, 286, y, PAINT.mutedStroke, 1.4));
    xs.forEach((x, index) => {
      const towerHeight = index === 1 ? 4 : index === 3 ? 3 : index === 4 ? 2 : 1;
      if (levelIndex >= levels.length - towerHeight) {
        rects.push(rect(x - 10, y - 5, 20, 10, levelIndex === levels.length - towerHeight ? PAINT.amberFill : PAINT.ghostFill, levelIndex === levels.length - towerHeight ? PAINT.amberStroke : PAINT.ghostStroke, 4, 1.2));
      }
    });
  });

  xs.forEach((x) => lines.push(line(x, 18, x, 60, PAINT.ghostStroke, 1.2)));
  return { rects, lines, circles: [], paths: [] };
}

function buildKdTreeSpec(): PreviewSpec {
  return {
    rects: [rect(44, 10, 232, 60, 'rgba(255,255,255,0.02)', PAINT.ghostStroke, 10, 1.2)],
    lines: [
      line(160, 10, 160, 70, PAINT.coolStroke, 1.8),
      line(160, 30, 276, 30, PAINT.amberStroke, 1.8),
      line(44, 48, 160, 48, PAINT.mintStroke, 1.8),
      line(222, 30, 222, 70, PAINT.coolStroke, 1.4, 0.7),
    ],
    circles: [
      circle(88, 28, 4.2, PAINT.coolFill, PAINT.coolStroke, 1.4),
      circle(118, 56, 4.2, PAINT.mintFill, PAINT.mintStroke, 1.4),
      circle(204, 18, 4.2, PAINT.amberFill, PAINT.amberStroke, 1.4),
      circle(244, 42, 4.2, PAINT.coolFill, PAINT.coolStroke, 1.4),
      circle(188, 58, 4.2, PAINT.ghostFill, PAINT.ghostStroke, 1.4),
    ],
    paths: [],
  };
}

function buildQuadtreeSpec(): PreviewSpec {
  return {
    rects: [
      rect(76, 8, 168, 68, 'rgba(255,255,255,0.02)', PAINT.ghostStroke, 8, 1.2),
      rect(76, 8, 84, 34, 'transparent', PAINT.coolStroke, 6, 1.2),
      rect(160, 8, 84, 34, 'transparent', PAINT.amberStroke, 6, 1.2),
      rect(76, 42, 84, 34, 'transparent', PAINT.mintStroke, 6, 1.2),
      rect(160, 42, 84, 34, 'transparent', PAINT.ghostStroke, 6, 1.2),
      rect(160, 42, 42, 17, 'transparent', PAINT.roseStroke, 5, 1.1),
      rect(202, 42, 42, 17, 'transparent', PAINT.coolStroke, 5, 1.1),
    ],
    lines: [],
    circles: [
      circle(106, 24, 3.6, PAINT.coolFill, PAINT.coolStroke, 1.2),
      circle(196, 24, 3.6, PAINT.amberFill, PAINT.amberStroke, 1.2),
      circle(116, 60, 3.6, PAINT.mintFill, PAINT.mintStroke, 1.2),
      circle(178, 50, 3.6, PAINT.roseFill, PAINT.roseStroke, 1.2),
      circle(222, 50, 3.6, PAINT.coolFill, PAINT.coolStroke, 1.2),
    ],
    paths: [],
  };
}

function buildLinkCutSpec(): PreviewSpec {
  const lines = [
    line(60, 18, 110, 34, PAINT.ghostStroke, 1.8),
    line(110, 34, 156, 18, PAINT.coolStroke, 2.6),
    line(156, 18, 208, 34, PAINT.coolStroke, 2.6),
    line(208, 34, 256, 18, PAINT.ghostStroke, 1.8),
    line(156, 18, 156, 58, PAINT.coolStroke, 2.6),
    line(208, 34, 246, 58, PAINT.ghostStroke, 1.8, 0.9, '4 4'),
  ];
  const circles = [
    circle(60, 18, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(110, 34, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(156, 18, 5.8, PAINT.coolFill, PAINT.coolStroke, 1.8),
    circle(208, 34, 5.8, PAINT.coolFill, PAINT.coolStroke, 1.8),
    circle(256, 18, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
    circle(156, 58, 5.8, PAINT.coolFill, PAINT.coolStroke, 1.8),
    circle(246, 58, 5, PAINT.roseFill, PAINT.roseStroke, 1.6),
  ];
  return { rects: [], lines, circles, paths: [] };
}

function buildHldSpec(): PreviewSpec {
  const lines = [
    line(160, 12, 160, 60, PAINT.amberStroke, 3.2),
    line(160, 12, 110, 28, PAINT.ghostStroke, 1.6),
    line(160, 28, 216, 44, PAINT.ghostStroke, 1.6),
    line(160, 44, 116, 62, PAINT.ghostStroke, 1.6),
    line(110, 28, 80, 48, PAINT.ghostStroke, 1.6),
    line(216, 44, 250, 62, PAINT.ghostStroke, 1.6),
  ];
  const circles = [
    circle(160, 12, 5.6, PAINT.amberFill, PAINT.amberStroke, 1.8),
    circle(160, 28, 5.6, PAINT.amberFill, PAINT.amberStroke, 1.8),
    circle(160, 44, 5.6, PAINT.amberFill, PAINT.amberStroke, 1.8),
    circle(160, 60, 5.6, PAINT.amberFill, PAINT.amberStroke, 1.8),
    circle(110, 28, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.5),
    circle(216, 44, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.5),
    circle(116, 62, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.5),
    circle(80, 48, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.5),
    circle(250, 62, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.5),
  ];
  return { rects: [], lines, circles, paths: [] };
}

function buildCentroidSpec(): PreviewSpec {
  return {
    rects: [],
    lines: [
      line(92, 24, 160, 42, PAINT.ghostStroke, 1.6),
      line(228, 24, 160, 42, PAINT.ghostStroke, 1.6),
      line(64, 60, 160, 42, PAINT.ghostStroke, 1.6),
      line(256, 60, 160, 42, PAINT.ghostStroke, 1.6),
      line(132, 62, 160, 42, PAINT.ghostStroke, 1.6),
      line(188, 62, 160, 42, PAINT.ghostStroke, 1.6),
    ],
    circles: [
      circle(160, 42, 7, PAINT.amberFill, PAINT.amberStroke, 2),
      circle(92, 24, 5, PAINT.coolFill, PAINT.coolStroke, 1.6),
      circle(228, 24, 5, PAINT.coolFill, PAINT.coolStroke, 1.6),
      circle(64, 60, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
      circle(256, 60, 5, PAINT.ghostFill, PAINT.ghostStroke, 1.6),
      circle(132, 62, 5, PAINT.mintFill, PAINT.mintStroke, 1.6),
      circle(188, 62, 5, PAINT.mintFill, PAINT.mintStroke, 1.6),
    ],
    paths: [
      path('M 160 22 A 20 20 0 1 1 159.9 22', 'none', PAINT.amberSoft, 1.4, 0.9),
      path('M 160 10 A 32 32 0 1 1 159.9 10', 'none', PAINT.coolStroke, 1.2, 0.36),
    ],
  };
}

function buildVebSpec(): PreviewSpec {
  return {
    rects: [
      rect(74, 10, 172, 58, 'rgba(255,255,255,0.02)', PAINT.ghostStroke, 10, 1.2),
      rect(88, 22, 56, 18, PAINT.coolFill, PAINT.coolStroke, 6, 1.2),
      rect(154, 22, 56, 18, PAINT.amberFill, PAINT.amberStroke, 6, 1.2),
      rect(220, 22, 16, 18, PAINT.ghostFill, PAINT.ghostStroke, 4, 1.1),
      rect(94, 48, 36, 12, PAINT.ghostFill, PAINT.ghostStroke, 5, 1.1),
      rect(160, 48, 36, 12, PAINT.ghostFill, PAINT.ghostStroke, 5, 1.1),
      rect(226, 48, 16, 12, PAINT.ghostFill, PAINT.ghostStroke, 4, 1.1),
    ],
    lines: [
      line(116, 40, 112, 48, PAINT.coolStroke, 1.4),
      line(182, 40, 178, 48, PAINT.amberStroke, 1.4),
      line(228, 40, 234, 48, PAINT.ghostStroke, 1.2),
    ],
    circles: [circle(62, 40, 7, PAINT.mintFill, PAINT.mintStroke, 1.8)],
    paths: [path('M 62 40 C 80 30, 92 28, 88 22', 'none', PAINT.mintStroke, 1.8)],
  };
}

function buildBloomSpec(): PreviewSpec {
  const rects = Array.from({ length: 12 }, (_, index) =>
    rect(96 + index * 14, 54, 10, 10, [2, 6, 9].includes(index) ? PAINT.mintFill : PAINT.ghostFill, [2, 6, 9].includes(index) ? PAINT.mintStroke : PAINT.ghostStroke, 3, 1),
  );
  return {
    rects,
    lines: [],
    circles: [circle(46, 26, 8, PAINT.coolFill, PAINT.coolStroke, 1.8)],
    paths: [
      path('M 54 26 C 88 18, 112 26, 124 54', 'none', PAINT.coolStroke, 1.6),
      path('M 54 26 C 92 8, 152 18, 180 54', 'none', PAINT.coolStroke, 1.6),
      path('M 54 26 C 102 24, 196 8, 222 54', 'none', PAINT.coolStroke, 1.6),
    ],
  };
}

function buildHyperLogLogSpec(): PreviewSpec {
  const heights = [18, 24, 12, 34, 28, 20, 38, 16, 30, 22];
  return {
    rects: heights.map((height, index) =>
      rect(36 + index * 24, 70 - height, 16, height, index === 6 ? PAINT.mintFill : PAINT.amberFill, index === 6 ? PAINT.mintStroke : PAINT.amberStroke, 5, 1.1),
    ),
    lines: [],
    circles: [],
    paths: [path('M 28 54 C 76 28, 122 44, 166 24 C 208 8, 248 26, 292 18', 'none', PAINT.coolStroke, 1.8, 0.92)],
  };
}

function buildConsistentHashingSpec(): PreviewSpec {
  const nodeAngles = [220, 295, 18, 92, 152];
  const keyAngles = [250, 338, 126];
  const ringCx = 160;
  const ringCy = 42;
  const radius = 28;
  const circles: PreviewCircle[] = [circle(ringCx, ringCy, radius, 'transparent', PAINT.amberStroke, 1.8)];
  const paths: PreviewPath[] = [];

  nodeAngles.forEach((angle) => {
    const rad = (angle * Math.PI) / 180;
    circles.push(
      circle(
        ringCx + Math.cos(rad) * radius,
        ringCy + Math.sin(rad) * radius,
        4.8,
        PAINT.amberFill,
        PAINT.amberStroke,
        1.5,
      ),
    );
  });

  keyAngles.forEach((angle, index) => {
    const rad = (angle * Math.PI) / 180;
    const keyX = ringCx + Math.cos(rad) * 48;
    const keyY = ringCy + Math.sin(rad) * 48;
    const targetRad = ((nodeAngles[index + 1] ?? nodeAngles[0]) * Math.PI) / 180;
    const targetX = ringCx + Math.cos(targetRad) * radius;
    const targetY = ringCy + Math.sin(targetRad) * radius;
    circles.push(circle(keyX, keyY, 3.8, PAINT.coolFill, PAINT.coolStroke, 1.3));
    paths.push(path(`M ${keyX} ${keyY} Q ${ringCx} ${ringCy} ${targetX} ${targetY}`, 'none', PAINT.coolStroke, 1.5, 0.78, '4 4'));
  });

  return { rects: [], lines: [], circles, paths };
}

function buildPreviewSpec(structure: StructureItem): PreviewSpec {
  switch (structure.id) {
    case 'stack':
      return buildStackSpec();
    case 'queue':
      return buildQueueSpec();
    case 'deque':
      return buildDequeSpec();
    case 'circular-buffer':
      return buildCircularBufferSpec();
    case 'singly-linked-list':
      return buildLinkedListSpec(false);
    case 'doubly-linked-list':
      return buildLinkedListSpec(true);
    case 'disjoint-set-union':
      return buildDsuSpec();
    case 'hash-table-open-addressing':
      return buildHashOpenSpec();
    case 'hash-table-chaining':
      return buildHashChainingSpec();
    case 'bst':
      return buildBstFamilySpec('bst');
    case 'avl-tree':
      return buildBstFamilySpec('avl');
    case 'red-black-tree':
      return buildBstFamilySpec('red-black');
    case 'splay-tree':
      return buildBstFamilySpec('splay');
    case 'treap':
      return buildBstFamilySpec('treap');
    case 'min-max-heap':
      return buildHeapSpec(false);
    case 'priority-queue':
      return buildHeapSpec(true);
    case 'trie':
      return buildTrieSpec('trie');
    case 'suffix-tree':
      return buildTrieSpec('suffix-tree');
    case 'suffix-automaton':
      return buildTrieSpec('suffix-automaton');
    case 'segment-tree':
      return buildSegmentFamilySpec('segment');
    case 'sparse-table':
      return buildSparseTableSpec();
    case 'segment-tree-lazy':
      return buildSegmentFamilySpec('lazy');
    case 'fenwick-tree':
      return buildSegmentFamilySpec('fenwick');
    case 'interval-tree':
      return buildIntervalTreeSpec();
    case 'persistent-segment-tree':
      return buildSegmentFamilySpec('persistent');
    case 'wavelet-tree':
      return buildSegmentFamilySpec('wavelet');
    case 'b-tree':
      return buildMultiwayTreeSpec('b-tree');
    case 'b-plus-tree':
      return buildMultiwayTreeSpec('b-plus');
    case 'skip-list':
      return buildSkipListSpec();
    case 'kd-tree':
      return buildKdTreeSpec();
    case 'quadtree':
      return buildQuadtreeSpec();
    case 'link-cut-tree':
      return buildLinkCutSpec();
    case 'heavy-light-decomposition':
      return buildHldSpec();
    case 'centroid-decomposition':
      return buildCentroidSpec();
    case 'van-emde-boas-tree':
      return buildVebSpec();
    case 'bloom-filter':
      return buildBloomSpec();
    case 'hyperloglog':
      return buildHyperLogLogSpec();
    case 'consistent-hashing':
      return buildConsistentHashingSpec();
    default:
      return EMPTY_SPEC;
  }
}

@Component({
  selector: 'app-structure-card-preview',
  imports: [],
  templateUrl: './structure-card-preview.html',
  styleUrl: './structure-card-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureCardPreview {
  readonly structure = input.required<StructureItem>();
  readonly spec = computed(() => buildPreviewSpec(this.structure()));
}
