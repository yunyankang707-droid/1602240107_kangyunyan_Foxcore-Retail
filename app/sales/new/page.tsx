import { AlertTriangle, CalendarClock } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { Shell } from '@/components/Shell';
import { PageHeading } from '@/components/AdminUI';
import { SaleForm } from '@/components/SaleForm';

export default async function NewSale() {
  const session = await requireRole(['sales_consultant']);
  const db = createAdminClient();
  const [{ data: assignments, error }, { data: products, error: productError }] = await Promise.all([
    db.from('shift_assignment').select('id,shift_id,assignment_status,staff:staff_id(full_name),shift:shift_id(starts_at,ends_at,booth:booth_id(booth_code,location_note,event:event_id(event_name)))').eq('staff_id', session.staff.id).eq('assignment_status', 'assigned'),
    db.from('product').select('id,sku,product_name,min_unit_price').eq('is_active', true).order('product_name'),
  ]);
  if (error || productError) throw new Error(`数据库查询失败：${error?.message || productError?.message}`);

  // The server request timestamp is intentionally captured once to evaluate the live shift window.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const active: any = ((assignments || []) as any[]).find(item => item.shift && new Date(item.shift.starts_at).getTime() <= now && new Date(item.shift.ends_at).getTime() >= now);
  const broken = active && (!active.shift?.booth || !active.shift.booth.event);
  return <Shell role="sales_consultant" name={session.staff.full_name}>
    <PageHeading title="销售记录录入" description="确认当前班次后添加商品，系统将在服务端校验并保存销售记录" />
    {!active ? <section className="panel assignment-empty"><span><CalendarClock size={28} /></span><h2>当前没有有效班次</h2><p>目前没有处于有效时间范围内的已分配班次，请联系系统管理者检查班次时间和分配状态。</p></section>
      : broken ? <section className="panel assignment-empty warning"><span><AlertTriangle size={28} /></span><h2>班次关联信息不完整</h2><p>当前班次未正确关联展位或活动，暂时无法录入销售。请联系系统管理者修复班次、展位与活动的关联。</p></section>
      : !products?.length ? <section className="panel assignment-empty warning"><span><AlertTriangle size={28} /></span><h2>暂无可销售商品</h2><p>当前没有启用状态的商品，请联系系统管理者维护商品资料。</p></section>
      : <SaleForm assignment={active as any} products={products as any} />}
  </Shell>;
}
