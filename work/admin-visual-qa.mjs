import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('/Users/omarparreira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const project = '/Users/omarparreira/Documents/Codex/2026-08-21/h/outputs/orbit-app';
const reference = '/Users/omarparreira/Documents/Codex/2026-08-21/h/work/figma-admin';

const comparisons = [
  ['admin-light-populated.png', 'admin-dashboard-final-light.jpg', 'admin-dashboard-light-comparison.png', 'ADMIN LIGHT — FIGMA', 'ADMIN LIGHT — IMPLEMENTATION'],
  ['admin-dark-populated.png', 'admin-dashboard-final-dark.jpg', 'admin-dashboard-dark-comparison.png', 'ADMIN DARK — FIGMA', 'ADMIN DARK — IMPLEMENTATION'],
  ['admin-light-empty.png', 'admin-dashboard-final-light-empty.jpg', 'admin-dashboard-light-empty-comparison.png', 'ADMIN LIGHT EMPTY — FIGMA', 'ADMIN LIGHT EMPTY — IMPLEMENTATION'],
  ['admin-dark-empty.png', 'admin-dashboard-final-dark-empty.jpg', 'admin-dashboard-dark-empty-comparison.png', 'ADMIN DARK EMPTY — FIGMA', 'ADMIN DARK EMPTY — IMPLEMENTATION'],
];

const escapeXml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
})[character]);

for (const [referenceName, implementationName, outputName, leftLabel, rightLabel] of comparisons) {
  const left = await sharp(`${reference}/${referenceName}`).resize(1920, 1397, { fit: 'fill' }).png().toBuffer();
  const right = await sharp(`${project}/screenshots/${implementationName}`).resize(1920, 1397, { fit: 'fill' }).png().toBuffer();
  const header = Buffer.from(`
    <svg width="3840" height="54" xmlns="http://www.w3.org/2000/svg">
      <rect width="3840" height="54" fill="#101312"/>
      <text x="28" y="35" fill="#ffffff" font-size="22" font-family="Arial, sans-serif" font-weight="700">${escapeXml(leftLabel)}</text>
      <text x="1948" y="35" fill="#ffffff" font-size="22" font-family="Arial, sans-serif" font-weight="700">${escapeXml(rightLabel)}</text>
      <rect x="1919" width="2" height="54" fill="#97cc50"/>
    </svg>
  `);

  await sharp({
    create: { width: 3840, height: 1451, channels: 3, background: '#101312' },
  })
    .composite([
      { input: header, left: 0, top: 0 },
      { input: left, left: 0, top: 54 },
      { input: right, left: 1920, top: 54 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(`${project}/screenshots/${outputName}`);
}

const baselinePath = `${project}/screenshots/regression-dashboard-after-team.png`;
const currentPath = `${project}/screenshots/admin-phase-superadmin-after.jpg`;
const baseline = await sharp(baselinePath).resize(1920, 1397, { fit: 'fill' }).removeAlpha().raw().toBuffer();
const current = await sharp(currentPath).resize(1920, 1397, { fit: 'fill' }).removeAlpha().raw().toBuffer();
const diff = Buffer.alloc(baseline.length);
let total = 0;
let changedOverEight = 0;
let maximum = 0;

for (let index = 0; index < baseline.length; index += 1) {
  const delta = Math.abs(baseline[index] - current[index]);
  total += delta;
  if (delta > 8) changedOverEight += 1;
  if (delta > maximum) maximum = delta;
  diff[index] = Math.min(255, delta * 5);
}

await sharp(diff, { raw: { width: 1920, height: 1397, channels: 3 } })
  .png({ compressionLevel: 9 })
  .toFile(`${project}/screenshots/admin-phase-superadmin-diff.png`);

console.log(JSON.stringify({
  comparisonFiles: comparisons.map(([, , outputName]) => `screenshots/${outputName}`),
  superadminRegression: {
    meanAbsoluteChannelDelta: Number((total / baseline.length).toFixed(3)),
    changedChannelsOverEightPercent: Number((changedOverEight / baseline.length * 100).toFixed(3)),
    maximumChannelDelta: maximum,
  },
}, null, 2));
