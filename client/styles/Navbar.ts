import styled from 'styled-components';

const Navbar = styled.header`
  display: flex;

  #logo-full {
    flex: 0.8;
    text-align: center;

    img#newsworthy-logo {
      margin-top: 1rem;
    }
  }

  #navigation-options {
    flex: 1.5;
  }

  #user-actions {
    flex: 1;

    span.fas {
      margin: 1rem;
      padding: 1rem;
      font-size: 1.3rem;
      :hover {
        cursor: pointer;
      }
    }
  }

  #navigation-options {
    > ul {
      display: flex;

      > li {
        margin: 0.5rem 2rem;
        padding: 0.5rem;
        :hover {
          color: whitesmoke;
          border-bottom: 1px solid #53a9d2;
        }
      }
      a.nav-link {
        font-size: 1.2rem;
        padding: 1rem;
        :hover {
          color: whitesmoke;
        }
      }
    }

    div#search-input {
      margin: 1rem;
    }

    input {
      width: 100%;
      padding: 0.25rem;
      font-size: 1.5rem;
      background: rgb(0, 0, 0) none repeat scroll 0% 0%;
      border: 2px solid rgb(0, 0, 0);
      color: #b385bd;
    }
  }
`;

export default Navbar;
