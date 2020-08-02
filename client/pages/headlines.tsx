import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

import Header from '../components/Header';
import ApplicationView from '../styles/ApplicationView';

import { getDomainFromUrl } from '../util/url';
import { NewsArticleApiData } from '../typings';

const shortenDescription = (desc: string, maxLen: number = 135) =>
  desc.length > maxLen ? `${desc.slice(0, maxLen)}...` : desc;

const fetchHeadlines = async () => {
  const { data: articles } = await axios.post(
    `${window.location.origin}/api/article/news/top-headlines`
  );

  return articles;
};

const HeadlinesGrid = ({ articles }: { articles: NewsArticleApiData[] }) => {
  if (articles.length === 0) return <p>Fetching headlines...</p>;

  return (
    <main id='saved-articles'>
      {articles.map(article => (
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
  );
};

const Headlines = () => {
  const [newsHeadlines, setNewsHeadlines] = useState<NewsArticleApiData[]>([]);

  useEffect(() => {
    fetchHeadlines().then(setNewsHeadlines);
  }, []);

  return (
    <ApplicationView>
      <Head>
        <title>Headlines - Newsworthy</title>
      </Head>

      <Header />
      <HeadlinesGrid articles={newsHeadlines} />
    </ApplicationView>
  );
};

export default Headlines;
