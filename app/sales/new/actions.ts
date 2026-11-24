'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const Schema = z.object({ assignmentId: z.coerce.number().int().positive(), lines: z.array(z.object({ product_id: z.number().int().positive(), quantity: z.number().int().positive().max(9999), unit_price: z.number().nonnegative() })).min(1).max(100) });

export async function saveSale(input: unknown) {
  try {
    const session = await requireRole(['sales_consultant']);
    const payload = Schema.parse(input);
    const db = createAdminClient();
    const { data: assignment, error: assignmentError } = await db.from('shift_assignment').select('id,staff_id,assignment_status,shift:shift_id(starts_at,ends_at,booth:booth_id(event:event_id(id)))').eq('id', payload.assignmentId).eq('staff_id', session.staff.id).maybeSingle();
    if (assignmentError || !assignment) return { ok: false, error: '该班次不属于当前销售顾问，无法提交销售' };
    if (assignment.assignment_status !== 'assigned') return { ok: false, error: '当前班次已取消，无法提交销售' };
    const shift = assignment.shift as any;
    if (!shift?.booth?.event) return { ok: false, error: '当前班次的展位或活动关联不完整，请联系系统管理者' };
    const now = Date.now();
    if (new Date(shift.starts_at).getTime() > now || new Date(shift.ends_at).getTime() < now) return { ok: false, error: '当前班次不在有效时间范围内，无法提交销售' };
    const { data, error } = await db.rpc('register_sale', { p_assignment_id: payload.assignmentId, p_lines: payload.lines });
    if (error) return { ok: false, error: error.message };
    revalidatePath('/dashboard');
    revalidatePath('/sales');
    revalidatePath('/statistics');
    return { ok: true, id: data };
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, error: '销售明细格式有误，请检查商品、数量和成交单价' };
    return { ok: false, error: error instanceof Error ? error.message : '保存失败' };
  }
}
