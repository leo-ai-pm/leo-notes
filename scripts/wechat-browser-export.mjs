// Run with: ego-browser nodejs < scripts/wechat-browser-export.mjs
// Only public article metadata leaves the browser. Session credentials never do.
const fs = await import('node:fs/promises');
const existingSpace = globalThis.WECHAT_SYNC_SPACE_ID;
const project = globalThis.WECHAT_SYNC_PROJECT;
if(typeof project!=='string'||!project.startsWith('/')) throw new Error('Missing absolute project directory');
const task = await taskSpace(existingSpace ? Number(existingSpace) : '同步 Leo 公众号公开文章');
const page = task.page('p1');
try {
  await page.goto('https://mp.weixin.qq.com/');
  try { await page.waitForSelector('.acount_box-nickname', {state:'visible',timeout:15000}); }
  catch { await task.handOff(); throw new Error('WECHAT_LOGIN_REQUIRED：请在 Ego 浏览器重新扫码登录公众号。'); }
  const account = await page.evaluate(()=>document.querySelector('.acount_box-nickname')?.textContent.trim());
  if(account !== 'Leo-AIpm') throw new Error('登录的公众号不是 Leo-AIpm，停止同步。');
  if(!await page.evaluate(()=>!!document.querySelector('a[href*="appmsgpublish?sub=list"]'))) await page.click('text="内容管理"');
  const publishLink=await page.evaluate(()=>document.querySelector('a[href*="appmsgpublish?sub=list"]')?.href);
  if(!publishLink)throw new Error('找不到发表记录入口');
  await page.goto(publishLink);
  await page.waitForSelector('.weui-desktop-mass__content', {state:'visible',timeout:15000});
  const listUrl = await page.url(); // Ephemeral authenticated URL, never saved.
  const total = await page.evaluate(()=>Number(document.body.innerText.match(/共发表了\s*(\d+)\s*次/)?.[1]));
  if(!Number.isInteger(total)||total<1||total>500) throw new Error('无法确认发表记录总数，保留已有目录。');
  const records=[];let excluded=0;
  for(let begin=0;begin<total;begin+=10){
    if(begin){const u=new URL(listUrl);u.searchParams.set('begin',String(begin));await page.goto(u.href);await page.waitForSelector('.weui-desktop-mass__content',{state:'visible',timeout:15000});}
    const result=await page.evaluate(()=>{
      const records=[];let excluded=0;
      for(const a of document.querySelectorAll('a.weui-desktop-mass-appmsg__title')){
        const card=a.closest('.weui-desktop-mass__content');
        const media=a.closest('.weui-desktop-mass-media');
        if(!card || !media) throw new Error('发表记录结构已变化');
        if(/仅自己可见|已删除|已屏蔽|审核中|发表失败|已撤回/.test(card.innerText)){excluded++;continue;}
        if(!card.innerText.includes('已发表'))throw new Error('无法确认发表状态');
        const timeLink=media.querySelector('a[href*="send_time="]');
        const timestamp=Number(timeLink?new URL(timeLink.href).searchParams.get('send_time'):0);
        if(!Number.isSafeInteger(timestamp)||timestamp<1_500_000_000)throw new Error('文章缺少可信发布时间');
        const u=new URL(a.href);
        if(u.origin!=='https://mp.weixin.qq.com'||!/^\/s\/[\w-]+$/.test(u.pathname))throw new Error('文章链接格式需人工检查');
        records.push({id:u.pathname.split('/').at(-1),title:a.innerText.split('\n')[0].replace(/\s+/g,' ').trim(),
          date:new Date(timestamp*1000+8*3600000).toISOString().slice(0,10),publishedAt:timestamp,
          wechatUrl:u.origin+u.pathname,visibility:'public'});
      }
      return {records,excluded};
    });
    if(!result.records.length&&!result.excluded)throw new Error('发表列表为空，停止同步。');
    records.push(...result.records);excluded+=result.excluded;
  }
  if(new Set(records.map(r=>r.id)).size!==records.length)throw new Error('分页出现重复记录，停止同步。');
  let previous=[];try{previous=JSON.parse(await fs.readFile(project+'/public/articles.json','utf8')).articles;}catch{}
  for(const item of records.filter(r=>!previous.some(p=>p.id===r.id))){
    const metadata=await page.evaluate(async(url)=>{
      const r=await fetch(url,{signal:AbortSignal.timeout(15000)});
      if(!r.ok)throw new Error('无法核验公开文章');
      const doc=new DOMParser().parseFromString(await r.text(),'text/html');
      return {account:doc.querySelector('#js_name')?.textContent.trim(),
        title:doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim(),
        excerpt:doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim()||''};
    },item.wechatUrl);
    if(metadata.account!=='Leo-AIpm'||!metadata.title)throw new Error('公开原文未通过账号核验，稍后重试。');
    item.title=metadata.title;item.excerpt=metadata.excerpt.slice(0,500);
  }
  await fs.mkdir(project+'/work',{recursive:true});
  await fs.writeFile(project+'/work/wechat-public.json',JSON.stringify({version:1,account,complete:true,total,excluded,records},null,2)+'\n');
  console.log(JSON.stringify({account,publicArticles:records.length,excluded,output:'work/wechat-public.json'}));
  if(!existingSpace)await task.finish({keep:[]});
}catch(error){
  console.error(String(error.message).replace(/token=[^&\s]+/g,'token=REDACTED'));process.exitCode=1;
}
