/**
 * @class ReactDetectOfflineAPI
 */

import * as React from 'react'

export type Props = {
  apiUrl: string,
  render: Function,
  checkInterval: number | null,
  onOnline: Function,
  onOffline: Function,
}

function timeout(ms: number, promise: Promise<any>) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject(new Error("timeout"))
    }, ms);
    promise.then(resolve, reject);
  })
}

export default class ReactDetectOfflineAPI extends React.Component<Props> {

  private interval: any;

  state = {
    online: null,
  };

  checkTimeout = () => {
    const {
      apiUrl,
    } = this.props;

    timeout(3000, fetch(apiUrl).then(() => {
      this.setState({online: true}, () => {
        this.props.onOnline()
      })
    })).catch(() => {
      this.setState({online: false}, () => {
        this.props.onOffline()
      })
    })
  };

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.apiUrl !== this.props.apiUrl) {
      this.checkTimeout()
    }
  }

  componentDidMount() {
    this.checkTimeout();
    this.interval = this.props.checkInterval !== null
      ?
      setInterval(this.checkTimeout, this.props.checkInterval)
      :
      null
  }

  componentWillUnmount(): void {
    if (this.interval !== null) {
      clearInterval(this.interval)
    }
  }

  render() {
    // Return null before we check for the first time
    if (this.state.online === null) {
      return null
    }

    return (
      <div>
        {this.props.render(this.state)}
      </div>
    )
  }
}
