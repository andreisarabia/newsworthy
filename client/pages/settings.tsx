import React from 'react';

import Header from '../components/Header';
import UserSettings from '../components/UserSettings';

export default class Settings extends React.Component {
  render() {
    return (
      <>
        <Header />
        <UserSettings />
      </>
    );
  }
}
