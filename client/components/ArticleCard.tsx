import React from 'react';
import Link from 'next/link';

import { SavedArticle } from '../typings';

const ArticleCard = ({ article }: { article: SavedArticle }) => {
  const {
    slug,
    uniqueId,
    urlToImage,
    description,
    title,
    domain,
    wordCount,
    source,
  } = article;

  return (
    <div className='article-card'>
      <Link
        href={{ pathname: `view/${uniqueId}`, query: { id: uniqueId } }}
        as={`/view${slug}?id=${uniqueId}`}
      >
        <a>
          <img src={urlToImage || ''} alt={description} loading='lazy' />
        </a>
      </Link>
      <h3>{title}</h3>
      <h4>
        {description.length > 135
          ? `${description.slice(0, 135)}...`
          : description}
      </h4>
      <span className='article-meta'>
        <a
          className='meta-link'
          href={`https://${domain}`}
          target='_blank'
          rel='noreferrer'
        >
          {source.name || domain}
        </a>
        <span className='dot-separator'>•</span>
        <span>{wordCount} words</span>
      </span>
    </div>
  );
};

export default ArticleCard;
