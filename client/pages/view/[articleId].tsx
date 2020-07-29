import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import ArticleView from '../../styles/ArticleView';

import { SavedArticle } from '../../typings';

const fetchArticleData = async (id: string): Promise<SavedArticle> => {
  const { data } = await axios.get(`/api/article/${id}`);
  return data.article;
};

const ArticleViewer = () => {
  const [articleData, setArticleData] = useState<SavedArticle>(null);
  const {
    query: { id },
  } = useRouter();

  useEffect(() => {
    if (id) {
      fetchArticleData(id as string).then(setArticleData);
    }
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

export default ArticleViewer;
