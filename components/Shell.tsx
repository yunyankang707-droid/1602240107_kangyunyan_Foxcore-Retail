import { Sidebar } from './Sidebar';
import type { Role } from '@/lib/auth';

export function Shell({ role, name, children }: { role: Role; name: string; children: React.ReactNode }) {
  return <div className="admin-layout"><Sidebar role={role} /><main className="admin-main"><header className="admin-topbar"><span>Foxcore Retail 运营中心</span><div><span>{name} · {role === 'manager' ? '管理者' : '销售顾问'}</span><form action="/auth/signout" method="post"><button type="submit">退出登录</button></form></div></header><div className="admin-content">{children}</div></main></div>;
}
