import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import axios from 'axios';

import Header from '../components/Header';
import App from '../components/App';
import Sidebar from '../components/Sidebar';

import { SavedArticle } from '../typings';

const AppContainer = styled.div`
  display: flex;
`;

const getArticles = async (): Promise<SavedArticle[]> => {
  const {
    data: { articles },
  } = await axios.get(`${window.location.origin}/api/article/list`);

  return (articles as SavedArticle[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

const Home = () => {
  const [articles, setArticles] = useState<SavedArticle[]>([]);

  useEffect(() => {
    getArticles().then(setArticles);
  }, []);

  return (
    <>
      <Head>
        <title>Newsworthy - Save news for later</title>
      </Head>
      <Header
        onAddLink={async url => {
          const {
            data: { article },
          } = await axios.post('/api/article/save', { url });

          setArticles([article, ...articles]);
        }}
      />
      <AppContainer id='app-container'>
        <Sidebar />
        <App articles={articles} />
      </AppContainer>
    </>
  );
};

export default Home;
