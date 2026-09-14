import { articles } from '@/lib/content';
import { recordClick } from '@/lib/analytics';
export const dynamic = 'force-dynamic';
const noCache = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  // Browsers must send the event from this Site. No cross-site telemetry intake.
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return new Response(null, {status:403,headers:noCache});
  }
  const mediaType = request.headers.get('content-type')?.split(';')[0];
  if (mediaType !== 'application/json') return new Response(null,{status:415,headers:noCache});
  if (Number(request.headers.get('content-length') || 0) > 512) return new Response(null,{status:413,headers:noCache});
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 512) return new Response(null,{status:413,headers:noCache});
    body = JSON.parse(text);
  } catch { return new Response(null,{status:400,headers:noCache}); }
  if (!body || typeof body !== 'object') return new Response(null,{status:400,headers:noCache});
  const {eventId,articleId} = body as Record<string,unknown>;
  if (typeof eventId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId)
    || typeof articleId !== 'string' || !articles.some(article => article.id === articleId)) {
    return new Response(null,{status:400,headers:noCache});
  }
  try {
    await recordClick(eventId, articleId);
    return new Response(null,{status:204,headers:noCache});
  } catch {
    return new Response(null,{status:503,headers:noCache});
  }
}
