import { config } from './config.js';
import { rootLog } from './logger.js';

const log = rootLog.child({ module: 'server' });

log.info({ port: config.PORT, env: config.NODE_ENV }, 'Server starting');
