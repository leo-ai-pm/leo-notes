'use client';
import { useCallback, useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalyticsStats } from '@/lib/analytics';
const number = (value:number)=>value.toLocaleString('zh-CN');
const time = (value:number|string)=>new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
export function AdminDashboard() {
  const [stats,setStats]=useState<AnalyticsStats|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const refresh=useCallback(async()=>{
    setLoading(true);setError('');
    try {
      const response=await fetch('/api/admin/stats',{cache:'no-store',credentials:'same-origin'});
      const body=await response.json() as AnalyticsStats & {error?:string};
      if(!response.ok) throw new Error(body.error||'统计读取失败');
      setStats(body);
    } catch(e){setError(e instanceof Error?e.message:'统计读取失败');}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  return <>
    <div className="stats-toolbar"><p>{stats?'更新于 '+time(stats.updatedAt)+' · 北京时间':'统计从功能上线后开始记录'}</p><Button className="refresh-button" variant="outline" onClick={refresh} disabled={loading}>{loading?'读取中…':'刷新统计'}</Button></div>
    {error&&<p className="stats-error" role="alert">{error}</p>}
    {loading&&!stats&&<div className="stats-summary" aria-label="正在加载统计">{[0,1,2,3].map(i=><Skeleton key={i} className="h-28 rounded-md"/>)}</div>}
    {stats&&<>
      <div className="stats-summary">{[{key:'today',label:'今日点击'},{key:'week',label:'近 7 天'},{key:'month',label:'近 30 天'},{key:'total',label:'累计点击'}].map(({key,label})=><section className="stat-card" key={key}><h2>{label}</h2><p>{number(stats.totals[key as keyof typeof stats.totals])}</p></section>)}</div>
      <section className="stats-detail"><h2>每篇文章</h2><Table className="analytics-table"><TableHeader><TableRow><TableHead>文章</TableHead><TableHead>今日</TableHead><TableHead>近 7 天</TableHead><TableHead>近 30 天</TableHead><TableHead>累计</TableHead><TableHead>最近点击</TableHead></TableRow></TableHeader><TableBody>{stats.rows.map(row=><TableRow key={row.id}><TableCell className="article-name">{row.title}</TableCell><TableCell>{number(row.today)}</TableCell><TableCell>{number(row.week)}</TableCell><TableCell>{number(row.month)}</TableCell><TableCell className="total-count">{number(row.total)}</TableCell><TableCell className="last-click">{row.lastClick?time(row.lastClick):'暂无点击'}</TableCell></TableRow>)}</TableBody></Table>
      {stats.totals.total===0&&<p className="stats-empty">还没有点击记录。读者从网站点开文章后，点击数会在这里累计。</p>}</section>
    </>}
    <section className="stats-notes"><h2>统计说明</h2><p>统计从本网站点击「去公众号阅读」或文章卡片的次数，包括重复点击和你自己的点击；不等于公众号阅读量或独立访客人数。近 7 天与近 30 天均包含今天，按北京时间计算。</p><p>仅保存文章编号、点击时间和用于避免重复提交的单次事件编号。不采集姓名、微信号、IP 地址或设备指纹，无法据此知道具体是谁访问。禁用 JavaScript 或被浏览器拦截的点击可能不会计入。</p></section>
  </>;
}
