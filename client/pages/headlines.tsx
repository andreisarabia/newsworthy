import React from 'react';
import axios from 'axios';

import Header from '../components/Header';
import ApplicationView from '../styles/ApplicationView';

import { getDomainFromUrl } from '../util/url';
import { NewsArticleApiData } from '../typings';

interface HeadlinesState {
  list: NewsArticleApiData[];
}

export default class Headlines extends React.Component<{}, HeadlinesState> {
  state = {
    list: [] as NewsArticleApiData[],
  };

  async componentDidMount() {
    try {
      const {
        data: { articles },
      } = await axios.post(
        `${window.location.origin}/api/article/news/top-headlines`
      );

      this.setState({ list: articles });
    } catch (error) {
      console.error(error);
      this.setState({ list: [] });
    }
  }

  render() {
    return (
      <ApplicationView>
        <Header />

        <main id='saved-articles'>
          {this.state.list.map(article => (
            <div key={article.url} className='saved-article'>
              <div className='article-card'>
                <a href={article.url} target='_blank' rel='noreferrer'>
                  <img
                    src={article.urlToImage || ''}
                    alt={article.description}
                    loading='lazy'
                  />
                </a>
                <h3>{article.title}</h3>
                <h4>
                  {article.description ? (
                    article.description.length > 135 ? (
                      `${article.description.slice(0, 135)}...`
                    ) : (
                      article.description
                    )
                  ) : (
                    <i>No description available</i>
                  )}
                </h4>
                <span className='article-meta'>
                  <a href={`https://${getDomainFromUrl(article.url)}`}>
                    {article.source.name || getDomainFromUrl(article.url)}
                  </a>
                </span>
              </div>
            </div>
          ))}
        </main>
      </ApplicationView>
    );
  }
}
