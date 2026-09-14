import { adminAccess } from '@/lib/admin-auth';
import { readStats } from '@/lib/analytics';
export const dynamic = 'force-dynamic';
const privateHeaders = {'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie'};
export async function GET() {
  const access = await adminAccess();
  if (access !== 'owner') {
    const status = access === 'anonymous' ? 401 : access === 'unconfigured' ? 503 : 403;
    return Response.json({error:status===401?'请先登录':status===503?'后台暂不可用':'仅网站所有者可查看'}, {status,headers:privateHeaders});
  }
  try { return Response.json(await readStats(), {headers:privateHeaders}); }
  catch { return Response.json({error:'统计暂时无法读取，请稍后刷新。'}, {status:503,headers:privateHeaders}); }
}
