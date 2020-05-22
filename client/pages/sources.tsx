import React from 'react';

import Header from '../components/Header';
import NewsSources from '../components/NewsSources';

export default class Sources extends React.Component {
  render() {
    return (
      <>
        <Header />
        <NewsSources />
      </>
    );
  }
}
