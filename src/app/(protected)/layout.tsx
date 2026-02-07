import { auth } from '@/auth';
import { Navigation } from '@/components/Navigation';
import { redirect } from 'next/navigation';

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  return (
    <>
      {children}
      <Navigation />
    </>
  );
}
