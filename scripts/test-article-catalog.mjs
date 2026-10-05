import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {readFile} from 'node:fs/promises';
const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom'});
const originalFetch=globalThis.fetch;
const originalNow=Date.now;
try{
 const {validateCatalog,getPublishedArticles}=await server.ssrLoadModule('/lib/article-catalog.ts');
 const fixture=JSON.parse(await readFile('public/articles.json','utf8'));
 const next={...fixture,articles:[...fixture.articles,{id:'new_future_article',title:'新文章',excerpt:'',category:'公众号文章',date:'2026-10-06',wechatUrl:'https://mp.weixin.qq.com/s/new_future_article'}]};
 assert.equal(validateCatalog(next).length,fixture.articles.length+1);
 assert.throws(()=>validateCatalog({...next,account:'Wrong account'}));
 assert.throws(()=>validateCatalog({...next,articles:[...next.articles,next.articles[0]]}));
 globalThis.fetch=async()=>new Response(JSON.stringify(next),{status:200});
 const catalog=await getPublishedArticles();assert.ok(catalog.some(a=>a.id==='new_future_article'),'new articles must be recognized without redeploying the backend');
 globalThis.fetch=async()=>{throw new Error('Network down');};
 Date.now=()=>originalNow()+120_000;
 assert.deepEqual(await getPublishedArticles(),catalog);
 console.log('PASS: new articles recognized, invalid catalogs rejected, cached catalog retained.');
}finally{globalThis.fetch=originalFetch;Date.now=originalNow;await server.close();}
