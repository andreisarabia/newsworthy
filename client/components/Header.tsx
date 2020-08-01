import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import Navbar from '../styles/Navbar';

const emptyStyle = Object.create(null);
const borderBottomStyle = { borderBottom: '2px solid #53a9d2' };

const Header = ({
  onAddLink = () => Promise.resolve(),
}: {
  onAddLink?: (url: string) => Promise<void>;
}) => {
  const [showSearchArticleInput, setShowSearchArticleInput] = useState(false);
  const [showAddLinkInput, setShowAddLinkInput] = useState(false);
  const [linkToAdd, setLinkToAdd] = useState('');
  const [pathname, setPathname] = useState('');

  const navLinkStyles = {
    display: showSearchArticleInput || showAddLinkInput ? 'none' : 'flex',
  };
  const searchInputStyle = {
    display: showSearchArticleInput ? 'initial' : 'none',
  };
  const addLinkStyle = {
    display: showAddLinkInput ? 'initial' : 'none',
  };

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <Navbar>
      <div id='logo-full'>
        <Link href='/'>
          <a>
            <img
              id='newsworthy-logo'
              src='./logo.png'
              alt='Newsworthy Logo'
              loading='lazy'
            />
          </a>
        </Link>
      </div>
      <div id='navigation-options'>
        <ul style={navLinkStyles}>
          <li style={pathname === '/' ? borderBottomStyle : emptyStyle}>
            <Link href='/'>
              <a className='nav-link'>Home</a>
            </Link>
          </li>
          <li
            style={pathname === '/headlines' ? borderBottomStyle : emptyStyle}
          >
            <Link href='/headlines'>
              <a className='nav-link'>Headlines</a>
            </Link>
          </li>
          <li style={pathname === '/sources' ? borderBottomStyle : emptyStyle}>
            <Link href='/sources'>
              <a className='nav-link'>Sources</a>
            </Link>
          </li>
        </ul>

        <div id='search-input'>
          <input
            type='search'
            placeholder=' Search'
            style={searchInputStyle}
            name='search-articles'
          />
        </div>

        <div id='add-link-input'>
          <form
            onSubmit={async e => {
              e.preventDefault();
              await onAddLink(linkToAdd);

              setShowAddLinkInput(false);
              setShowSearchArticleInput(false);
              setLinkToAdd('');
            }}
          >
            <input
              type='text'
              placeholder=' Add a link'
              name='add-article'
              style={addLinkStyle}
              value={linkToAdd}
              onChange={e => setLinkToAdd(e.target.value)}
            />
          </form>
        </div>
      </div>
      <div id='user-actions'>
        <span
          onClick={() => setShowAddLinkInput(!showAddLinkInput)}
          className='fas fa-search'
        ></span>
        <span
          onClick={() => setShowSearchArticleInput(!showSearchArticleInput)}
          className='fas fa-plus'
        ></span>
        <Link href='/settings'>
          <a>
            <span className='fas fa-cog'></span>
          </a>
        </Link>
      </div>
    </Navbar>
  );
};

export default Header;
