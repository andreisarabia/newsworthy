import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

import Header from '../components/Header';
import App from '../components/App';
import Sidebar from '../components/Sidebar';

import { SavedArticleProps } from '../typings';

interface SavedArticleState extends SavedArticleProps {}

const AppContainer = styled.div`
  display: flex;
`;

export default class Home extends React.Component<{}, SavedArticleState> {
  state = { list: [] };

  async componentDidMount() {
    try {
      const { data } = await axios.get('/api/article/list');

      this.setState({ list: data.articles });
    } catch (error) {
      this.setState({ list: [] });
    }
  }

  render() {
    return (
      <>
        <Header />
        <AppContainer id='app-container'>
          <Sidebar />
          <App list={this.state.list} />
        </AppContainer>
      </>
    );
  }
}
