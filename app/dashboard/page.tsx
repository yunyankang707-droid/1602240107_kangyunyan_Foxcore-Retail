import Link from 'next/link';
import { ArrowRight, BarChart3, ClipboardList, Database, PackageCheck, ReceiptText, ShoppingBag } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { Shell } from '@/components/Shell';
import { MetricCard, PageHeading } from '@/components/AdminUI';
import { money, dt } from '@/lib/format';

export default async function Dashboard() {
  const session = await requireRole(['sales_consultant', 'manager']);
  const db = createAdminClient();
  const manager = session.staff.staff_role === 'manager';
  let salesQuery = db.from('sale').select('id,total_amount,assignment_id,shift_assignment!inner(staff_id)');
  let linesQuery = db.from('sale_line').select('quantity,sale!inner(assignment_id,shift_assignment!inner(staff_id))');
  if (!manager) {
    salesQuery = salesQuery.eq('shift_assignment.staff_id', session.staff.id);
    linesQuery = linesQuery.eq('sale.shift_assignment.staff_id', session.staff.id);
  }
  const recentQuery = manager ? Promise.resolve({ data: [], error: null }) : db.from('sale').select('id,sold_at,total_amount,shift_assignment!inner(staff_id,shift:shift_id(booth:booth_id(event:event_id(event_name)))),sale_line(quantity,product:product_id(product_name))').eq('shift_assignment.staff_id', session.staff.id).order('sold_at', { ascending: false }).limit(5);
  const [{ data: sales, error }, { data: lines, error: linesError }, { data: recent, error: recentError }] = await Promise.all([salesQuery, linesQuery, recentQuery]);
  if (error || linesError || recentError) throw new Error(`数据库查询失败：${error?.message || linesError?.message || recentError?.message}`);
  const total = (sales || []).reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const quantity = (lines || []).reduce((sum, line) => sum + line.quantity, 0);
  const quickLinks = manager ? [
    { href: '/statistics', title: '查询销售统计', text: '按日期与多维条件分析经营表现', icon: BarChart3 },
    { href: '/sales', title: '查看销售记录', text: '检索并核对每笔销售及商品明细', icon: ClipboardList },
    { href: '/master-data', title: '查看基础数据', text: '浏览场地、活动、员工和商品资料', icon: Database },
  ] : [
    { href: '/sales/new', title: '录入销售', text: '确认班次后提交销售明细', icon: ShoppingBag },
    { href: '/sales', title: '我的销售', text: '核对本人已录入的记录', icon: ClipboardList },
    { href: '/master-data', title: '商品与活动', text: '查看可用基础资料', icon: Database },
  ];
  return <Shell role={session.staff.staff_role} name={session.staff.full_name}>
    <PageHeading title={manager ? '经营仪表板' : '销售工作台'} description="实时掌握系统中的销售表现与业务概况" action={!manager && <Link href="/sales/new" className="btn btn-primary">录入新销售</Link>} />
    <section className="metric-grid"><MetricCard label="销售笔数" value={sales?.length || 0} icon={ReceiptText} /><MetricCard label="销售数量" value={quantity} icon={PackageCheck} tone="blue" /><MetricCard label="销售总额" value={money(total)} icon={BarChart3} tone="amber" /></section>
    <section className="panel quick-panel"><div className="panel-heading"><div><h2>快速开始</h2><p>常用业务功能快捷入口</p></div></div><div className="quick-grid">{quickLinks.map(({ href, title, text, icon: Icon }) => <Link href={href} prefetch className="quick-link" key={href}><span><Icon size={22} /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="quick-arrow" size={18} /></Link>)}</div></section>
    {!manager && <section className="panel recent-sales"><div className="panel-heading"><div><h2>近期销售记录</h2><p>最近录入的 5 笔个人销售</p></div><Link href="/sales">查看全部</Link></div>{recent?.length ? <div className="recent-list">{(recent as any[]).map(sale => <Link href={`/sales/${sale.id}`} key={sale.id}><span><strong>订单 #{sale.id}</strong><small>{dt(sale.sold_at)} · {sale.shift_assignment.shift.booth.event.event_name}</small></span><em>{sale.sale_line.reduce((sum: number, line: any) => sum + line.quantity, 0)} 件</em><b>{money(sale.total_amount)}</b><ArrowRight size={16} /></Link>)}</div> : <div className="empty-state">暂无个人销售记录</div>}</section>}
  </Shell>;
}
