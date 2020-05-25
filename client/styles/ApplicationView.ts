import styled from 'styled-components';

const ApplicationView = styled.main`
  > section#saved-articles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 90%;
    color: whitesmoke;

    h3 {
      font-weight: 100;
      font-size: 1rem;
      margin: 0.5rem 0;
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
      }
    }
  }

  span.article-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 0.75rem;
    color: #53a9d2 !important;

    .dot-separator {
      text-align: center;
    }
  }
`;

export default ApplicationView;
