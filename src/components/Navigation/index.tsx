'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Home, Gamepad, User } from 'iconoir-react';
import { usePathname, useRouter } from 'next/navigation';

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname.includes('/play') ? 'play' : pathname.includes('/profile') ? 'profile' : 'home';

  const handleChange = (val: string) => {
    if (val === 'home') router.push('/home');
    else if (val === 'play') router.push('/play/eye-fighter');
    else if (val === 'profile') router.push('/home');
  };

  return (
    <Tabs value={value} onValueChange={handleChange}>
      <TabItem value="home" icon={<Home />} label="Home" />
      <TabItem value="play" icon={<Gamepad />} label="Play" />
      <TabItem value="profile" icon={<User />} label="Profile" />
    </Tabs>
  );
};
