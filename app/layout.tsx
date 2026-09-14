import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Leo · 思考与实践',
  description: 'Leo 的个人网站。记录 AI 产品学习、项目实践与日常思考，在公众号阅读文章。',
  icons: {icon:'/favicon.svg'},
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
