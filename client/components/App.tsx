import React from 'react';
import styled from 'styled-components';

import { SavedArticleProps } from '../typings';

const ApplicationView = styled.main`
  font-family: initial;

  > h2 {
    margin: 2rem;
  }

  > section#saved-articles {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 90%;
  }
`;

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
                <span>
                  <a href={article.domain} target='_blank'>
                    {article.source.name || article.domain}
                  </a>
                  {article.wordCount && `• ${(<span>article.wordCount</span>)}`}
                </span>
              </div>
            </div>
          ))}
        </section>
      </ApplicationView>
    );
  }
}
