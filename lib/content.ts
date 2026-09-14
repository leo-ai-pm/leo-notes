/** Add only real published articles. Every article opens WeChat, never a local detail page. */
export const profile = {
  name: 'Leo',
  tagline: '思考与实践',
  description: '记录 AI 产品学习、项目实践与日常思考。',
  wechatUrl: 'https://weixin.qq.com/r/mp/qSfJ0YnEN9RIrc2y93K7',
  qrImage: '/wechat-qr.jpg',
};
export type Article = {
  title: string;
  excerpt: string;
  category: string;
  date?: string;
  /** Optional genuine mp.weixin.qq.com article URL; otherwise use the account entry. */
  wechatUrl?: string;
};
export const articles: Article[] = [];
export function articleDestination(article: Article): string {
  if (article.wechatUrl) {
    try {
      const url = new URL(article.wechatUrl);
      if (url.protocol === 'https:' && url.hostname === 'mp.weixin.qq.com') return url.href;
    } catch { /* Fall back to the verified QR destination. */ }
  }
  return profile.wechatUrl;
}
