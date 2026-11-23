'use client';
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid } from 'recharts';
export function StatsChart({data}:{data:{name:string;amount:number}[]}){return <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={(v)=>[`¥${Number(v).toFixed(2)}`,'销售额']}/><Bar dataKey="amount" fill="#1f5e4b" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div>}
