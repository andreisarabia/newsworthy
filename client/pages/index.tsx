import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

import Header from '../components/Header';
import App from '../components/App';
import Sidebar from '../components/Sidebar';

import { SavedArticle, SavedArticleProps } from '../typings';

const AppContainer = styled.div`
  display: flex;
`;

const sortByDate = (a: Date, b: Date) => b.getTime() - a.getTime();

export async function getStaticProps() {
  const {
    data: { articles },
  } = await axios.get(`http://localhost:3000/api/article/list`);

  (articles as SavedArticle[]).sort((a, b) =>
    sortByDate(new Date(a.createdAt), new Date(b.createdAt))
  );

  return { props: { list: articles } };
}

export default class Home extends React.Component<SavedArticleProps> {
  constructor(props) {
    super(props);
  }

  async addToList(url: string): Promise<void> {
    try {
      const {
        data: { article },
      } = await axios.post('/api/article/save', { url });

      this.props.list.unshift(article);
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <>
        <Header onAddLink={link => this.addToList(link)} />
        <AppContainer id='app-container'>
          <Sidebar />
          <App list={this.props.list} />
        </AppContainer>
      </>
    );
  }
}
