import React from 'react';
import styled from 'styled-components';

import { ReaderViewSettings } from '../typings';

const ArticleSettingsView = styled.ul`
  position: absolute;
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
`;

const ArticleSettings = ({
  fontSize,
  backgroundColor,
  lineHeight,
  width,
  onChange,
}: ReaderViewSettings & {
  onChange: React.Dispatch<React.SetStateAction<ReaderViewSettings>>;
}) => {
  const handleBackgroundColorClick = (event: React.MouseEvent) => {
    event.preventDefault();
  };
  return (
    <ArticleSettingsView>
      <li>
        <input
          type='range'
          name='font-size'
          id='font-size'
          min='1'
          max='1.6'
          step='0.1'
          defaultValue={fontSize.slice(0, 3)} // e.g. 1.2 rem
          onChange={e => console.log(e.target)}
        />

        <label htmlFor='font-size'>Aa</label>
      </li>
      <li>
        <input
          type='color'
          value='#fbfbf7'
          id='white'
          onClick={handleBackgroundColorClick}
          readOnly
        />
        <input
          type='color'
          value='#B9AD94'
          id='sepia'
          onClick={handleBackgroundColorClick}
          readOnly
        />
        <input
          type='color'
          value='#1A1A1A'
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
          defaultValue={lineHeight}
          onChange={e => console.log(e.target)}
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
          defaultValue={width.slice(0, 2)} // e.g. 70%
          onChange={e => console.log(e.target)}
        />

        <label htmlFor='line-height'>&lt;~&gt;</label>
      </li>
    </ArticleSettingsView>
  );
};

export default ArticleSettings;
