import {readFile,writeFile,rename} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function mergePublished(current, incoming) {
  if(incoming?.version!==1||incoming.account!=='Leo-AIpm'||incoming.complete!==true||!Array.isArray(incoming.records)||!incoming.records.length)
    throw new Error('完整且已核验的公众号公开目录缺失，保留现有文章。');
  const ids=new Set();
  const articles=incoming.records.filter(r=>r.visibility==='public').map(r=>{
    if(typeof r.id!=='string'||!/^[-\w]{22}$/.test(r.id)||ids.has(r.id))throw new Error('重复或无效的文章编号');
    ids.add(r.id);
    if(r.wechatUrl!==`https://mp.weixin.qq.com/s/${r.id}`||typeof r.title!=='string'||!r.title.trim()||r.title.length>300
       ||typeof r.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isSafeInteger(r.publishedAt)
       ||new Date(r.publishedAt*1000+8*3600000).toISOString().slice(0,10)!==r.date)throw new Error('公开文章元数据无效');
    const old=current.articles.find(a=>a.id===r.id);
    const excerpt=old?.excerpt??r.excerpt??'';
    if(typeof excerpt!=='string'||excerpt.length>1000)throw new Error('文章导读无效');
    return {id:r.id,title:r.title.trim(),excerpt,category:old?.category??'公众号文章',date:r.date,wechatUrl:r.wechatUrl,publishedAt:r.publishedAt};
  }).sort((a,b)=>b.publishedAt-a.publishedAt||a.id.localeCompare(b.id)).map(({publishedAt,...article})=>article);
  if(!articles.length)throw new Error('拒绝用空目录覆盖已有文章');
  return {version:1,account:'Leo-AIpm',articles};
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  const current=JSON.parse(await readFile('public/articles.json','utf8'));
  const next=mergePublished(current,JSON.parse(await readFile('work/wechat-public.json','utf8')));
  if(JSON.stringify(current)===JSON.stringify(next)){console.log('UNCHANGED: no article changes');}
  else{
    await writeFile('public/articles.json.tmp',JSON.stringify(next,null,2)+'\n');
    await rename('public/articles.json.tmp','public/articles.json');
    console.log(`UPDATED: ${current.articles.length} -> ${next.articles.length} public articles`);
  }
}
