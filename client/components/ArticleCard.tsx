import React from 'react';
import Link from 'next/link';

import { SavedArticle } from '../typings';

interface ArticleCardProps {
  article: SavedArticle;
}

export default class ArticleCard extends React.Component<ArticleCardProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      slug,
      uniqueId,
      urlToImage,
      description,
      title,
      domain,
      wordCount,
      source,
    } = this.props.article;
    const linkHref = { pathname: `/view${slug}`, query: { id: uniqueId } };

    return (
      <div className='article-card'>
        <Link
          href={linkHref}
          as={`/view${slug === '/' ? `/${uniqueId}` : slug}`}
        >
          <a>
            <img src={urlToImage || ''} alt={description} />
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
  }
}
