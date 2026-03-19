import type { ReactNode } from 'react';
import {
  IconBuilding,
  IconCalendar,
  IconHome,
  IconLayoutDashboard,
  IconMap,
} from '@tabler/icons-react';

export interface INavItem {
  label: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
}

export const publicNavItems: INavItem[] = [
  { label: 'Home', href: '/', icon: <IconHome size={20} />, exact: true },
  { label: 'Festivals', href: '/festivals', icon: <IconCalendar size={20} /> },
  { label: 'Villages', href: '/villages', icon: <IconBuilding size={20} /> },
  { label: 'Map', href: '/map', icon: <IconMap size={20} /> },
];

export const adminNavItems: INavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <IconLayoutDashboard size={20} />,
    exact: true,
  },
  { label: 'Villages', href: '/admin/villages', icon: <IconBuilding size={20} /> },
  { label: 'Festivals', href: '/admin/festivals', icon: <IconCalendar size={20} /> },
];
