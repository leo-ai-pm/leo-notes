# Leo · 思考与实践

参考 https://rui.juzi.bot/ 的内容优先布局：三列目录入口、文章主栏、个人介绍与公众号侧栏，支持窄屏和系统深色模式。

## 更新内容

修改 `lib/content.ts` 中的 `profile`。文章目录存放于 `public/articles.json`，由已登录公众号后台同步。仅添加真实文章，不填示例发布日期或虚构标题。每篇文章可以提供原始的 `https://mp.weixin.qq.com/...` 链接；没有单篇链接时回退到公众号二维码对应的入口。站内没有文章详情页。

二维码来自用户提供的 JPG，原样保存在 `public/wechat-qr.jpg`。侧栏展示公众号二维码与个人微信；文章使用各自的公众号原文链接。

文章按真实发布时间从新到旧排列；标题、作者和日期来自原文页面，导读为基于原文的简短概括。文章卡片直接跳转各自的微信原文，不进入站内详情页。头像使用用户提供的 JPG 原文件，圆形取景由 CSS 完成。公众号名称为 Leo-AIpm。个人知识库中的私有资料没有作为网站文章发布。

## 本地开发

`npm install` 后运行 `npm run dev`；`npm run build` 生成部署产物。

## GitHub Pages

- 个人网站仓库为 `leo-ai-pm/leo-notes`，网站地址为 `https://leo-ai-pm.github.io/leo-notes/`。根域名保留给已有 AI 日报。
- `npm run build:pages` 输出到 `dist-pages/`；HTML 已预渲染，禁用 JavaScript 也能阅读首页并打开原文，脚本只增强点击统计。
- `github-pages/` 复用现有首页、图片和样式；`vite.pages.config.ts` 是独立静态构建配置。GitHub Actions 在 `main` 更新后构建并发布 Pages。
- 仓库 Settings → Pages 的 Source 设为 GitHub Actions；不需要自定义域名或 DNS 配置。
- GitHub Pages 只接收静态产物。点击记录保存在原 Sites 服务，管理入口指向 `https://leo-notes.ljhsmart1.chatgpt.site/admin`，后台代码和数据库不会被打包进前端。
- 统计接口只允许原站同源与 `https://leo-ai-pm.github.io`；跨域提交不携带身份 Cookie，后台统计 API 不开放跨域访问。
- 后端代码的修改仍需单独发布到原 Sites 服务；GitHub Actions 只更新 GitHub Pages 首页。


## 管理后台与统计

- 首页 `/` 面向匿名访客公开，文章继续直接打开微信原文。
- 后台 `/admin` 使用 Sites 的 ChatGPT 登录。服务端将认证邮箱与平台秘密变量 `OWNER_EMAIL` 比较；缺少配置时拒绝授权。后台接口 `/api/admin/stats` 对匿名请求返回 401，对其他账号返回 403，响应禁止缓存。
- 平台必须剥离访客自行提供的 `oai-authenticated-user-*` 请求头，仅转发经过平台认证的身份。这是 Sites 认证 helper 的信任边界；不要把此 Worker 绕过 Sites 直接暴露。
- 点击通过匿名 POST `/api/analytics/click` 保存到 D1。事件编号只用于同一次点击的重试去重，不标识访客。统计含重复点击与所有者自身点击，不等于独立访客或公众号阅读量；浏览器阻止脚本/网络时可能漏计。
- 不存储访客 IP、姓名、微信号、设备指纹。只记录文章编号、点击时间、北京时间日期和一次性的随机事件编号。
- 表结构由 `db/schema.ts` 定义，`npx drizzle-kit generate` 生成迁移；生产迁移由 Sites 在发布时应用，禁止运行时创建表。
- 本地调试用忽略文件 `.dev.vars`，内容为 `OWNER_EMAIL="seedy@sites.test"`。该模拟邮箱仅用于本地，生产必须在 Sites 设置真实所有者邮箱；代码没有本地用户授权后门。
- 本地行为检查：`node scripts/test-analytics.mjs http://localhost:3001`，只允许本地 URL；会在本地 D1 中增加一个测试点击，永不写生产数据库。
- 跨域检查：先构建并用 Wrangler 在另一端口运行 Worker，再将第二个本地 URL 作为测试脚本的第三个参数，例如 `node scripts/test-analytics.mjs http://localhost:3002 http://localhost:3003`。Vite 默认限制跨域开发访问，因此在本地生产 Worker 上检查预检与接收接口。
- 文章由公众号同步；头像与布局在代码中维护。后台仅提供点击统计与统计口径说明。

## 公众号自动同步

`node scripts/sync-wechat.mjs` 完成：检查工作区 → 拉取 GitHub 最新源码 → 通过 Ego 浏览器的现有登录进入 Leo-AIpm 发表记录 → 读取全部分页 → 过滤仅自己可见、撤回、删除等内容 → 核验新文章的公开原文账号 → 更新公开目录 → 构建并推送。没有变化就不提交。GitHub Actions 接着发布静态网站。

本任务采用 Codex 本地每小时自动检查，并非微信实时回调；电脑与 Codex/Ego 需可运行，微信登录需有效。电脑离线会延后，登录失效会停止写入并提示重新扫码。官方开发者平台需要独立登录，当前未接入其 API，不能据此声称本账号具备官方发布接口权限。

只导出公开标题、真实发布时间、原文链接和原文摘要；不保存 Cookie、后台 token、草稿、私密内容、读者或收入数据。临时的公开抓取结果在被忽略的 `work/` 中。数据异常或页面结构变动会停止，不会清空已有文章。下架文章从首页移除，但历史点击仍保留在后台。

新增文章的点击校验及后台列表自动读取固定地址 `https://leo-ai-pm.github.io/leo-notes/articles.json`，最多缓存 60 秒；失败时保留最后成功的目录或构建内置目录。点击请求不能自己指定可统计的任意标题或外链。以后只需更新 GitHub Pages，不需要为每篇文章重新部署统计服务。

验证：`node --test scripts/test-wechat-sync.mjs`、`node scripts/test-article-catalog.mjs`、`npm run build:pages`。手动检查完同期 GitHub Actions 成功之后，才算完成上线。不要把推送成功等同于部署成功。
