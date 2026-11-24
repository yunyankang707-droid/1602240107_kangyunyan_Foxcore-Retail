import { Header } from '@/components/Header';
import { LoginCard } from '@/components/LoginCard';

export default async function ManagerLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <><Header hideLogin /><LoginCard role="manager" error={error} /></>;
}
