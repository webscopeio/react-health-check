# react-detect-offline-api

## Install

```bash
npm install --save react-detect-offline-api
```

[Demo](https://webscopeio.github.io/react-detect-offline-api/)

## Usage

```tsx
import * as React from 'react'

import ReactDetectOfflineAPI from 'react-detect-offline-api'

class Example extends React.Component {
  render () {
    return (
      <ReactDetectOfflineAPI
        apiUrl={'http://yourapiurl.com'}
        checkInterval={5000}
        onOnline={() => {
          console.log('Online')
        }}
        onOffline={() => {
          console.log('Offline')
        }}
        initialStatusCallback={status => {
          console.log('Initial status ', status ? 'online' : 'offline')
        }}
        render={({ online }) =>
          online
            ?
            <div>Online</div>
            :
            <div>Offline</div>
        } />
    )
  }
}
```

Please note that if a request is blocked by CORS policy, this component will not work.      

| Props | Required | Type | Description |
| ----- | -------- | ---- | ----------- |
| apiUrl | true | string | API to check |
| checkInterval | true | number &#124; null | Polling interval. If null, there will be only one check on `componentDidMount` |
| render | false | Function | We're using [Render Props](https://reactjs.org/docs/render-props.html) to render online of offline component. See an example for more info. |
| onOnline | false | Function | Called once an API becomes online and was offline |
| onOffline | false | Function | Called once an API becomes offline and was online |
| initialStatusCallback | false | (status: boolean) => void | Calledback that returnes an initial status |
   
## License

MIT | Developed by [Webscope.io](https://webscope.io)
