import { AppProps } from 'next/app';

import '../public/css/main.css';

const CustomApp = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
);

export default CustomApp;
