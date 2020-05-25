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

  async componentDidMount(): Promise<void> {
    try {
      const { data } = await axios.get('/api/article/list');

      this.setState({ list: data.articles });
    } catch (error) {
      this.setState({ list: [] });
    }
  }

  async addToList(url: string): Promise<void> {
    try {
      const {
        data: { article },
      } = await axios.post('/api/article/save', { url });

      this.setState(state => ({ list: [...state.list, article] }));
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <>
        <Header onAddLink={article => this.addToList(article)} />
        <AppContainer id='app-container'>
          <Sidebar />
          <App list={this.state.list} />
        </AppContainer>
      </>
    );
  }
}
