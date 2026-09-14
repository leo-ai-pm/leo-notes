'use client';
import type { MouseEvent, ReactNode } from 'react';

export function ArticleLink({articleId, href, children}: {articleId:string;href:string;children:ReactNode}) {
  function track(event: MouseEvent<HTMLAnchorElement>) {
    if (!event.isTrusted || event.defaultPrevented || event.button > 1) return;
    // The destination stays a normal link; analytics never blocks reading.
    try {
      const body = JSON.stringify({articleId,eventId:crypto.randomUUID()});
      const sent = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/analytics/click',new Blob([body],{type:'application/json'}));
      if (!sent) void fetch('/api/analytics/click',{method:'POST',body,headers:{'Content-Type':'application/json'},keepalive:true}).catch(()=>{});
    } catch { /* Reading continues if telemetry is unavailable. */ }
  }
  return <a className="article-link" href={href} target="_blank" rel="noopener noreferrer" onClick={track} onAuxClick={event=>{if(event.button===1)track(event);}}>{children}</a>;
}
