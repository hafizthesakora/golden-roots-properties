import { redirect } from 'next/navigation';
import { getCurrent } from '@/features/auth/actions';
import { ContentPageClient } from './client';

const ContentPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');
  return <ContentPageClient />;
};

export default ContentPage;
