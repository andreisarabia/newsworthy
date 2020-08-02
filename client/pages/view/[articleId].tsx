import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';

import ArticleSettings from '../../components/ArticleSettings';
import ReaderWrapperDiv from '../../styles/ReaderWrapper';

import { defaultStyleSettings } from '../../constants/reader';
import * as colors from '../../constants/colors';

import { SavedArticle, ReaderViewSettings } from '../../typings';

type ArticleViewerProps = { article: SavedArticle | null } & ReaderViewSettings;

const fetchArticleData = async (id: string): Promise<SavedArticle> => {
  const { data } = await axios.get(`/api/article/${id}`);
  return data.article;
};

const ArticleViewer = ({
  article,
  width,
  ...mainStyleProps
}: ArticleViewerProps) => {
  if (article === null)
    return (
      <Head>
        <title>Getting article...</title>
      </Head>
    );

  const titleText = `${article.title} - ${
    article.source.name || article.domain
  } | Newsworthy`;

  return (
    <main style={{ paddingTop: '4rem', ...mainStyleProps }}>
      <Head>
        <title>{titleText}</title>
      </Head>
      <div style={{ margin: 'auto', width }}>
        <h2 style={{ marginTop: '0' }}>{article.title}</h2>
        <h4>{article.description}</h4>
        <div dangerouslySetInnerHTML={{ __html: article.content }}></div>
      </div>
    </main>
  );
};

const ReaderWrapper = () => {
  const [styleSettings, setStyleSettings] = useState(defaultStyleSettings);
  const [articleData, setArticleData] = useState<SavedArticle>(null);
  const {
    query: { id },
  } = useRouter();
  const saveSettingsChange = (change: Partial<ReaderViewSettings>) => {
    if (change.backgroundColor === styleSettings.backgroundColor) {
      change = { ...styleSettings, ...change };
    } else {
      let color: string = styleSettings.color;

      switch (change.backgroundColor) {
        case colors.WHITE:
        case colors.SEPIA:
          color = colors.BLACK;
          break;
        case colors.BLACK:
          color = colors.WHEAT;
          break;
      }

      change = { ...styleSettings, ...change, color };
    }
    setStyleSettings(change as ReaderViewSettings);
    localStorage.setItem('reader-settings', JSON.stringify(change));
  };

  useEffect(() => {
    if (id) fetchArticleData(id as string).then(setArticleData);
  }, [id]);

  useEffect(() => {
    const savedStyleSettings = localStorage.getItem('reader-settings');
    if (savedStyleSettings) setStyleSettings(JSON.parse(savedStyleSettings));
  }, []);

  return (
    <ReaderWrapperDiv id='wrapper'>
      <div id='article-settings-wrapper'>
        <ArticleSettings onChange={saveSettingsChange} {...styleSettings} />
      </div>
      <ArticleViewer article={articleData} {...styleSettings} />
    </ReaderWrapperDiv>
  );
};

export default ReaderWrapper;
