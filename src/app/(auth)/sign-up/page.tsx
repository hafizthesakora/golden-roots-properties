import { redirect } from 'next/navigation';

const SignUpPage = async () => {
  redirect('/sign-in');
};

export default SignUpPage;
