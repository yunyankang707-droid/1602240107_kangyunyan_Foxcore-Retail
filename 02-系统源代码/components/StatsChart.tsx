'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Point = { name: string; amount: number };
const amountLabel = (value: unknown) => [`¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`, '销售额'];
const axisStyle = { fontSize: 12, fill: '#64748b' };

export function ActivitySalesChart({ data }: { data: Point[] }) {
  return <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 22 }}><CartesianGrid stroke="#e8eeeb" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} label={{ value: '活动', position: 'insideBottom', offset: -12, fill: '#64748b', fontSize: 12 }} /><YAxis tick={axisStyle} axisLine={false} tickLine={false} width={62} label={{ value: '销售额（元）', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} /><Tooltip formatter={amountLabel} contentStyle={{ borderRadius: 10, border: '1px solid #dbe5e0' }} /><Bar dataKey="amount" fill="#1f5e4b" radius={[6, 6, 0, 0]} maxBarSize={52} /></BarChart></ResponsiveContainer></div>;
}

export function SalesTrendChart({ data }: { data: Point[] }) {
  return <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 8, right: 18, left: 8, bottom: 22 }}><CartesianGrid stroke="#e8eeeb" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} label={{ value: '日期', position: 'insideBottom', offset: -12, fill: '#64748b', fontSize: 12 }} /><YAxis tick={axisStyle} axisLine={false} tickLine={false} width={62} label={{ value: '销售额（元）', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} /><Tooltip formatter={amountLabel} contentStyle={{ borderRadius: 10, border: '1px solid #dbe5e0' }} /><Line type="monotone" dataKey="amount" stroke="#1f5e4b" strokeWidth={3} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div>;
}

export const StatsChart = ActivitySalesChart;
