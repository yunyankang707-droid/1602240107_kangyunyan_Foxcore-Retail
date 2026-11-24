import type { LucideIcon } from 'lucide-react';

export function PageHeading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function MetricCard({ label, value, icon: Icon, tone = 'green' }: { label: string; value: React.ReactNode; icon: LucideIcon; tone?: 'green' | 'blue' | 'amber' }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={21} /></span><div><p>{label}</p><strong>{value}</strong></div></article>;
}
