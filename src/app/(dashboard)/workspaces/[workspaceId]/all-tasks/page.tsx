import { redirect } from 'next/navigation';
import { getCurrent } from '@/features/auth/actions';
import { AllTasksClient } from './client';

const AllTasksPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');
  return <AllTasksClient />;
};

export default AllTasksPage;
