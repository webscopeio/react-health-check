import React, { Component } from 'react'

import ReactDetectOfflineAPI from 'react-detect-offline-api'

export default class App extends Component {
  state = {
    url: 'https://'
  }

  render() {
    return (
      <div>
        <p>
          Please note that if a request is blocked by CORS policy, this component will not work.
        </p>
        <input
          type="text"
          placeholder='Type your API url'
          value={this.state.url}
          onChange={({ target: { value: url } }) => this.setState({ url })}
        />
        <ReactDetectOfflineAPI
          apiUrl={this.state.url}
          checkInterval={5000}
          initialStatusCallback={status => {
            console.log('Initial status ', status ? 'online' : 'offline')
          }}
          onOnline={() => {
            console.log('Online')
          }}
          onOffline={() => {
            console.log('Offline')
          }}
          render={({ online }) =>
            online
              ?
              <div>Online</div>
              :
              <div>Offline</div>
          } />
      </div>
    )
  }
}
