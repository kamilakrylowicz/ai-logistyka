import { createClient } from '@supabase/supabase-js';
import { rootLog } from './logger.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    rootLog.warn('Supabase env vars not set — server Supabase client unavailable');
}

export const supabase = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;
