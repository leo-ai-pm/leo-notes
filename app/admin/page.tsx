import type { Metadata } from 'next';
import { adminAccess } from '@/lib/admin-auth';
import { chatGPTSignInPath, chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { AdminDashboard } from '@/components/admin-dashboard';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:'管理后台 · Leo',robots:{index:false,follow:false}};
export default async function AdminPage() {
  const access = await adminAccess();
  return <main className="wrap admin-page">
    <header className="admin-header"><a className="brand" href="/">Leo<span className="brand-dot">.</span></a><a href="/">返回网站 ↗</a></header>
    <div className="admin-heading"><p className="eyebrow">OWNER DASHBOARD</p><h1>文章点击统计</h1><p>管理后台仅对网站所有者开放。</p></div>
    {access === 'owner' ? <><AdminDashboard/><p className="admin-signout"><a href={chatGPTSignOutPath('/admin')} target="_top">退出后台登录</a></p></> :
      <section className="admin-login"><h2>{access==='anonymous'?'登录管理后台':access==='forbidden'?'此账号没有管理权限':'后台暂不可用'}</h2>
        <p>{access==='anonymous'?'请使用你创建网站时的 ChatGPT 账号登录。访客阅读首页和文章无需登录。':access==='forbidden'?'请退出当前账号，再使用网站所有者账号登录。':'管理员配置尚未就绪，请稍后再试。'}</p>
        {access==='anonymous' && <a className="admin-action" href={chatGPTSignInPath('/admin')} target="_top">使用 ChatGPT 登录</a>}
        {access==='forbidden' && <a className="admin-action" href={chatGPTSignOutPath('/admin')} target="_top">退出并切换账号</a>}
      </section>}
  </main>;
}
