import { unstable_cache } from 'next/cache';
import { createAdminClient } from './supabase/server';

export const getStatisticsFilters = unstable_cache(async () => {
  const db = createAdminClient();
  const [staff, products, events] = await Promise.all([
    db.from('staff').select('id,full_name').eq('staff_role', 'sales_consultant').eq('is_active', true).order('full_name'),
    db.from('product').select('id,product_name').eq('is_active', true).order('product_name'),
    db.from('event').select('id,event_name').order('start_date', { ascending: false }),
  ]);
  const error = staff.error || products.error || events.error;
  if (error) throw new Error(`数据库查询失败：${error.message}`);
  return { staff: staff.data || [], products: products.data || [], events: events.data || [] };
}, ['statistics-filters'], { revalidate: 60, tags: ['reference-data'] });

export const getMasterData = unstable_cache(async () => {
  const db = createAdminClient();
  const [venues, events, booths, shifts, staff, products] = await Promise.all([
    db.from('venue').select('*').order('venue_name'),
    db.from('event').select('*,venue(venue_name)').order('start_date', { ascending: false }),
    db.from('booth').select('*,event(event_name)').order('booth_code'),
    db.from('shift').select('*,booth(booth_code,event(event_name))').order('starts_at', { ascending: false }),
    db.from('staff').select('*').order('full_name'),
    db.from('product').select('*,product_category(category_name)').order('product_name'),
  ]);
  const error = [venues, events, booths, shifts, staff, products].find(result => result.error)?.error;
  if (error) throw new Error(`数据库查询失败：${error.message}`);
  return { venues: venues.data || [], events: events.data || [], booths: booths.data || [], shifts: shifts.data || [], staff: staff.data || [], products: products.data || [] };
}, ['master-data'], { revalidate: 60, tags: ['reference-data'] });

export const getSalesReferenceData = unstable_cache(async () => {
  const db = createAdminClient();
  const [venues, events, booths, products] = await Promise.all([
    db.from('venue').select('*').order('venue_name'),
    db.from('event').select('*,venue(venue_name)').order('start_date', { ascending: false }),
    db.from('booth').select('*,event(event_name)').order('booth_code'),
    db.from('product').select('*,product_category(category_name)').eq('is_active', true).order('product_name'),
  ]);
  const error = [venues, events, booths, products].find(result => result.error)?.error;
  if (error) throw new Error(`数据库查询失败：${error.message}`);
  return { venues: venues.data || [], events: events.data || [], booths: booths.data || [], products: products.data || [] };
}, ['sales-reference-data'], { revalidate: 60, tags: ['reference-data'] });
