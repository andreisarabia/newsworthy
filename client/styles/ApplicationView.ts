import styled from 'styled-components';

const ApplicationView = styled.main`
  margin: 2rem;

  > section#saved-articles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 90%;
    color: whitesmoke;

    h3 {
      font-weight: 100;
      font-size: 1rem;
      margin: 0;
    }

    h4 {
      margin: 0;
      font-size: 0.8rem;
      font-style: italic;
    }

    .saved-article {
      margin: 1rem;

      img {
        width: 100%;
        height: 95%;
      }
    }
  }

  span.article-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 0.75rem;
    color: #8c6894;
    width: 80%;

    .dot-separator {
      text-align: center;
      color: #53a9d2;
    }

    a.meta-link {
      color: #8c6894;
    }
  }
`;

export default ApplicationView;
