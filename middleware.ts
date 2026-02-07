export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/((?!api/pvp|_next/static|_next/image|favicon\\.ico).*)'],
};
