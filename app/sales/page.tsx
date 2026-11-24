import Link from 'next/link';
import { BarChart3, ClipboardList, PackageCheck, ReceiptText, Search } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { Shell } from '@/components/Shell';
import { PageHeading } from '@/components/AdminUI';
import { MetricCard } from '@/components/AdminUI';
import { getStatisticsFilters } from '@/lib/reference-data';
import { money, dt } from '@/lib/format';

const PAGE_SIZE = 15;
type Params = { created?: string; order?: string; consultant?: string; page?: string; start?: string; end?: string; event?: string };

export default async function Sales({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await requireRole(['sales_consultant', 'manager']);
  const manager = session.staff.staff_role === 'manager';
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const db = createAdminClient();
  let query = db.from('sale').select('id,sold_at,total_amount,shift_assignment!inner(staff_id,staff:staff_id!inner(full_name),shift:shift_id!inner(booth:booth_id!inner(booth_code,event:event_id!inner(id,event_name)))),sale_line(quantity,unit_price,line_amount,product:product_id(product_name,sku))', { count: 'exact' }).order('sold_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (!manager) query = query.eq('shift_assignment.staff_id', session.staff.id);
  if (params.order && /^#?\d+$/.test(params.order.trim())) query = query.eq('id', Number(params.order.replace('#', '')));
  if (manager && params.consultant?.trim()) query = query.ilike('shift_assignment.staff.full_name', `%${params.consultant.trim()}%`);
  if (!manager && params.start) query = query.gte('sold_at', `${params.start}T00:00:00+08:00`);
  if (!manager && params.end) query = query.lte('sold_at', `${params.end}T23:59:59.999+08:00`);
  if (!manager && params.event) query = query.eq('shift_assignment.shift.booth.event.id', params.event);
  let summaryQuery = db.from('sale').select('id,total_amount,shift_assignment!inner(staff_id,shift:shift_id!inner(booth:booth_id!inner(event:event_id!inner(id)))),sale_line(quantity)').eq('shift_assignment.staff_id', session.staff.id);
  if (params.start) summaryQuery = summaryQuery.gte('sold_at', `${params.start}T00:00:00+08:00`);
  if (params.end) summaryQuery = summaryQuery.lte('sold_at', `${params.end}T23:59:59.999+08:00`);
  if (params.event) summaryQuery = summaryQuery.eq('shift_assignment.shift.booth.event.id', params.event);
  const [{ data, error, count }, summaryResult, filters] = await Promise.all([query, manager ? Promise.resolve({ data: [], error: null }) : summaryQuery, manager ? Promise.resolve(null) : getStatisticsFilters()]);
  if (error) throw new Error(`数据库查询失败：${error.message}`);
  if (summaryResult.error) throw new Error(`数据库查询失败：${summaryResult.error.message}`);
  const total = count || 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = (summaryResult.data || []) as any[];
  const personalQuantity = summary.reduce((sum, sale) => sum + sale.sale_line.reduce((lineSum: number, line: any) => lineSum + line.quantity, 0), 0);
  const personalAmount = summary.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const pageHref = (target: number) => { const next = new URLSearchParams(); for (const key of ['order', 'consultant', 'start', 'end', 'event'] as const) if (params[key]) next.set(key, params[key]!); next.set('page', String(target)); return `/sales?${next}`; };
  return <Shell role={session.staff.staff_role} name={session.staff.full_name}>
    <PageHeading title={manager ? '销售记录管理' : '我的销售业绩'} description={manager ? '检索并核对销售订单、顾问及商品明细' : '查看个人销售指标、订单与商品明细'} action={!manager && <Link className="btn btn-primary" href="/sales/new">录入新销售</Link>} />
    {params.created && <div className="success-message">销售记录 #{params.created} 已成功保存。</div>}
    {manager ? <section className="records-overview"><span><ClipboardList size={20} /></span><div><strong>{total}</strong><p>销售记录总数</p></div></section> : <section className="metric-grid"><MetricCard label="我的销售笔数" value={summary.length} icon={ReceiptText} /><MetricCard label="我的销售数量" value={personalQuantity} icon={PackageCheck} tone="blue" /><MetricCard label="我的销售总额" value={money(personalAmount)} icon={BarChart3} tone="amber" /></section>}
    <form className={`panel filter-bar sales-filter${manager ? '' : ' personal-sales-filter'}`}>{manager ? <><label><span>订单号</span><input className="field" name="order" defaultValue={params.order || ''} placeholder="例如 1024" /></label><label><span>销售顾问</span><input className="field" name="consultant" defaultValue={params.consultant || ''} placeholder="输入顾问姓名" /></label></> : <><label><span>开始日期</span><input className="field" name="start" type="date" defaultValue={params.start || ''} /></label><label><span>结束日期</span><input className="field" name="end" type="date" defaultValue={params.end || ''} /></label><label><span>活动</span><select className="field" name="event" defaultValue={params.event || ''}><option value="">全部活动</option>{filters?.events.map(item => <option key={item.id} value={item.id}>{item.event_name}</option>)}</select></label></>}<button className="btn btn-primary" type="submit"><Search size={17} />查询记录</button><Link className="btn btn-secondary" href="/sales">重置</Link></form>
    <section className="panel records-panel"><div className="table-scroll"><table className="data-table sales-table"><thead><tr><th>订单信息</th><th>销售顾问</th><th>活动与展位</th><th>商品明细</th><th className="amount-cell">销售总额</th><th>操作</th></tr></thead><tbody>{data?.map((sale: any) => <tr key={sale.id}><td><Link className="order-link" href={`/sales/${sale.id}`}>#{sale.id}</Link><span className="cell-secondary">{dt(sale.sold_at)}</span></td><td><strong className="cell-primary">{sale.shift_assignment.staff.full_name}</strong></td><td><span className="cell-primary">{sale.shift_assignment.shift.booth.event.event_name}</span><span className="cell-secondary">展位 {sale.shift_assignment.shift.booth.booth_code}</span></td><td><div className="product-lines">{sale.sale_line.map((line: any, index: number) => <div key={`${line.product.sku}-${index}`}><span>{line.product.product_name}</span><small>{line.product.sku} · {line.quantity} 件 · {money(line.line_amount)}</small></div>)}</div></td><td className="amount-cell"><strong>{money(sale.total_amount)}</strong></td><td><Link className="detail-link" href={`/sales/${sale.id}`}>查看详情</Link></td></tr>)}</tbody></table></div>{!data?.length && <div className="empty-state">暂无符合条件的销售记录</div>}{total > 0 && <footer className="pagination"><span>第 {page} / {pages} 页，共 {total} 条</span><div>{page > 1 ? <Link className="page-button" href={pageHref(page - 1)}>上一页</Link> : <span className="page-button disabled">上一页</span>}{page < pages ? <Link className="page-button" href={pageHref(page + 1)}>下一页</Link> : <span className="page-button disabled">下一页</span>}</div></footer>}</section>
  </Shell>;
}
