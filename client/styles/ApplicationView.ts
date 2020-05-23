import styled from 'styled-components';

const ApplicationView = styled.main`
  font-family: initial;

  > h2 {
    margin: 2rem;
  }

  > section#saved-articles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 90%;
    color: whitesmoke;

    h3 {
      font-weight: 100;
    }

    .saved-article {
      margin: 1rem;
      width: 21vw;

      img {
        width: 100%;
      }
    }
  }

  span.article-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 0.75rem;

    .dot-separator {
      text-align: center;
    }
  }
`;

export default ApplicationView;
