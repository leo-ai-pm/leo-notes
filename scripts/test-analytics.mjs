import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const expectedArticles=JSON.parse(await readFile('public/articles.json','utf8')).articles.length;
const base=process.argv[2]||'http://localhost:3001';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw new Error('This test only writes to a local development site.');
const get=(path,options={})=>fetch(base+path,options);
const anonymous=await get('/api/admin/stats');assert.equal(anonymous.status,401);
assert.match(anonymous.headers.get('cache-control'),/no-store/);
const anonymousPage=await (await get('/admin')).text();assert.ok(anonymousPage.includes('使用 ChatGPT 登录'));assert.ok(!anonymousPage.includes('stat-card'));
const wrong=await get('/api/admin/stats',{headers:{'oai-authenticated-user-id':'someone-else','oai-authenticated-user-email':'someone@example.com'}});assert.ok([401,403].includes(wrong.status));
const signIn=await get('/signin-with-chatgpt?return_to=%2Fadmin',{redirect:'manual'});
const cookie=signIn.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');assert.ok(cookie,'Local sign-in must return a session');
const ownerHeaders={cookie};
const beforeResponse=await get('/api/admin/stats',{headers:ownerHeaders});assert.equal(beforeResponse.status,200);const before=await beforeResponse.json();
const ownerPage=await (await get('/admin',{headers:ownerHeaders})).text();assert.ok(ownerPage.includes('OWNER DASHBOARD'));assert.ok(!ownerPage.includes('使用 ChatGPT 登录'));
const articleId='J0BMxUEtUeHUQix-LyCZyg';const eventId=crypto.randomUUID();
const post=(body,origin=base)=>get('/api/analytics/click',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
assert.equal((await post({articleId,eventId},'https://example.com')).status,403);
const pagesOrigin='https://leo-ai-pm.github.io';
// Vite rejects external development origins before app routes. Verify CORS on
// the production Worker served locally, without weakening the dev server.
const corsBase=process.argv[3];
if(corsBase){
assert.ok(['localhost','127.0.0.1'].includes(new URL(corsBase).hostname));
const preflight=await fetch(corsBase+'/api/analytics/click',{method:'OPTIONS',headers:{Origin:pagesOrigin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),pagesOrigin);
const rejectedPreflight=await fetch(corsBase+'/api/analytics/click',{method:'OPTIONS',headers:{Origin:'https://example.com','Access-Control-Request-Method':'POST'}});assert.equal(rejectedPreflight.status,403);
const acceptedPost=await fetch(corsBase+'/api/analytics/click',{method:'POST',headers:{Origin:pagesOrigin,'Content-Type':'application/json'},body:JSON.stringify({articleId,eventId})});assert.equal(acceptedPost.status,204);assert.equal(acceptedPost.headers.get('access-control-allow-origin'),pagesOrigin);
}
assert.equal((await post({articleId:'invalid-article',eventId})).status,400);
assert.equal((await post({articleId,eventId:'not-a-uuid'})).status,400);
assert.equal((await post({articleId,eventId})).status,204);
assert.equal((await post({articleId,eventId})).status,204);
const after=await (await get('/api/admin/stats',{headers:ownerHeaders})).json();assert.equal(after.totals.total,before.totals.total+1);assert.equal(after.totals.today,before.totals.today+1);
const reloaded=await (await get('/api/admin/stats',{headers:ownerHeaders})).json();assert.equal(reloaded.totals.total,after.totals.total);
const html=(await (await get('/')).text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
assert.equal((html.match(/class="article-link"/g)||[]).length,expectedArticles);assert.ok(html.includes('dpy093'));assert.ok(html.includes('扫码关注公众号'));assert.ok(!html.includes('打开公众号'));assert.equal((html.match(/href="https:\/\/github.com\/leo-ai-pm"/g)||[]).length,2);
console.log('PASS: private owner stats; GitHub Pages CORS allowed; unknown origins rejected; malformed events rejected; repeated event counted once; persisted counts reload; current published article links; GitHub and WeChat changes.');
