import { useHealthCheck } from '@webscopeio/react-health-check';

export default function Home() {
  const { available } = useHealthCheck('auth');

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
