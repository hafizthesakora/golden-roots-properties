import { getCurrent } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import { LeadsClient } from './client';

const LeadsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');
  return <LeadsClient />;
};

export default LeadsPage;
