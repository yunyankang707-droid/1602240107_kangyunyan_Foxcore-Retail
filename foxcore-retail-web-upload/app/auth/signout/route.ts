import { NextResponse } from 'next/server'; import { createAuthClient } from '@/lib/supabase/server';
export async function POST(req:Request){await (await createAuthClient()).auth.signOut();return NextResponse.redirect(new URL('/',req.url),303)}
