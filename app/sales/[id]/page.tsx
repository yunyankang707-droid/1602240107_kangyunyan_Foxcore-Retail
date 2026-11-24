import Link from 'next/link';
import { ArrowLeft, CalendarClock, MapPin, UserRound } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { Shell } from '@/components/Shell';
import { money, dt } from '@/lib/format';

export default async function SaleDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(['sales_consultant', 'manager']);
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const manager = session.staff.staff_role === 'manager';
  let query = createAdminClient().from('sale').select('id,sold_at,total_amount,shift_assignment!inner(staff_id,staff:staff_id(full_name),shift:shift_id(starts_at,ends_at,booth:booth_id(booth_code,location_note,event:event_id(event_name)))),sale_line(quantity,unit_price,line_amount,product:product_id(product_name,sku))').eq('id', Number(id));
  if (!manager) query = query.eq('shift_assignment.staff_id', session.staff.id);
  const { data: sale, error } = await query.maybeSingle();
  if (error) throw new Error(`数据库查询失败：${error.message}`);
  if (!sale) notFound();
  const item = sale as any;
  return <Shell role={session.staff.staff_role} name={session.staff.full_name}><Link href="/sales" className="back-link admin-back"><ArrowLeft size={17} />返回销售记录</Link><div className="detail-title"><div><p>销售订单</p><h1>#{item.id}</h1></div><strong>{money(item.total_amount)}</strong></div><section className="detail-meta"><div><CalendarClock size={20} /><span>销售时间<em>{dt(item.sold_at)}</em></span></div><div><UserRound size={20} /><span>销售顾问<em>{item.shift_assignment.staff.full_name}</em></span></div><div><MapPin size={20} /><span>活动与展位<em>{item.shift_assignment.shift.booth.event.event_name} · {item.shift_assignment.shift.booth.booth_code}</em></span></div></section><section className="panel detail-lines"><div className="panel-heading"><div><h2>商品明细</h2><p>共 {item.sale_line.reduce((sum: number, line: any) => sum + line.quantity, 0)} 件商品</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>商品</th><th>商品编码</th><th>数量</th><th>成交单价</th><th className="amount-cell">小计</th></tr></thead><tbody>{item.sale_line.map((line: any, index: number) => <tr key={`${line.product.sku}-${index}`}><td><strong>{line.product.product_name}</strong></td><td>{line.product.sku}</td><td>{line.quantity}</td><td>{money(line.unit_price)}</td><td className="amount-cell"><strong>{money(line.line_amount)}</strong></td></tr>)}</tbody></table></div></section></Shell>;
}
