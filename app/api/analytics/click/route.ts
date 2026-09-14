import { articles } from '@/lib/content';
import { recordClick } from '@/lib/analytics';
export const dynamic = 'force-dynamic';
const noCache = { 'Cache-Control': 'no-store', Vary: 'Origin' };
const pagesOrigin = 'https://leo-ai-pm.github.io';
function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin || origin === pagesOrigin;
}
function responseHeaders(request: Request) {
  return request.headers.get('origin') === pagesOrigin
    ? {...noCache, 'Access-Control-Allow-Origin': pagesOrigin}
    : noCache;
}
export function OPTIONS(request: Request) {
  if (!allowedOrigin(request)) return new Response(null,{status:403,headers:noCache});
  if (request.headers.get('access-control-request-method') !== 'POST') return new Response(null,{status:405,headers:noCache});
  return new Response(null,{status:204,headers:{...responseHeaders(request),'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
}
export async function POST(request: Request) {
  // Only this Site and Leo's GitHub Pages homepage may submit browser events.
  if (!allowedOrigin(request)) {
    return new Response(null, {status:403,headers:noCache});
  }
  const headers = responseHeaders(request);
  const mediaType = request.headers.get('content-type')?.split(';')[0];
  if (mediaType !== 'application/json') return new Response(null,{status:415,headers});
  if (Number(request.headers.get('content-length') || 0) > 512) return new Response(null,{status:413,headers});
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 512) return new Response(null,{status:413,headers});
    body = JSON.parse(text);
  } catch { return new Response(null,{status:400,headers}); }
  if (!body || typeof body !== 'object') return new Response(null,{status:400,headers});
  const {eventId,articleId} = body as Record<string,unknown>;
  if (typeof eventId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)
    || typeof articleId !== 'string' || !articles.some(article => article.id === articleId)) {
    return new Response(null,{status:400,headers});
  }
  try {
    await recordClick(eventId, articleId);
    return new Response(null,{status:204,headers});
  } catch {
    return new Response(null,{status:503,headers});
  }
}
