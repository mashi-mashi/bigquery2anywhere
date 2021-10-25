const getElapsedSecondMessage = (startSecond: number) =>
  `elapsed ${(new Date().getTime() / 1000 - startSecond).toFixed(3)}(s)`;

const getUsageMemorySize = () => {
  const used = process.memoryUsage();
  const mb = (size: number) => `${Math.round((size / 1024 / 1024) * 100) / 100}`;
  return `rss ${mb(used.rss)}(MB) heap ${mb(used.heapTotal)}(MB)`;
};

export const createLogger = (prefix: string) => {
  const start = new Date().getTime() / 1000;
  return {
    log: (...args: any) =>
      console.log(
        `[${prefix}]${args[0]} [${getElapsedSecondMessage(start)}, ${getUsageMemorySize()}]`,
        ...args.slice(1)
      ),
    error: (...args: any) =>
      console.error(
        `[${prefix}]${args[0]} [${getElapsedSecondMessage(start)}, ${getUsageMemorySize()}]`,
        ...args.slice(1)
      ),
  };
};
