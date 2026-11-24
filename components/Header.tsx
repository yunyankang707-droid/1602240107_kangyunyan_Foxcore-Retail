import Link from 'next/link';
import { getSessionStaff } from '@/lib/auth';

export async function Header({ hideLogin = false }: { hideLogin?: boolean }) {
  const session = await getSessionStaff();
  return <header className="site-header"><div className="header-inner"><Link href="/" className="brand"><span>FOXCORE</span> RETAIL</Link>{session ? <nav className="header-nav"><Link href="/dashboard">工作台</Link><span>{session.staff.full_name}</span><form action="/auth/signout" method="post"><button type="submit">退出</button></form></nav> : !hideLogin && <Link className="btn btn-primary header-login" href="/login">登录系统</Link>}</div></header>;
}
