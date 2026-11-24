import { NextResponse } from 'next/server';
import { createAdminClient, createAuthClient } from '@/lib/supabase/server';
import type { Role } from '@/lib/auth';

const loginPath: Record<Role, string> = { sales_consultant: '/login/sales', manager: '/login/manager' };
function failure(req: Request, role: Role, error: string) { return NextResponse.redirect(new URL(`${loginPath[role]}?error=${error}`, req.url), 303); }

export async function POST(req: Request) {
  const form = await req.formData();
  const selectedRole = String(form.get('role')) as Role;
  if (selectedRole !== 'sales_consultant' && selectedRole !== 'manager') return NextResponse.redirect(new URL('/login', req.url), 303);
  const auth = await createAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email: String(form.get('email') || ''), password: String(form.get('password') || '') });
  if (error || !data.user?.email) { if (error) console.error('Supabase 登录失败：', error.message); return failure(req, selectedRole, 'credentials'); }
  const loginName = data.user.email.split('@')[0];
  const { data: staff, error: staffError } = await createAdminClient().from('staff').select('staff_role,is_active').eq('login_name', loginName).maybeSingle();
  if (staffError || !staff) { await auth.auth.signOut(); return failure(req, selectedRole, 'staff'); }
  if (!staff.is_active) { await auth.auth.signOut(); return failure(req, selectedRole, 'inactive'); }
  if (staff.staff_role !== selectedRole) { await auth.auth.signOut(); return failure(req, selectedRole, 'mismatch'); }
  return NextResponse.redirect(new URL('/dashboard', req.url), 303);
}
