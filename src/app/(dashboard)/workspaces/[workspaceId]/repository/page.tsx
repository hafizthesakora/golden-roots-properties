import { getCurrent } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import { RepositoryClient } from './client';

const RepositoryPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  return <RepositoryClient />;
};

export default RepositoryPage;
