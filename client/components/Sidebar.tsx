import React from 'react';

import SidebarSection from '../styles/SidebarSection';

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
