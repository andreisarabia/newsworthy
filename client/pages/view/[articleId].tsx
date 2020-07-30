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

  const { width, ...rest } = styleProps;

  return (
    <main style={{ ...rest }}>
      <div style={{ width, margin: 'auto' }}>
        <h2 style={{ marginTop: '0' }}>{article.title}</h2>
        <h4>{article.description}</h4>
        <div dangerouslySetInnerHTML={{ __html: article.content }}></div>
      </div>
    </main>
  );
};

const ReaderWrapper = () => {
  const [styleSettings, setStyleSettings] = useState<ReaderViewSettings>({
    fontSize: '1.2rem',
    backgroundColor: '#fbfbf7',
    lineHeight: '1.5',
    width: '70%',
  });
  const [articleData, setArticleData] = useState<SavedArticle>(null);
  const {
    query: { id },
  } = useRouter();
  const handleSettingsChange = change => {
    setStyleSettings(previousSettings => {
      const newSettings = { ...previousSettings, ...change };
      localStorage.setItem('reader-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  useEffect(() => {
    if (id) fetchArticleData(id as string).then(setArticleData);

    const savedStyleSettings = localStorage.getItem('reader-settings');

    if (savedStyleSettings) setStyleSettings(JSON.parse(savedStyleSettings));
  }, [id]);

  return (
    <div id='wrapper'>
      <div id='article-settings-wrapper'>
        <ArticleSettings onChange={handleSettingsChange} {...styleSettings} />
      </div>
      <ArticleViewer article={articleData} {...styleSettings} />
    </div>
  );
};

export default ReaderWrapper;
