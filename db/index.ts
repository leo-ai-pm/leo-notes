import { env } from 'cloudflare:workers';
export function getDb(): D1Database {
  if (!env.DB) throw new Error('Analytics database unavailable');
  return env.DB;
}
