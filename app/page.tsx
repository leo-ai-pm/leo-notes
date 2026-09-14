import { ArrowUpRight, ArrowRight, BookOpen, Compass, PenLine } from 'lucide-react';
import { ArticleLink } from '@/components/article-link';
import { articles, articleDestination, profile } from '@/lib/content';

const directions = [
  {number:'01', title:'AI 产品学习', text:'从理解技术，到理解它能解决的问题。'},
  {number:'02', title:'项目实践', text:'在动手的过程中，检验想法，积累经验。'},
  {number:'03', title:'阅读与思考', text:'给新问题留一点空间，也给自己留一点记录。'},
];
export function PersonalSite({ adminUrl = '/admin', analyticsEndpoint = '/api/analytics/click' }: {adminUrl?: string; analyticsEndpoint?: string} = {}) {
  return (
    <>
      <a href="#main" className="skip-link">跳到正文</a>
      <header className="site-header" id="top">
        <div className="wrap header-row">
          <a className="brand" href="/" aria-label="Leo 首页">{profile.name}<span className="brand-dot">.</span><span className="tagline">{profile.tagline}</span></a>
          <nav aria-label="主导航">
            <a href="#top" className="active">首页</a>
            <a href="#writing">文章</a>
            <a href="#about">关于</a>
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="nav-wechat">GitHub <ArrowUpRight size={14}/></a>
          </nav>
        </div>
      </header>
      <main className="wrap" id="main">
        <div className="directory" aria-label="内容导航">
          <a href="#writing" className="directory-card"><PenLine/><div><h2>文字与思考</h2><p>{articles.length} 篇文章 · 公众号原文</p></div><ArrowRight className="card-arrow" size={17}/></a>
          <a href="#interests" className="directory-card"><Compass/><div><h2>关注方向</h2><p>AI 产品、实践、阅读</p></div><ArrowRight className="card-arrow" size={17}/></a>
          <a href="#about" className="directory-card"><BookOpen/><div><h2>关于我</h2><p>认识一下，Leo</p></div><ArrowRight className="card-arrow" size={17}/></a>
        </div>
        <div className="columns">
          <div className="feed">
            <section id="writing" aria-labelledby="writing-heading">
              <div className="section-head"><h1 id="writing-heading">文字与思考</h1><span className="article-count">{articles.length} 篇文章</span></div>
              {articles.length > 0 ? articles.map((article) => (
                <article className="entry" key={article.title}>
                  <ArticleLink articleId={article.id} href={articleDestination(article)} analyticsEndpoint={analyticsEndpoint}>
                    <div className="entry-meta">{article.date && <time dateTime={article.date}>{article.date}</time>}<span>{article.category}</span></div>
                    <h2>{article.title}</h2><p>{article.excerpt}</p><span className="text-link">去公众号阅读 <ArrowUpRight size={16}/></span>
                  </ArticleLink>
                </article>
              )) : (
                <article className="entry featured-entry">
                  <a className="article-link" href={profile.wechatUrl} target="_blank" rel="noopener noreferrer">
                    <div className="entry-meta"><span className="status-dot"/> 公众号 · 阅读入口</div>
                    <h2>把学习写下来，<br/>让实践留下痕迹。</h2>
                    <p>你好，我是 Leo。这里是我的个人网站，记录我在 AI 产品学习与项目实践中的思考。</p>
                    <p>文章发布在公众号，欢迎过去读一读。</p>
                    <span className="text-link">去公众号阅读 <ArrowUpRight size={17}/></span>
                  </a>
                  <p className="reading-note">电脑端推荐扫描右侧二维码；手机端可用微信扫一扫或识别二维码。</p>
                </article>
              )}
            </section>
            <section id="interests" className="interests" aria-labelledby="interests-heading">
              <div className="section-head secondary-head"><h2 id="interests-heading">我关注的方向</h2><span className="eyebrow">LEARNING IN PUBLIC</span></div>
              {directions.map(direction => <div className="direction" key={direction.number}><span className="direction-number">{direction.number}</span><div><h3>{direction.title}</h3><p>{direction.text}</p></div></div>)}
            </section>
          </div>
          <aside className="sidebar">
            <section id="about" className="about-box" aria-labelledby="about-heading">
              <div className="profile-avatar"><img src={profile.avatar} width={5472} height={3648} alt="Leo 的头像" /></div>
              <h2 id="about-heading">你好，我是 Leo</h2>
              <p>一名 AI 产品学习者，<br/>也在不断动手实践。</p>
              <p>关注产品、技术与人的连接。用写作整理思路，用实践回答问题。</p>
              <a className="about-signature" href={profile.githubUrl} target="_blank" rel="noopener noreferrer">GitHub · leo-ai-pm <ArrowUpRight size={15}/></a>
            </section>
            <section id="wechat" className="wechat-widget" aria-labelledby="wechat-heading">
              <h2 id="wechat-heading">微信</h2>
              <div className="wechat-box">
                <img className="qr-image" src={profile.qrImage} width={430} height={430} alt="Leo-AIpm 公众号二维码，请用微信扫一扫"/>
                <p>扫码关注公众号</p>
                <div className="personal-wechat">个人微信：<span>dpy093</span></div>
              </div>
            </section>
          </aside>
        </div>
      </main>
      <footer className="site-footer"><div className="wrap footer-row"><p>© {new Date().getFullYear()} Leo<span>思考与实践</span></p><div className="footer-links"><a href={adminUrl}>管理后台</a><a href="#top">回到顶部 ↑</a></div></div></footer>
    </>
  );
}

export default function Home() { return <PersonalSite />; }
