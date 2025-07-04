import { Link as ReactRouterLink } from 'react-router-dom';
import { LoginForm } from 'wasp/client/auth';
import { AuthPageLayout } from './AuthPageLayout';

export default function Login() {
  return (
    <AuthPageLayout>
      <LoginForm />
      <br />
      <span className='text-sm font-medium text-gray-900'>
        Forgot your password?{' '}
        <ReactRouterLink to="/request-password-reset" className='underline'>
          reset it
        </ReactRouterLink>
        .
      </span>
    </AuthPageLayout>
  );
}
