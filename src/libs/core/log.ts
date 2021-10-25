const getElapsedSecondMessage = (startSecond: number) =>
  `elapsed - ${(new Date().getTime() / 1000 - startSecond).toFixed(3)}(s)`;

export const createLogger = (prefix: string) => {
  const start = new Date().getTime() / 1000;
  return {
    log: (...args: any) => console.log(`[${prefix}]${args[0]} [${getElapsedSecondMessage(start)}]`, ...args.slice(1)),
    error: (...args: any) =>
      console.error(`[${prefix}]${args[0]} [${getElapsedSecondMessage(start)}]`, ...args.slice(1)),
  };
};
