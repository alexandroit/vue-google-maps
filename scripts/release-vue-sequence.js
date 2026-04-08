import { releaseVueLine } from './release-vue-line.js';

const publish = !process.argv.slice(2).includes('--no-publish');

[2, 3].forEach((line) => {
  releaseVueLine(line, { publish });
});
