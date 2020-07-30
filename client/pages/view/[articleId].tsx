import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import ArticleSettings from '../../components/ArticleSettings';

import * as colors from '../../constants/colors';

import { SavedArticle, ReaderViewSettings } from '../../typings';

const fetchArticleData = async (id: string): Promise<SavedArticle> => {
  const { data } = await axios.get(`/api/article/${id}`);
  return data.article;
};

const ArticleViewer = ({
  article,
  width,
  ...mainStyleProps
}: { article: SavedArticle | null } & ReaderViewSettings) => {
  if (article === null) return <p>Fetching article data...</p>;

  return (
    <main style={{ paddingTop: '4rem', ...mainStyleProps }}>
      <div style={{ margin: 'auto', width }}>
        <h2 style={{ marginTop: '0' }}>{article.title}</h2>
        <h4>{article.description}</h4>
        <div dangerouslySetInnerHTML={{ __html: article.content }}></div>
      </div>
    </main>
  );
};

const defaultStyleSettings = {
  fontSize: '1.2rem',
  backgroundColor: colors.WHITE,
  lineHeight: '1.5',
  width: '70%',
  color: colors.BLACK,
} as ReaderViewSettings;

const ReaderWrapper = () => {
  const [styleSettings, setStyleSettings] = useState(defaultStyleSettings);
  const [articleData, setArticleData] = useState<SavedArticle>(null);
  const {
    query: { id },
  } = useRouter();
  const saveSettingsChange = (change: Partial<ReaderViewSettings>) => {
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
        <ArticleSettings onChange={saveSettingsChange} {...styleSettings} />
      </div>
      <ArticleViewer article={articleData} {...styleSettings} />
    </div>
  );
};

export default ReaderWrapper;
