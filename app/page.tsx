import { BarChart3, ClipboardList, Megaphone, Package } from 'lucide-react';
import { Header } from '@/components/Header';

const features = [
  { title: '销售记录管理', description: '清晰录入并追踪每一笔现场销售', icon: ClipboardList },
  { title: '商品信息管理', description: '集中维护商品资料与销售规则', icon: Package },
  { title: '销售数据统计', description: '多维汇总销售表现与经营数据', icon: BarChart3 },
  { title: '活动经营分析', description: '洞察不同活动的经营成果', icon: Megaphone },
];

export default function Home() {
  return <><Header /><main className="home-main"><section className="home-hero">
    <div className="home-copy"><p className="eyebrow">现场零售 · 清晰可控</p><h1>让每一笔现场销售<br />完整、准确、可追溯</h1><p className="home-intro">面向音乐节与展会场景，统一管理班次、商品和销售明细，实时掌握活动经营表现。</p></div>
    <div className="feature-panel">{features.map(({ title, description, icon: Icon }) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={22} strokeWidth={1.8} /></span><div><h2>{title}</h2><p>{description}</p></div></article>)}</div>
  </section></main></>;
}
