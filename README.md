# React Health Check 🏥

Lightweight React hook to check health of API services.

[![stable](https://badgen.net/npm/v/@webscopeio/react-health-check)](https://www.npmjs.com/package/@webscopeio/react-health-check)
![tslib](https://badgen.net/npm/types/tslib)
![checks](https://badgen.net/github/checks/webscopeio/react-health-check)
![dependabot](https://badgen.net/github/dependabot/webscopeio/react-health-check)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

---

## Installation 🧑‍🔧

```
npm i --save-dev @webscopeio/react-health-check
```

or

```
yarn add @webscopeio/react-health-check
```

## Usage ❓

```ts
const { states } = useHealthCheck({
  services: [
    {
      name: 'auth',
      url: 'https://example.com/auth/health',
    },
    {
      name: 'payment',
      url: 'https://example.com/payment/health',
    },
  ],
  onSuccess: (states) => {
    console.log('All API services are available 🎉');
  },
  onError: (states) => {
    console.log('At least one API service is down 😔');
  },
});
```

## Configuration 🛠

`useHealthCheck()` hook accepts a configuration object with keys:

| Key             | Type                                       | Description                                                                      |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| services        | `HealthCheckService<S = string>`           | Array defining all API services that should be checked.                          |
| onSuccess       | `(states: HealthCheckState<S>[]) => void;` | Callback called when all API services are available.                             |
| onError         | `(states: HealthCheckState<S>[]) => void;` | Callback called when at least one API service is down.                           |
| refreshInterval | `number`                                   | Polling interval for health checks in milliseconds. <br> **Default value: 3000** |

## License

MIT | Developed by Webscope.io
