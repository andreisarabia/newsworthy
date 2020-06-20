import React from 'react';
import axios from 'axios';

import Header from '../components/Header';

import { NewsArticleApiData } from '../typings';

interface HeadlinesState {
  list: NewsArticleApiData[];
}

export default class Headlines extends React.Component<{}, HeadlinesState> {
  state = {
    list: [] as NewsArticleApiData[],
  };

  async componentDidMount() {
    const {
      data: { articles },
    } = await axios.post(
      `${window.location.origin}/api/article/news/top-headlines`
    );

    this.setState({ list: articles });
  }

  render() {
    return (
      <>
        <Header />

        <main>
          {this.state.list.map(article => (
            <div key={article.url}>
              <span>{article.title}</span>
              <span>{article.url}</span>
            </div>
          ))}
        </main>
      </>
    );
  }
}
