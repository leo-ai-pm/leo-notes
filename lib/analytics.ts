import { getDb } from '@/db';
import { articles } from '@/lib/content';

export function chinaDay(now: number): string {
  return new Date(now + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export async function recordClick(eventId: string, articleId: string, now = Date.now()) {
  await getDb().prepare('INSERT OR IGNORE INTO article_clicks (event_id, article_id, clicked_at, day) VALUES (?, ?, ?, ?)')
    .bind(eventId, articleId, now, chinaDay(now)).run();
}
export async function readStats(now = Date.now()) {
  const today = chinaDay(now);
  const weekStart = chinaDay(now - 6 * 86400000);
  const monthStart = chinaDay(now - 29 * 86400000);
  const { results } = await getDb().prepare(`SELECT article_id, COUNT(*) AS total,
    SUM(CASE WHEN day = ? THEN 1 ELSE 0 END) AS today,
    SUM(CASE WHEN day >= ? THEN 1 ELSE 0 END) AS week,
    SUM(CASE WHEN day >= ? THEN 1 ELSE 0 END) AS month,
    MAX(clicked_at) AS last_click
    FROM article_clicks GROUP BY article_id`)
    .bind(today, weekStart, monthStart)
    .all<{article_id: string; total: number; today: number; week: number; month: number; last_click: number}>();
  const rows = articles.map(article => {
    const count = results.find(row => row.article_id === article.id);
    return { id: article.id, title: article.title, total: count?.total ?? 0, today: count?.today ?? 0,
      week: count?.week ?? 0, month: count?.month ?? 0, lastClick: count?.last_click ?? null };
  });
  const totals = rows.reduce((sum, row) => ({today:sum.today+row.today,week:sum.week+row.week,month:sum.month+row.month,total:sum.total+row.total}), {today:0,week:0,month:0,total:0});
  return {rows, totals, updatedAt: new Date(now).toISOString(), timeZone:'Asia/Shanghai'};
}
export type AnalyticsStats = Awaited<ReturnType<typeof readStats>>;
