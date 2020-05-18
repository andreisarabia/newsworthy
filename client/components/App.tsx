import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ApplicationView = styled.main`
  display: flex;
`;

export default class App extends React.Component {
  async componentDidMount() {
    const { data } = await axios.get('/api/article/list');
    console.log(data);
  }

  render() {
    return <ApplicationView>
      
    </ApplicationView>;
  }
}
