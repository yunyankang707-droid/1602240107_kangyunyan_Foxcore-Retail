import Link from 'next/link';
import { BarChart3, PackageCheck, ReceiptText, Search } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { getStatisticsFilters } from '@/lib/reference-data';
import { Shell } from '@/components/Shell';
import { MetricCard, PageHeading } from '@/components/AdminUI';
import { ActivitySalesChart, SalesTrendChart } from '@/components/StatsChart';
import { money } from '@/lib/format';

const chinaDate = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const validDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export default async function Statistics({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await requireRole(['manager']);
  const params = await searchParams;
  const now = new Date();
  const start = validDate(params.start) ? params.start! : chinaDate(new Date(now.getTime() - 30 * 864e5));
  const end = validDate(params.end) ? params.end! : chinaDate(now);
  if (start > end) throw new Error('开始日期不得晚于结束日期');
  const db = createAdminClient();
  let query = db.from('sale_line').select('quantity,line_amount,product_id,sale!inner(id,sold_at,shift_assignment!inner(staff_id,staff:staff_id(full_name),shift:shift_id!inner(booth:booth_id!inner(event:event_id!inner(id,event_name))))))').gte('sale.sold_at', `${start}T00:00:00+08:00`).lte('sale.sold_at', `${end}T23:59:59.999+08:00`);
  if (params.staff) query = query.eq('sale.shift_assignment.staff_id', params.staff);
  if (params.product) query = query.eq('product_id', params.product);
  if (params.event) query = query.eq('sale.shift_assignment.shift.booth.event.id', params.event);
  const [{ data, error }, filters] = await Promise.all([query, getStatisticsFilters()]);
  if (error) throw new Error(`数据库查询失败：${error.message}`);
  const rows = (data || []) as any[];
  const count = new Set(rows.map(row => row.sale.id)).size;
  const quantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const amount = rows.reduce((sum, row) => sum + Number(row.line_amount), 0);
  const activities = new Map<string, number>();
  const dates = new Map<string, number>();
  rows.forEach(row => {
    const activity = row.sale.shift_assignment.shift.booth.event.event_name;
    const date = chinaDate(new Date(row.sale.sold_at));
    activities.set(activity, (activities.get(activity) || 0) + Number(row.line_amount));
    dates.set(date, (dates.get(date) || 0) + Number(row.line_amount));
  });
  const activityData = [...activities].map(([name, value]) => ({ name, amount: value }));
  const trendData = [...dates].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({ name: name.slice(5), amount: value }));
  return <Shell role="manager" name={session.staff.full_name}>
    <PageHeading title="销售数据统计" description="按日期、销售顾问、商品及活动分析真实经营数据" />
    <form className="panel statistics-filter"><label><span>开始日期</span><input className="field" name="start" type="date" defaultValue={start} /></label><label><span>结束日期</span><input className="field" name="end" type="date" defaultValue={end} /></label><label><span>销售顾问</span><select className="field" name="staff" defaultValue={params.staff || ''}><option value="">全部顾问</option>{filters.staff.map(item => <option value={item.id} key={item.id}>{item.full_name}</option>)}</select></label><label><span>商品</span><select className="field" name="product" defaultValue={params.product || ''}><option value="">全部商品</option>{filters.products.map(item => <option value={item.id} key={item.id}>{item.product_name}</option>)}</select></label><label><span>活动</span><select className="field" name="event" defaultValue={params.event || ''}><option value="">全部活动</option>{filters.events.map(item => <option value={item.id} key={item.id}>{item.event_name}</option>)}</select></label><div className="filter-actions"><button className="btn btn-primary" type="submit"><Search size={17} />查询</button><Link className="btn btn-secondary" href="/statistics">重置</Link></div></form>
    <section className="metric-grid"><MetricCard label="销售笔数" value={count} icon={ReceiptText} /><MetricCard label="销售数量" value={quantity} icon={PackageCheck} tone="blue" /><MetricCard label="销售总额" value={money(amount)} icon={BarChart3} tone="amber" /></section>
    <div className="charts-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>按活动销售额</h2><p>金额单位：人民币元</p></div></div>{activityData.length ? <ActivitySalesChart data={activityData} /> : <div className="chart-empty">没有符合条件的记录</div>}</section><section className="panel chart-panel"><div className="panel-heading"><div><h2>每日销售趋势</h2><p>{start} 至 {end} · 金额单位：人民币元</p></div></div>{trendData.length ? <SalesTrendChart data={trendData} /> : <div className="chart-empty">没有符合条件的记录</div>}</section></div>
  </Shell>;
}
