import React from 'react';

import styled from 'styled-components';

const SidebarSection = styled.section`
  ul {
    margin-left: 1rem;

    li {
      display: flex;
      align-items: center;
      font-family: Arial, sans-serif;
      padding: 1rem;
      margin: 0.5rem;

      h3 {
        margin: 0.1rem 1rem;
      }

      #current {
        background: #573b3b !important;
        border-radius: 0.4rem;
      }
    }
  }
`;

export default class Sidebar extends React.Component {
  render() {
    return (
      <SidebarSection id='side-bar'>
        <ul>
          <li>
            <span className='fas fa-house-user'></span>
            <h3>My List</h3>
          </li>
          <li>
            <span className='fas fa-star'></span>
            <h3>Favorites</h3>
          </li>
          <li>
            <span className='fas fa-tags'></span>
            <h3>Tags</h3>
          </li>
        </ul>
      </SidebarSection>
    );
  }
}
