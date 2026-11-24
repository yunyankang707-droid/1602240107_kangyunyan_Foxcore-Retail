import Link from 'next/link';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react';
import type { Role } from '@/lib/auth';

const copy = {
  sales_consultant: { title: '销售顾问登录', english: 'Sales Consultant', description: '登录后进入销售工作台，录入销售记录并查看个人销售明细。', button: '登录销售工作台' },
  manager: { title: '系统管理者登录', english: 'System Administrator', description: '登录后进入管理工作台，查看经营数据并管理系统业务。', button: '登录管理工作台' },
};
const errors: Record<string, string> = { credentials: '邮箱或密码错误，请检查后重试。', mismatch: '该账号与您选择的登录身份不匹配，请返回重新选择。', inactive: '该员工账号已停用，请联系系统管理者。', staff: '未找到该账号对应的员工资料，请联系系统管理者。', role: '登录身份无效，请返回重新选择。' };

export function LoginCard({ role, error }: { role: Role; error?: string }) {
  const content = copy[role];
  return <main className="login-page"><div className="login-card card"><Link href="/login" className="back-link"><ArrowLeft size={17} />返回身份选择</Link><header className="login-heading"><h1>{content.title}</h1><p className="login-english">{content.english}</p><p className="login-description">{content.description}</p></header>{error && <div className="login-error" role="alert">{errors[error] || '登录失败，请重试。'}</div>}<form action="/auth/login" method="post" className="login-form"><input type="hidden" name="role" value={role} /><label className="form-field"><span>邮箱</span><div className="input-wrap"><Mail size={19} /><input name="email" type="email" autoComplete="email" required placeholder="请输入工作邮箱" /></div></label><label className="form-field"><span>密码</span><div className="input-wrap"><LockKeyhole size={19} /><input name="password" type="password" autoComplete="current-password" required placeholder="请输入密码" /></div></label><button className="btn btn-primary login-button" type="submit">{content.button}</button></form><p className="login-note">系统会在服务端核验账号、员工状态及角色权限。</p></div></main>;
}
