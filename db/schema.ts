import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Each ID identifies a single click, never a person, browser or session.
export const articleClicks = sqliteTable('article_clicks', {
  eventId: text('event_id').primaryKey(),
  articleId: text('article_id').notNull(),
  clickedAt: integer('clicked_at').notNull(),
  day: text('day').notNull(),
}, table => [index('article_clicks_article_day_idx').on(table.articleId, table.day)]);
