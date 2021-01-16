# React Health Check 🏥

Lightweight React hook for checking health of API services.

[![stable](https://badgen.net/npm/v/@webscopeio/react-health-check)](https://www.npmjs.com/package/@webscopeio/react-health-check)
![tslib](https://badgen.net/npm/types/tslib)
![checks](https://badgen.net/github/checks/webscopeio/react-health-check)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)

---

## Installation 🧑‍🔧

```
npm i @webscopeio/react-health-check
```

or

```
yarn add @webscopeio/react-health-check
```

## Examples 😲

- [Basic](examples/basic)
- [Global configuration](examples/global-conf)

## Usage ❓

```ts
const { available, refresh } = useHealthCheck({
  service: {
    name: 'auth',
    url: 'https://example.com/auth/health',
  },
  onSuccess: ({ service, timestamp }) => {
    console.log(`Service "${service.name}" is available since "${timestamp}" 🎉`);
  },
  onError: ({ service, timestamp }) => {
    console.log(`Service "${service.name}" is not available since "${timestamp}" 😔`);
  },
});
```

You can also create a global configuration so you don't have to define services and callbacks every time:

```tsx
// App wrapper
<HealthCheckConfig
  value={{
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
    onSuccess: ({ service, timestamp }) => {
      console.log(`Service "${service.name}" is available since "${timestamp}" 🎉`);
    },
    onError: ({ service, timestamp }) => {
      console.log(`Service "${service.name}" is not available since "${timestamp}" 😔`);
    },
  }}
>
  <App />
</HealthCheckConfig>;

// Later in some child component
const { available } = useHealthCheck('auth');
```

## Configuration 🛠

`useHealthCheck()` hook accepts a configuration object with keys:

| Key                | Type                                | Description                                                                                                   |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| service            | `Service<S = string>`               | Object defining an API service to be checked.                                                                 |
| onSuccess          | `(state: ServiceState<S>) => void;` | Callback which should be called when API service becomes available again.                                     |
| onError            | `(state: ServiceState<S>) => void;` | Callback which should be called when API service becomes unavailable.                                         |  |
| refreshInterval    | `number`                            | Polling interval for health checks in milliseconds. <br> **Default value: 5000**                              |
| refreshWhileHidden | `boolean`                           | Determines whether polling should be paused while browser window isn't visible. <br> **Default value: false** |

Global configuration accepts the same keys as `useHealthCheck()` hook with the exception of "service". You need to specify array of "services" when using global configuration.

## License 💼

MIT | Developed by Webscope.io
