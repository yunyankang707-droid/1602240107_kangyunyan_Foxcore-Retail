import Link from 'next/link';
import { ArrowRight, BarChart3, Check, ShoppingBag, UserRoundCog } from 'lucide-react';
import { Header } from '@/components/Header';

const roles = [
  { name: '销售顾问', english: 'Sales Consultant', href: '/login/sales', button: '销售顾问登录', icon: ShoppingBag, duties: ['销售记录录入', '销售明细查询', '个人销售业绩查看'] },
  { name: '系统管理者', english: 'System Administrator', href: '/login/manager', button: '管理者登录', icon: UserRoundCog, duties: ['销售数据统计', '商品及销售管理', '活动经营分析', '业务数据查询'] },
];

export default function RoleSelection() {
  return <><Header hideLogin /><main className="role-page"><div className="role-wrap">
    <div className="role-heading"><span className="role-heading-icon"><BarChart3 size={25} /></span><h1>欢迎使用 Foxcore Retail</h1><p>请选择您的登录身份</p></div>
    <div className="role-grid">{roles.map(({ name, english, href, button, icon: Icon, duties }) => <article className="role-card" key={english}><span className="role-icon"><Icon size={30} strokeWidth={1.7} /></span><h2>{name}</h2><p className="role-english">{english}</p><ul>{duties.map(duty => <li key={duty}><Check size={16} />{duty}</li>)}</ul><Link className="btn btn-primary role-button" href={href}>{button}<ArrowRight size={17} /></Link></article>)}</div>
  </div></main></>;
}
