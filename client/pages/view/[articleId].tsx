import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import ArticleView from '../../styles/ArticleView';

import { SavedArticle } from '../../typings';

export default () => {
  const [articleData, setArticleData] = useState<SavedArticle>(null);
  const {
    query: { id },
  } = useRouter();

  useEffect(() => {
    const fetchArticleData = async (): Promise<void> => {
      if (!id) return;

      const {
        data: { article },
      } = await axios.get(`/api/article/${id}`);

      setArticleData(article);
    };

    fetchArticleData();
  }, [id]);

  if (articleData === null) return <p>Fetching...</p>;

  return (
    <ArticleView id='article-view'>
      <h2>{articleData.title}</h2>
      <h4>{articleData.description}</h4>

      <div
        dangerouslySetInnerHTML={{
          __html: articleData.content,
        }}
      ></div>
    </ArticleView>
  );
};
