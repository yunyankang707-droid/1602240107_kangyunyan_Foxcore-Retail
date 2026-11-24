'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, MapPin, Plus, ShoppingBag, Trash2, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveSale } from '@/app/sales/new/actions';
import { money, dt } from '@/lib/format';

type Product = { id: number; sku: string; product_name: string; min_unit_price: number };
type Assignment = { id: number; staff: { full_name: string }; shift: { starts_at: string; ends_at: string; booth: { booth_code: string; location_note: string; event: { event_name: string } } } };
type Line = { key: number; product_id: number; quantity: number; unit_price: number };

export function SaleForm({ assignment, products }: { assignment: Assignment; products: Product[] }) {
  const router = useRouter();
  const first = products[0];
  const [nextKey, setNextKey] = useState(2);
  const [lines, setLines] = useState<Line[]>([{ key: 1, product_id: first.id, quantity: 1, unit_price: Number(first.min_unit_price) }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const total = useMemo(() => lines.reduce((sum, line) => sum + (Number.isFinite(line.quantity * line.unit_price) ? line.quantity * line.unit_price : 0), 0), [lines]);
  const update = (key: number, patch: Partial<Line>) => setLines(current => current.map(line => line.key === key ? { ...line, ...patch } : line));
  const addLine = () => { setLines(current => [...current, { key: nextKey, product_id: first.id, quantity: 1, unit_price: Number(first.min_unit_price) }]); setNextKey(value => value + 1); };
  const validationError = lines.find(line => !Number.isInteger(line.quantity) || line.quantity < 1) ? '商品数量必须为正整数' : lines.find(line => { const product = products.find(item => item.id === line.product_id); return !product || !Number.isFinite(line.unit_price) || line.unit_price < Number(product.min_unit_price); }) ? '成交单价不得低于商品销售单价' : '';

  async function submit() {
    if (busy || validationError) { setError(validationError); return; }
    setBusy(true);
    setError('');
    const result = await saveSale({ assignmentId: assignment.id, lines: lines.map(({ product_id, quantity, unit_price }) => ({ product_id, quantity, unit_price })) });
    if (result.ok) { router.push(`/sales?created=${result.id}`); router.refresh(); return; }
    setBusy(false);
    setError(result.error || '保存失败');
  }

  return <div className="sale-entry-flow">
    <section className="panel entry-section"><div className="entry-section-title"><span>1</span><div><h2>销售班次信息</h2><p>以下信息来自当前账号的有效班次</p></div></div><div className="shift-info-grid"><div><UserRound size={20} /><span>当前销售顾问<strong>{assignment.staff.full_name}</strong></span></div><div><CalendarClock size={20} /><span>当前班次<strong>{dt(assignment.shift.starts_at)} 至 {dt(assignment.shift.ends_at)}</strong></span></div><div><ShoppingBag size={20} /><span>所属活动<strong>{assignment.shift.booth.event.event_name}</strong></span></div><div><MapPin size={20} /><span>当前展位<strong>{assignment.shift.booth.booth_code} · {assignment.shift.booth.location_note}</strong></span></div></div></section>
    <section className="panel entry-section"><div className="entry-section-title"><span>2</span><div><h2>商品选择与录入</h2><p>可添加多项商品并调整数量和实际成交单价</p></div></div><div className="table-scroll"><table className="data-table entry-table"><thead><tr><th>商品</th><th>商品销售单价</th><th>数量</th><th>成交单价</th><th className="amount-cell">商品金额</th><th>操作</th></tr></thead><tbody>{lines.map(line => { const product = products.find(item => item.id === line.product_id)!; return <tr key={line.key}><td><select className="field product-select" value={line.product_id} disabled={busy} onChange={event => { const id = Number(event.target.value); const selected = products.find(item => item.id === id)!; update(line.key, { product_id: id, unit_price: Number(selected.min_unit_price) }); }}>{products.map(item => <option value={item.id} key={item.id}>{item.product_name} · {item.sku}</option>)}</select></td><td>{money(product.min_unit_price)}</td><td><input className="field number-field" type="number" min="1" step="1" value={line.quantity} disabled={busy} aria-label={`${product.product_name}数量`} onChange={event => update(line.key, { quantity: Number(event.target.value) })} /></td><td><input className="field price-field" type="number" min={Number(product.min_unit_price)} step="0.01" value={line.unit_price} disabled={busy} aria-label={`${product.product_name}成交单价`} onChange={event => update(line.key, { unit_price: Number(event.target.value) })} /></td><td className="amount-cell"><strong>{money(line.quantity * line.unit_price)}</strong></td><td><button type="button" className="remove-line" disabled={busy || lines.length === 1} onClick={() => setLines(current => current.filter(item => item.key !== line.key))}><Trash2 size={16} />删除</button></td></tr>; })}</tbody></table></div><button type="button" className="btn btn-secondary add-line" disabled={busy} onClick={addLine}><Plus size={17} />添加商品</button></section>
    <section className="panel entry-section confirm-section"><div className="entry-section-title"><span>3</span><div><h2>确认并提交</h2><p>请核对商品明细，提交后将保存为正式销售记录</p></div></div><div className="confirm-lines">{lines.map(line => { const product = products.find(item => item.id === line.product_id)!; return <div key={line.key}><span>{product.product_name}<small>{line.quantity} 件 × {money(line.unit_price)}</small></span><strong>{money(line.quantity * line.unit_price)}</strong></div>; })}</div>{(error || validationError) && <div className="entry-error" role="alert">{error || validationError}</div>}<footer className="entry-submit"><div><span>销售总额</span><strong>{money(total)}</strong></div><button type="button" className="btn btn-primary" disabled={busy || Boolean(validationError)} onClick={submit}>{busy ? '正在提交，请勿重复操作…' : '确认并提交销售'}</button></footer></section>
  </div>;
}
