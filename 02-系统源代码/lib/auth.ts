import { redirect } from 'next/navigation';
import { createAdminClient, createAuthClient } from './supabase/server';
export type Role = 'sales_consultant'|'manager';
export async function getSessionStaff() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const auth = await createAuthClient();
  const { data:{ user } } = await auth.auth.getUser();
  if (!user?.email) return null;
  const login = user.email.split('@')[0];
  const { data, error } = await createAdminClient().from('staff').select('*').eq('login_name',login).eq('is_active',true).single();
  if (error) return null;
  return { user, staff:data };
}
export async function requireRole(roles:Role[]) { const s=await getSessionStaff(); if(!s) redirect('/login'); if(!roles.includes(s.staff.staff_role)) redirect('/dashboard?error=forbidden'); return s; }
