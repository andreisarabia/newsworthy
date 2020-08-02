import styled from 'styled-components';

const ArticleSettingsView = styled.div`
  display: flex;
  justify-content: space-around;
  font-weight: 600;
  width: 60%;
  border-bottom: 1px solid black;
  margin: 0.7rem;
  position: fixed;
  opacity: 0;
  transition: opacity 1s;

  :hover {
    opacity: 0.7;
    transition: opacity 1s;
  }

  ul {
    display: flex;
    align-items: center;
    top: 0;
    right: 0;
    margin: 0;
    line-height: 3;
    padding: unset;

    li:not(#background-list-option) {
      display: grid;

      label {
        padding: 0;
        margin: -1rem;
        text-align: center;
      }
    }
  }

  #prev-page {
    font-size: 1.6rem;
  }
`;

export default ArticleSettingsView;
