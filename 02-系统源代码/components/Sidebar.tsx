'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ClipboardList, Database, LayoutDashboard, PenLine } from 'lucide-react';
import type { Role } from '@/lib/auth';

const managerLinks = [
  { href: '/dashboard', label: '经营仪表板', icon: LayoutDashboard },
  { href: '/sales', label: '销售记录', icon: ClipboardList },
  { href: '/statistics', label: '销售统计', icon: BarChart3 },
  { href: '/master-data', label: '基础数据', icon: Database },
];
const salesLinks = [
  { href: '/dashboard', label: '销售工作台', icon: LayoutDashboard },
  { href: '/sales/new', label: '销售录入', icon: PenLine },
  { href: '/sales', label: '我的销售', icon: ClipboardList },
  { href: '/master-data', label: '基础数据', icon: Database },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = role === 'manager' ? managerLinks : salesLinks;
  return <aside className="admin-sidebar"><Link href="/" className="sidebar-brand"><span>FOXCORE</span><small>RETAIL 管理系统</small></Link><nav className="sidebar-nav" aria-label="管理端主导航">{links.map(({ href, label, icon: Icon }) => {
    const active = href === '/sales' ? pathname === '/sales' || /^\/sales\/\d+$/.test(pathname) : pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
    return <Link key={href} href={href} prefetch className={`sidebar-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}><Icon size={19} strokeWidth={1.8} /><span>{label}</span></Link>;
  })}</nav></aside>;
}
