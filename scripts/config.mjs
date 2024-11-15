import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';
import { createRequire } from 'node:module';
import replace from '@rollup/plugin-replace';
import buble from '@rollup/plugin-buble';
import typescript from '@rollup/plugin-typescript';

// import  { InputOptions, OutputOptions, Plugin } from 'rollup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolve = (_path) => path.resolve(__dirname, '../', _path);

const require = createRequire(__filename);
const pkg = require('../package.json');

/**
 * @typedef {import('rollup').OutputOptions}  OutputOptions
 */
/**@type {OutputOptions['banner']} */
const banner = `/*!
  * my-rollup-starter-lib v${pkg.version}
  * (c) ${new Date().getFullYear()} kaoniqiwa
  * @license ${pkg.license || 'MIT'}
  */`;

// interface Options {
//   file: string;
//   format: OutputOptions['format'];
//   name?: string;
//   globals?: OutputOptions['globals'];
//   env: string;
//   transpile?: boolean;
//   exports?: OutputOptions['exports'];
// }

/**
 *
 * @typedef {{file: string;format: OutputOptions['format'];name?: string;globals?: OutputOptions['globals'];env: string;transpile?: boolean;exports?: OutputOptions['exports'];}} Options
 * @param {Options} opts
 */
function getConfig(opts) {
  /**@type {InputOptions & { plugins: Array<Plugin> }} */
  const inputOptions = {
    input: {
      a: resolve('src/a.ts'),
      b: resolve('src/b.ts'),
    },
    plugins: [typescript()],
  };
  /**@type {OutputOptions} */
  const outputOptions = {
    dir: opts.dir,
    // file: opts.file,
    format: opts.format,
    banner,
    exports: opts.exports || 'auto',
    // sourcemap: true,
  };
  const config = {
    inputOptions,
    outputOptions,
  };
  if (['umd', 'iife'].includes(opts.format)) {
    outputOptions.name = opts.name;
    outputOptions.globals = opts.globals;
  }
  if (opts.env) {
    inputOptions.plugins.push(
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(opts.env),
      })
    );
  }
  // 如果需要降级
  if (opts.transpile !== false) {
    inputOptions.plugins.push(buble());
  }

  return config;
}

export default [
  // {
  //   file: resolve(pkg.browser),
  //   format: 'umd',
  //   name: 'howLongUntilLunch',
  //   globals: {
  //     ms: 'ms',
  //   },
  //   env: 'development',
  // },
  // {
  //   file: resolve(pkg.browser.replace(/\.js$/, '.min.js')),
  //   format: 'umd',
  //   name: 'howLongUntilLunch',
  //   globals: {
  //     ms: 'ms',
  //   },
  //   env: 'production',
  // },
  // {
  //   file: resolve(pkg.main),
  //   format: 'cjs',
  //   env: 'development',
  // },
  // {
  //   file: resolve(pkg.main.replace(/\.js$/, '.min.js')),
  //   format: 'cjs',
  //   env: 'production',
  // },
  {
    file: resolve(pkg.module),
    dir: resolve('dist'),
    format: 'es',
    env: 'development',
    transpile: false,
  },
  // {
  //   file: resolve(pkg.module.replace(/\.js$/, '.min.js')),
  //   format: 'es',
  //   env: 'production',
  //   transpile: false,
  // },
].map(getConfig);
