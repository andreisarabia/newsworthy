import React from 'react';

import ApplicationView from '../styles/ApplicationView';
import ArticleCard from './ArticleCard';

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
              <ArticleCard article={article} />
            </div>
          ))}
        </section>
      </ApplicationView>
    );
  }
}
