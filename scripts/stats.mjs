// import { hrtime } from 'node:process';

// export default class Stats {
//   collapse = {};

//   time(label) {
//     this.collapse[label]['start'] = hrtime.bigint();
//   }
//   timeEnd() {
//     // const endTimes = hrtime(startTimes[label]);
//     // return endTimes[0] * 1000 + endTimes[1] / 1e6;
//     const start = this.collapse['start'] || 0;
//     this.collapse[label]['end'] = hrtime.bigint();
//   }
//   format() {
//     return ((this.collapse[label]['end'] - this.collapse[label]['start']) * 1e-6;
//   }
// }

export default class Stats {
  startTimes = {};

  constructor() {
    Object.defineProperty(this, 'startTimes', {
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }
  time(label) {
    this.startTimes[label] = process.hrtime();
  }
  // 计算进程消耗时间
  timeEnd(label) {
    const elapsed = process.hrtime(this.startTimes[label]);
    if (!this[label]) this[label] = 0;
    // seconds*1e3 + nanoseconds*1e-6 => 毫秒
    this[label] += (elapsed[0] * 1e3 + elapsed[1] * 1e-6) >> 0;
  }
}
