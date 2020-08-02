import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import ArticleSettingsView from '../styles/ArticleSettingsView';
import * as colors from '../constants/colors';

import { ReaderViewSettings } from '../typings';

type ArticleSettingsProps = ReaderViewSettings & {
  onChange: (change: Partial<ReaderViewSettings>) => void;
};

const getColorStyles = (background: string) => {
  switch (background) {
    case colors.BLACK:
      return { color: colors.WHEAT };
    default:
      return { color: colors.BLACK };
  }
};

const ArticleSettings = ({
  onChange,
  fontSize,
  lineHeight,
  width,
  backgroundColor,
}: ArticleSettingsProps) => {
  const [settingsStyle, setSettingsStyle] = useState(
    getColorStyles(backgroundColor)
  );

  const handleBackgroundColorClick = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    event.preventDefault(); // otherwise, a color input box pops up

    const backgroundColor = (event.target as HTMLInputElement).value;

    onChange({ backgroundColor });
    setSettingsStyle(getColorStyles(backgroundColor));
  };

  useEffect(() => {
    setSettingsStyle(getColorStyles(backgroundColor));
  }, [backgroundColor]);

  return (
    <ArticleSettingsView style={settingsStyle}>
      <div id='prev-page'>
        <Link href='/'>
          <a>&lt;</a>
        </Link>
      </div>
      <ul>
        <li>
          <label htmlFor='font-size'>Aa</label>
          <input
            type='range'
            name='font-size'
            id='font-size'
            min='1'
            max='1.6'
            step='0.1'
            defaultValue={fontSize.slice(0, -3)} // e.g. 1.2 rem -> 1.2
            onChange={event =>
              onChange({ fontSize: `${event.target.value}rem` })
            }
          />
        </li>

        <li id='background-list-option'>
          <input
            type='color'
            value={colors.WHITE}
            id='white'
            onClick={handleBackgroundColorClick}
            readOnly
          />
          <input
            type='color'
            value={colors.SEPIA}
            id='sepia'
            onClick={handleBackgroundColorClick}
            readOnly
          />
          <input
            type='color'
            value={colors.BLACK}
            id='black'
            onClick={handleBackgroundColorClick}
            readOnly
          />
        </li>

        <li>
          <label htmlFor='line-height'>][</label>

          <input
            type='range'
            name='line-height'
            id='line-height'
            min='1'
            max='2'
            step='0.25'
            defaultValue={lineHeight}
            onChange={event => onChange({ lineHeight: event.target.value })}
          />
        </li>

        <li>
          <label htmlFor='content-width'>[&lt;----&gt;]</label>

          <input
            type='range'
            name='content-width'
            id='content-width'
            min='50'
            max='80'
            step='10'
            defaultValue={width.slice(0, 2)} // e.g. 70%
            onChange={event => onChange({ width: `${event.target.value}%` })}
          />
        </li>
      </ul>
    </ArticleSettingsView>
  );
};

export default ArticleSettings;
