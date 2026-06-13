import { z } from 'zod';
import { rootLog } from './logger.js';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000').transform(Number),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    VITE_SUPABASE_URL: z.string().optional(),
    LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    rootLog.error({ errors: parsed.error.flatten() }, 'Invalid environment variables');
    process.exit(1);
}

export const config = parsed.data;
