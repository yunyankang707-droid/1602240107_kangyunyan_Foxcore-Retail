'use client';

import { useState } from 'react';
import { Building2, CalendarDays, Clock3, MapPinned, Package, UsersRound } from 'lucide-react';
import { dt, money } from '@/lib/format';
import type { Role } from '@/lib/auth';

type Section = { key: string; title: string; icon: typeof Building2; rows: any[]; columns: { label: string; value: (row: any) => React.ReactNode }[] };

export function MasterDataView({ data, role }: { data: Record<string, any[]>; role: Role }) {
  const allSections: Section[] = [
    { key: 'venues', title: '场地', icon: Building2, rows: data.venues, columns: [{ label: '场地名称', value: row => row.venue_name }, { label: '场地地址', value: row => row.address || '—' }] },
    { key: 'events', title: '活动', icon: CalendarDays, rows: data.events, columns: [{ label: '活动名称', value: row => row.event_name }, { label: '所属场地', value: row => row.venue?.venue_name || '—' }, { label: '开始日期', value: row => row.start_date }, { label: '结束日期', value: row => row.end_date }] },
    { key: 'booths', title: '展位', icon: MapPinned, rows: data.booths, columns: [{ label: '展位编号', value: row => row.booth_code }, { label: '所属活动', value: row => row.event?.event_name || '—' }, { label: '展位位置', value: row => row.location_note || '—' }] },
    { key: 'shifts', title: '班次', icon: Clock3, rows: data.shifts, columns: [{ label: '活动', value: row => row.booth?.event?.event_name || '—' }, { label: '展位编号', value: row => row.booth?.booth_code || '—' }, { label: '班次开始时间', value: row => dt(row.starts_at) }, { label: '班次结束时间', value: row => dt(row.ends_at) }] },
    { key: 'staff', title: '员工', icon: UsersRound, rows: data.staff || [], columns: [{ label: '登录账号', value: row => row.login_name }, { label: '员工姓名', value: row => row.full_name }, { label: '员工角色', value: row => row.staff_role === 'manager' ? '系统管理者' : '销售顾问' }, { label: '员工状态', value: row => <span className={`status-badge ${row.is_active ? 'enabled' : 'disabled'}`}>{row.is_active ? '启用' : '停用'}</span> }] },
    { key: 'products', title: '商品', icon: Package, rows: data.products, columns: [{ label: '商品编码', value: row => row.sku }, { label: '商品名称', value: row => row.product_name }, { label: '商品分类', value: row => row.product_category?.category_name || '—' }, { label: '商品销售单价', value: row => money(row.min_unit_price) }, { label: '商品状态', value: row => <span className={`status-badge ${row.is_active ? 'enabled' : 'disabled'}`}>{row.is_active ? '在售' : '停用'}</span> }] },
  ];
  const sections = role === 'manager' ? allSections : allSections.filter(section => ['products', 'events', 'venues', 'booths'].includes(section.key)).sort((a, b) => ['products', 'events', 'venues', 'booths'].indexOf(a.key) - ['products', 'events', 'venues', 'booths'].indexOf(b.key));
  const [active, setActive] = useState(role === 'manager' ? 'venues' : 'products');
  const section = sections.find(item => item.key === active) || sections[0];
  return <><nav className="master-tabs" aria-label="基础数据分类">{sections.map(({ key, title, icon: Icon, rows }) => <button key={key} type="button" className={active === key ? 'active' : ''} onClick={() => setActive(key)}><Icon size={18} /><span>{title}</span><small>{rows.length}</small></button>)}</nav><section className="panel master-panel"><div className="panel-heading"><div><h2>{section.title}</h2><p>共 {section.rows.length} 条数据</p></div></div><div className="table-scroll"><table className="data-table master-table"><thead><tr>{section.columns.map(column => <th key={column.label}>{column.label}</th>)}</tr></thead><tbody>{section.rows.map((row, index) => <tr key={row.id ?? index}>{section.columns.map(column => <td key={column.label}>{column.value(row)}</td>)}</tr>)}</tbody></table></div>{!section.rows.length && <div className="empty-state">暂无{section.title}数据</div>}</section></>;
}
