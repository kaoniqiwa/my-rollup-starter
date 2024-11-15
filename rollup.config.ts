import { defineConfig } from 'rollup';
import configs from './scripts/config.mjs';

export default defineConfig((commandArgs) => {
  return configs.map((config) => {
    return {
      input: config.input.input,
      output: config.output,
      plugins: config.input.plugins,
    };
  });
});
