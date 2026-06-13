/* eslint-disable no-console */
type Level = 'debug' | 'info' | 'warn' | 'error';

const MIN_LEVEL: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel: Level = import.meta.env.PROD ? 'warn' : 'debug';

/**
 * Frontend structured logger — suppresses debug/info in production.
 */
export function flog(tag: string) {
    const prefix = `[${tag}]`;
    const shouldLog = (level: Level) => MIN_LEVEL[level] >= MIN_LEVEL[currentLevel];
    return {
        debug: (...args: unknown[]) => shouldLog('debug') && console.debug(prefix, ...args),
        info: (...args: unknown[]) => shouldLog('info') && console.info(prefix, ...args),
        warn: (...args: unknown[]) => shouldLog('warn') && console.warn(prefix, ...args),
        error: (...args: unknown[]) => shouldLog('error') && console.error(prefix, ...args),
    };
}
