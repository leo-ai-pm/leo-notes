import { PersonalSite } from '../app/page';

// Public service URLs only. Authentication and private statistics stay on Sites.
const backend = 'https://leo-notes.ljhsmart1.chatgpt.site';
export function PagesSite() {
  return <PersonalSite basePath="/leo-notes/" adminUrl={`${backend}/admin`} analyticsEndpoint={`${backend}/api/analytics/click`} />;
}
