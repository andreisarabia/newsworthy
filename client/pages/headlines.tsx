import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Header from '../components/Header';
import ApplicationView from '../styles/ApplicationView';

import { getDomainFromUrl } from '../util/url';
import { NewsArticleApiData } from '../typings';

const shortenDescription = (str: string, maxLen: number = 135) =>
  str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;

const fetchHeadlines = async () => {
  const { data: articles } = await axios.post(
    `${window.location.origin}/api/article/news/top-headlines`
  );

  return articles;
};

const Headlines = () => {
  const [newsHeadlines, setNewsHeadlines] = useState<NewsArticleApiData[]>([]);

  useEffect(() => {
    fetchHeadlines().then(setNewsHeadlines);
  }, []);

  return (
    <ApplicationView>
      <Header />

      <main id='saved-articles'>
        {newsHeadlines.map(article => (
          <div key={article.url} className='saved-article'>
            <div className='article-card'>
              <a
                href={article.url}
                target='_blank'
                rel='nofollow noopener noreferrer'
              >
                <img
                  src={article.urlToImage || ''}
                  alt={article.description}
                  loading='lazy'
                />
              </a>
              <h3>{article.title}</h3>
              <h4>
                {article.description ? (
                  shortenDescription(article.description)
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
};

export default Headlines;
