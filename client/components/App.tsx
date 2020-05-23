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
        <h2>Home</h2>
        <section id='saved-articles'>
          {this.props.list.map(article => (
            <div key={article.url} className='saved-article'>
              <div>
                <img src={article.urlToImage || ''} alt='' />
              </div>
              <div>
                <h3>{article.title}</h3>
                <span className='article-meta'>
                  <a
                    className='meta-link'
                    href={article.domain}
                    target='_blank'
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
