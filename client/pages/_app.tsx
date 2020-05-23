import { AppProps } from 'next/app';

import '../public/css/main.css';

export default function CustomApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
