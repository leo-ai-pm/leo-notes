'use client';
import type { MouseEvent, ReactNode } from 'react';

export function ArticleLink({articleId, href, children, analyticsEndpoint='/api/analytics/click'}: {articleId:string;href:string;children:ReactNode;analyticsEndpoint?:string}) {
  function track(event: MouseEvent<HTMLAnchorElement>) {
    if (!event.isTrusted || event.defaultPrevented || event.button > 1) return;
    // The destination stays a normal link; analytics never blocks reading.
    try {
      const body = JSON.stringify({articleId,eventId:crypto.randomUUID()});
      const sameOrigin = new URL(analyticsEndpoint, window.location.href).origin === window.location.origin;
      const sent = sameOrigin && typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(analyticsEndpoint,new Blob([body],{type:'application/json'}));
      if (!sent) void fetch(analyticsEndpoint,{method:'POST',body,headers:{'Content-Type':'application/json'},credentials:'omit',keepalive:true}).catch(()=>{});
    } catch { /* Reading continues if telemetry is unavailable. */ }
  }
  return <a className="article-link" href={href} target="_blank" rel="noopener noreferrer" onClick={track} onAuxClick={event=>{if(event.button===1)track(event);}}>{children}</a>;
}
