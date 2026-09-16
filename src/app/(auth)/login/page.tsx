import { AdminLoginView } from '@/components/auth/admin-login-view';

export const metadata = {
  title: 'Sign In — SocialFlow',
  description: 'Sign in to access your SocialFlow workspace and administrative dashboard.',
};

export default function LoginPage() {
  return <AdminLoginView defaultRedirect="/dashboard" />;
}
