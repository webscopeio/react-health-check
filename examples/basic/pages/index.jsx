import { useHealthCheck } from '@webscopeio/react-health-check';
import { toast } from 'react-toastify';

export default function Home() {
  const { available } = useHealthCheck({
    service: {
      name: 'auth',
      url: '/api/health',
    },
    onSuccess: ({ service, timestamp }) => {
      toast.success(
        <>
          Service <strong>"{service.name}"</strong> is available since: <br />{' '}
          {Date(timestamp).toString()} 🎉
        </>,
      );
    },
    onError: ({ service, timestamp }) => {
      toast.error(
        <>
          Service <strong>"{service.name}"</strong> is not available since: <br />{' '}
          {Date(timestamp).toString()} 😔
        </>,
      );
    },
    refreshInterval: 2000,
  });

  return (
    <div className="container">
      <div className="health-wrapper">
        <p>Service health: </p>
        <span className={`availability ${available ? 'is-available' : ''}`}>
          {available ? 'Available' : 'Not available'}
        </span>
      </div>
      <div className="button-wrapper">
        <button type="button" onClick={() => fetch('/api/toggle')}>
          Toggle service health
        </button>
      </div>

      <p className="author">
        Made with ❤️ by{' '}
        <a href="https://webscope.io" target="_blank" rel="noopener noreferrer">
          Webscope.io
        </a>
      </p>
    </div>
  );
}
