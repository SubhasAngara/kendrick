import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/kendrick-buildverse-pitch.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
const slideCount = (html.match(/<section class="slide/g) || []).length;
const requirements = [
  'Fictional composite scenario',
  'Not faster dictation',
  'Kendrick complements rather than replaces established AAC systems',
  'Qwen 2.5',
  'through Ollama',
  'Require human approval',
  'The next milestone is not a bigger claim',
  '@media print',
];

new Function(scripts);
if (slideCount !== 12) throw new Error(`Expected 12 slides, got ${slideCount}.`);

for (const requirement of requirements) {
  if (!html.includes(requirement)) throw new Error(`Missing pitch requirement: ${requirement}`);
}

console.log(`Pitch validation passed: ${slideCount} slides, valid navigation script, print layout, and required competitive framing.`);
