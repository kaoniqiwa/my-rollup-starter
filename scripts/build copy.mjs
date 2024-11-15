import { rollup, defineConfig, watch } from 'rollup';
import { minify } from 'terser';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import {
  accessSync,
  mkdirSync,
  createReadStream,
  createWriteStream,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gzip } from 'node:zlib';
import { exit } from 'node:process';
import configs from './config.mjs';
import Stats from './stats.mjs';

/**
 * @typedef {import('rollup').InputOptions} InputOptions
 * @typedef {import('rollup').OutputOptions} OutputOptions
 * @typedef {import('rollup').RollupBuild} RollupBuild
 * @typedef {{input:InputOptions,output:OutputOptions}} Config
 *
 **/

const stats = new Stats();

// 保证 _dirname 一直是项目根目录 -- 不用 process.cwd()
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(dirname(__filename), '../');

function build(configs) {
  for (let config of configs) {
    console.log('====================');
    // console.log(config);
    buildEntry(config);
  }
}

async function buildEntry({ inputOptions, outputOptions }) {
  const { file } = outputOptions;
  const source = inputOptions.input;

  if (!Array.isArray(outputOptions)) {
    outputOptions = [outputOptions];
  }
  // console.log(inputOptions);

  /**生产环境的文件需要压缩 */
  const isProd = /\.min\.js$/.test(file);

  stats.time(source);

  /**注意目录的权限问题 chmod */
  try {
    accessSync(dirname(file));
  } catch (e) {
    // 父目录没有写权限，也是无效的
    mkdirSync(dirname(file), { recursive: true, mode: 0o777 });
  }

  /**@type {RollupBuild} */
  let bundle;
  let buildFailed = false;

  try {
    bundle = await rollup(inputOptions);

    const { generate, watchFiles } = bundle;
    console.log(watchFiles);

    for (let outputOption of outputOptions) {
      const { output: rollupOutput } = await generate(outputOption);
      console.log(rollupOutput);

      for (let chunkOrAsset of rollupOutput) {
        if (chunkOrAsset.type === 'chunk') {
          console.log('chunk');
          console.log(chunkOrAsset.modules);

          // const code = chunkOrAsset.code;
          // if (isProd) {
          //   const minifyOutput = await minify(code, {
          //     toplevel: true,
          //     output: {
          //       ascii_only: true /**将 unicode 字符集收缩为 ascii 字符集 */,
          //     },
          //     compress: {
          //       pure_funcs: ['makeMap'],
          //     },
          //   });
          //   await write(source, file, minifyOutput.code, true);
          // } else {
          //   await write(source, file, code);
          // }
        } else if (chunkOrAsset.type === 'asset') {
          console.log('asset');
        }
      }
    }

    // console.log(rollupOutput);
  } catch (e) {
    buildFailed = true;
    console.error(e);
  }

  if (bundle) {
    bundle.close();
  }
  exit(buildFailed ? 1 : 0);
}

function generateOutputs(bundle) {}
/**
 *
 * @param {string} source - chunk 对应的模块
 * @param {string} dest - 写入路径
 * @param {string} code - 写入内容
 * @param {boolean} zip - 是否gzip压缩
 *
 */
async function write(source, dest, code, zip = false) {
  function report(extra = '') {
    console.log(
      '\n' +
        blue(relative(__dirname, source) + ' → ' + relative(__dirname, dest)) +
        ' ' +
        getSize(code) +
        extra
    );
    console.log(
      green(`created ${relative(process.cwd(), dest)} in ${stats[source]}ms`)
    );
  }
  await writeFile(dest, code);
  stats.timeEnd(source);

  if (zip) {
    gzip(code, (err, zipped) => {
      if (err) return reject(err);
      report(' (gzipped: ' + getSize(zipped) + ')');
    });
    return;
  }
  report();
}
/**
 * 在控制台打印特殊颜色
 * '\x1b' 为 esc 控制符的 ASCII 码，表示后面的字符为转义字符
 * '[' => 转义开始
 *  '1' => 代表加粗
 *  'm' => 转义结束
 *  '34' => 前景色蓝色
 *  '39' => 默认前景色
 *  '22' => 正常颜色
 *
 */
function blue(str) {
  return '\x1b[1m\x1b[36m' + str + '\x1b[39m\x1b[22m';
}

function green(str) {
  return '\x1b[1m\x1b[32m' + str + '\x1b[39m\x1b[22m';
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb';
}
build(configs);
