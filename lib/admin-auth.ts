import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';

export async function adminAccess(): Promise<'owner' | 'anonymous' | 'forbidden' | 'unconfigured'> {
  const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) return 'unconfigured';
  const user = await getChatGPTUser();
  if (!user) return 'anonymous';
  return user.email.trim().toLowerCase() === ownerEmail ? 'owner' : 'forbidden';
}
