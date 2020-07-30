import React from 'react';
import styled from 'styled-components';

import * as colors from '../constants/colors';

import { ReaderViewSettings } from '../typings';

type ArticleSettingsProps = ReaderViewSettings & {
  onChange: (change: Partial<ReaderViewSettings>) => void;
};

const ArticleSettingsView = styled.div`
  position: absolute;

  > ul {
    position: fixed;
    top: 0;
    right: 0;
    margin: 3rem;
    line-height: 3;
    padding: unset;

    > li {
      display: flex;
      justify-content: center;
      margin: 1rem;
    }
  }
`;

const ArticleSettings = ({
  onChange,
  fontSize,
  lineHeight,
  width,
}: ArticleSettingsProps) => {
  const handleBackgroundColorClick = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    event.preventDefault(); // otherwise, a color input box pops up

    const backgroundColor = (event.target as HTMLInputElement).value;

    let fontColor: string;

    switch (backgroundColor) {
      case colors.BLACK:
        fontColor = colors.WHEAT;
        break;
      case colors.WHITE:
      case colors.SEPIA:
      default:
        fontColor = colors.BLACK;
        break;
    }

    onChange({ backgroundColor, color: fontColor });
  };

  return (
    <ArticleSettingsView>
      <ul>
        <li>
          <input
            type='range'
            name='font-size'
            id='font-size'
            min='1'
            max='1.6'
            step='0.1'
            value={fontSize.slice(0, 3)} // e.g. 1.2 rem
            onChange={event =>
              onChange({ fontSize: `${event.target.value}rem` })
            }
          />

          <label htmlFor='font-size'>Aa</label>
        </li>
        <li>
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
          <input
            type='range'
            name='line-height'
            id='line-height'
            min='1'
            max='2'
            step='0.25'
            value={lineHeight}
            onChange={event => onChange({ lineHeight: event.target.value })}
          />

          <label htmlFor='line-height'>][</label>
        </li>
        <li>
          <input
            type='range'
            name='content-width'
            id='content-width'
            min='50'
            max='80'
            step='10'
            value={width.slice(0, 2)} // e.g. 70%
            onChange={event => onChange({ width: `${event.target.value}%` })}
          />

          <label htmlFor='content-width'>&lt;~&gt;</label>
        </li>
      </ul>
    </ArticleSettingsView>
  );
};

export default ArticleSettings;
