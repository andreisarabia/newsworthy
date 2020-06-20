import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

import Header from '../components/Header';
import App from '../components/App';
import Sidebar from '../components/Sidebar';

import { SavedArticle, SavedArticleState } from '../typings';

const AppContainer = styled.div`
  display: flex;
`;

const sortByDate = (a: Date, b: Date) => b.getTime() - a.getTime();

export default class Home extends React.Component<{}, SavedArticleState> {
  state = {
    list: [],
  };

  async componentDidMount() {
    const {
      data: { articles },
    } = await axios.get(`${window.location.origin}/api/article/list`);

    (articles as SavedArticle[]).sort((a, b) =>
      sortByDate(new Date(a.createdAt), new Date(b.createdAt))
    );

    this.setState({ list: articles });
  }

  async addToList(url: string): Promise<void> {
    try {
      const {
        data: { article },
      } = await axios.post('/api/article/save', { url });

      this.setState(state => ({ list: [article, ...state.list] }));
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <>
        <Header onAddLink={link => this.addToList(link)} />
        <AppContainer id='app-container'>
          <Sidebar />
          <App list={this.state.list} />
        </AppContainer>
      </>
    );
  }
}
