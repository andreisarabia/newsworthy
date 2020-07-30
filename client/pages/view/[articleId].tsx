import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import ArticleSettings from '../../components/ArticleSettings';

import { SavedArticle, ReaderViewSettings } from '../../typings';

const fetchArticleData = async (id: string): Promise<SavedArticle> => {
  const { data } = await axios.get(`/api/article/${id}`);
  return data.article;
};

const ArticleViewer = ({
  article,
  ...styleProps
}: { article: SavedArticle | null } & ReaderViewSettings) => {
  if (article === null) return <p>Fetching article data...</p>;

  return (
    <main style={{ ...styleProps, margin: '4rem auto' }}>
      <h2>{article.title}</h2>
      <h4>{article.description}</h4>
      <div dangerouslySetInnerHTML={{ __html: article.content }}></div>
    </main>
  );
};

const ReaderWrapper = () => {
  const [styleSettings, setStyleSettings] = useState<ReaderViewSettings>({
    fontSize: '1.2rem',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    lineHeight: '1.5',
    width: '70%',
  });
  const [articleData, setArticleData] = useState<SavedArticle>(null);
  const {
    query: { id },
  } = useRouter();

  useEffect(() => {
    if (id) {
      fetchArticleData(id as string).then(setArticleData);
    }
  }, [id]);

  return (
    <div id='wrapper'>
      <ArticleSettings onChange={setStyleSettings} {...styleSettings} />
      <ArticleViewer article={articleData} {...styleSettings} />
    </div>
  );
};

export default ReaderWrapper;
