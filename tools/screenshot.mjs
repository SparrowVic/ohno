import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const [url, out, width = '1440', height = '900', scale = '1'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node tools/screenshot.mjs <url> <out.png> [width] [height] [scale]');
  process.exit(1);
}
const chrome = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const result = spawnSync(chrome, [
  '--headless=new',
  '--hide-scrollbars',
  `--window-size=${width},${height}`,
  `--force-device-scale-factor=${scale}`,
  '--virtual-time-budget=6000',
  `--screenshot=${resolve(out)}`,
  url,
], { stdio: 'ignore' });
process.exit(result.status ?? 1);
