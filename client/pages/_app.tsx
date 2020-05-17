import { AppProps } from 'next/app';

import '../styles/main.css';
import '../styles/css/all.css';

export default function CustomApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
