import { requireRole } from '@/lib/auth';
import { getMasterData, getSalesReferenceData } from '@/lib/reference-data';
import { Shell } from '@/components/Shell';
import { PageHeading } from '@/components/AdminUI';
import { MasterDataView } from '@/components/MasterDataView';

export default async function MasterData() {
  const session = await requireRole(['sales_consultant', 'manager']);
  const manager = session.staff.staff_role === 'manager';
  const data = manager ? await getMasterData() : await getSalesReferenceData();
  return <Shell role={session.staff.staff_role} name={session.staff.full_name}><PageHeading title="基础数据" description={manager ? '统一查看场地、活动、展位、班次、员工及商品业务资料' : '查看日常销售所需的商品、活动、场地及展位资料'} /><MasterDataView data={data} role={session.staff.staff_role} /></Shell>;
}
