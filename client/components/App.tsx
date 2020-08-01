import React from 'react';

import ApplicationView from '../styles/ApplicationView';
import ArticleCard from './ArticleCard';

import { SavedArticle } from '../typings';

const App = ({ articles }: { articles: SavedArticle[] }) => {
  return (
    <ApplicationView>
      <section id='saved-articles'>
        {articles.map(article => (
          <div key={article.uniqueId} className='saved-article'>
            <ArticleCard article={article} />
          </div>
        ))}
      </section>
    </ApplicationView>
  );
};

export default App;
