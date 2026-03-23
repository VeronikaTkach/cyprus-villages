import type { ReactNode } from 'react';
import {
  IconBuilding,
  IconCalendar,
  IconHome,
  IconLayoutDashboard,
  IconMap,
} from '@tabler/icons-react';

export interface INavItem {
  labelKey: 'home' | 'festivals' | 'villages' | 'map';
  href: string;
  icon: ReactNode;
  exact?: boolean;
}

export interface IAdminNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
}

export const publicNavItems: INavItem[] = [
  { labelKey: 'home', href: '/', icon: <IconHome size={20} />, exact: true },
  { labelKey: 'festivals', href: '/festivals', icon: <IconCalendar size={20} /> },
  { labelKey: 'villages', href: '/villages', icon: <IconBuilding size={20} /> },
  { labelKey: 'map', href: '/map', icon: <IconMap size={20} /> },
];

export const adminNavItems: IAdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <IconLayoutDashboard size={20} />, exact: true },
  { label: 'Villages', href: '/admin/villages', icon: <IconBuilding size={20} /> },
  { label: 'Festivals', href: '/admin/festivals', icon: <IconCalendar size={20} /> },
];
