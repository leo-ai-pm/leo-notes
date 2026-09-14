/** Add only real published articles. Every article opens WeChat, never a local detail page. */
export const profile = {
  name: 'Leo',
  tagline: '思考与实践',
  description: '记录 AI 产品学习、项目实践与日常思考。',
  wechatUrl: 'https://weixin.qq.com/r/mp/qSfJ0YnEN9RIrc2y93K7',
  qrImage: '/wechat-qr.jpg',
  avatar: '/leo-avatar.jpg',
  wechatName: 'Leo-AIpm',
};
export type Article = {
  title: string;
  excerpt: string;
  category: string;
  date?: string;
  /** Optional genuine mp.weixin.qq.com article URL; otherwise use the account entry. */
  wechatUrl?: string;
};
export const articles: Article[] = [
  {
    "title": "GPT-6能交差吗？我用碰爪试了一遍",
    "excerpt": "从宠物交友的想法，到可以体验的「碰爪」Demo。记录需求补充、地图接入与测试修复，也写下真实多人使用前还要完成的工作。",
    "category": "项目实践",
    "date": "2026-09-06",
    "wechatUrl": "https://mp.weixin.qq.com/s/J0BMxUEtUeHUQix-LyCZyg"
  },
  {
    "title": "我把 DeepSeek Harness 拆成了 81 页，最后写下这份白皮书",
    "excerpt": "围绕一份 81 页的架构与扩展白皮书，梳理 DeepSeek Harness 的插件体系、请求流程与扩展方式，以及采用时需要考虑的边界。",
    "category": "Agent 架构",
    "date": "2026-09-02",
    "wechatUrl": "https://mp.weixin.qq.com/s/KaExO8TAWRiLWjL0yzyiYA"
  },
  {
    "title": "我回到故乡，却听不懂亲人的方言了，AI能帮上什么",
    "excerpt": "从回乡时听不懂的方言、难以接续的聊天谈起，思考 AI 能否帮助离乡的人重新理解亲人、地方习俗与共同生活。",
    "category": "故乡与 AI",
    "date": "2026-08-30",
    "wechatUrl": "https://mp.weixin.qq.com/s/qRWh7RpGpbo8DcHqfuxBPA"
  },
  {
    "title": "星宇股份解约107名应届生，AI能提前做什么",
    "excerpt": "从一场校招解约事件切入，讨论 AI 在求职信息整理、文件理解和咨询准备中的作用，以及产品需要守住的边界。",
    "category": "AI 与就业",
    "date": "2026-08-29",
    "wechatUrl": "https://mp.weixin.qq.com/s/OTvoAD6c3mNGW0dUIJkpRg"
  },
  {
    "title": "当孙宇晨问 Claude Code，要不要给景甜五千万美元",
    "excerpt": "从一则引发讨论的 AI 使用叙事出发，思考 AI 作为决策伙伴时的价值、迎合问题，以及人应当保留的判断与责任。",
    "category": "AI 与决策",
    "date": "2026-08-29",
    "wechatUrl": "https://mp.weixin.qq.com/s/SIc1ULDG_mtPSqEq5Hv8OA"
  }
];
export function articleDestination(article: Article): string {
  if (article.wechatUrl) {
    try {
      const url = new URL(article.wechatUrl);
      if (url.protocol === 'https:' && url.hostname === 'mp.weixin.qq.com') return url.href;
    } catch { /* Fall back to the verified QR destination. */ }
  }
  return profile.wechatUrl;
}
