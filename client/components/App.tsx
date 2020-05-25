import React from 'react';

import ApplicationView from '../styles/ApplicationView';

import { SavedArticleProps } from '../typings';

export default class App extends React.Component<SavedArticleProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ApplicationView>
        <section id='saved-articles'>
          {this.props.list.map(article => (
            <div key={article.uniqueId} className='saved-article'>
              <div>
                <img src={article.urlToImage || ''} alt='' />
              </div>
              <div>
                <h3>{article.title}</h3>
                <h4>
                  {article.description.length > 135
                    ? `${article.description.slice(0, 135)}...`
                    : article.description}
                </h4>
                <span className='article-meta'>
                  <a
                    className='meta-link'
                    href={`https://${article.domain}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {article.source.name || article.domain}
                  </a>
                  <span className='dot-separator'>•</span>
                  <span>{article.wordCount} words</span>
                </span>
              </div>
            </div>
          ))}
        </section>
      </ApplicationView>
    );
  }
}
