import { articles as bundledArticles, type Article } from './content';

const catalogUrl = 'https://leo-ai-pm.github.io/leo-notes/articles.json';
let cached: {articles: Article[]; expires: number} | undefined;

export function validateCatalog(value: unknown): Article[] {
  if (!value || typeof value !== 'object') throw new Error('Invalid article catalog');
  const catalog = value as Record<string, unknown>;
  if (catalog.version !== 1 || catalog.account !== 'Leo-AIpm' || !Array.isArray(catalog.articles)
      || !catalog.articles.length || catalog.articles.length > 5000) throw new Error('Invalid article catalog');
  const ids = new Set<string>();
  return catalog.articles.map((item: Article) => {
    if (!item || typeof item.id !== 'string' || !/^[\w-]{1,100}$/.test(item.id) || ids.has(item.id)
        || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 300
        || typeof item.excerpt !== 'string' || item.excerpt.length > 1000
        || typeof item.category !== 'string' || item.category.length > 100
        || typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)
        || typeof item.wechatUrl !== 'string') throw new Error('Invalid article');
    const url = new URL(item.wechatUrl);
    if (url.origin !== 'https://mp.weixin.qq.com' || !/^\/s(?:\/|$)/.test(url.pathname)
        || url.username || url.password || url.searchParams.has('token')) throw new Error('Invalid article URL');
    ids.add(item.id);
    return {id:item.id,title:item.title,excerpt:item.excerpt,category:item.category,date:item.date,wechatUrl:item.wechatUrl};
  });
}

// A fixed, public catalog is the allowlist. Never trust an article title or URL
// supplied by a click request. Retain the last good copy on network failures.
export async function getPublishedArticles(): Promise<Article[]> {
  if (cached && cached.expires > Date.now()) return cached.articles;
  try {
    const response = await fetch(catalogUrl, {signal:AbortSignal.timeout(5000),cache:'no-store'});
    if (!response.ok) throw new Error('Catalog unavailable');
    const text = await response.text();
    if (text.length > 1_000_000) throw new Error('Catalog too large');
    const articles = validateCatalog(JSON.parse(text));
    cached = {articles,expires:Date.now()+60_000};
    return articles;
  } catch {
    return cached?.articles ?? bundledArticles;
  }
}
