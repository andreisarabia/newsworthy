import styled from 'styled-components';

const SidebarSection = styled.section`
  font-family: Helvetica, sans-serif;

  ul {
    margin-left: 1rem;

    li {
      display: flex;
      align-items: center;
      padding: 1rem;
      margin: 0.5rem;

      h3 {
        margin: 0.1rem 1rem;
        font-weight: 100;
      }

      #current {
        background: #573b3b !important;
        border-radius: 0.4rem;
      }
    }
  }
`;

export default SidebarSection;
