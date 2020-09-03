import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import '../static/styles.scss';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer />
    </>
  );
}

export default MyApp;
