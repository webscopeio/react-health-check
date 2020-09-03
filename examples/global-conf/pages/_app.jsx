import { ToastContainer } from 'react-toastify';
import { HealthCheckConfig } from '@webscopeio/react-health-check';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import '../static/styles.scss';

function MyApp({ Component, pageProps }) {
  return (
    <HealthCheckConfig
      value={{
        services: [
          {
            name: 'auth',
            url: '/api/health',
          },
        ],
        onSuccess: ({ service, since }) => {
          toast.success(
            <>
              Service <strong>"{service.name}"</strong> is available since: <br />{' '}
              {Date(since).toString()} 🎉
            </>,
          );
        },
        onError: ({ service, since }) => {
          toast.error(
            <>
              Service <strong>"{service.name}"</strong> is not available since: <br />{' '}
              {Date(since).toString()} 😔
            </>,
          );
        },
        refreshInterval: 2000,
      }}
    >
      <Component {...pageProps} />
      <ToastContainer />
    </HealthCheckConfig>
  );
}

export default MyApp;
