import type { AppProps } from 'next/app';

// add bootstrap css
import 'bootstrap/dist/css/bootstrap.css';

// global styles
import 'src/styles/globals.scss';

import { Header, Footer } from 'src/components';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
