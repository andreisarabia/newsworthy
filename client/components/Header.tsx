import React from 'react';
import Link from 'next/link';

import Navbar from '../styles/Navbar';

interface HeaderProps extends React.Props<any> {
  onAddLink?: (url: string) => Promise<void>;
}

interface HeaderState {
  showSearchArticleInput: boolean;
  showAddLinkInput: boolean;
  linkToAdd: string;
  pathname: string | null;
}

export default class Header extends React.Component<HeaderProps, HeaderState> {
  state = {
    showSearchArticleInput: false,
    showAddLinkInput: false,
    linkToAdd: '',
    pathname: null,
  };

  componentDidMount() {
    this.setState({ pathname: window.location.pathname });
  }

  reset() {
    this.setState({
      showAddLinkInput: false,
      showSearchArticleInput: false,
      linkToAdd: '',
    });
  }

  async addLink() {
    try {
      await this.props.onAddLink(this.state.linkToAdd);
    } finally {
      this.reset();
    }
  }

  toggleSearchInput() {
    this.setState(state => ({
      showSearchArticleInput: !state.showSearchArticleInput,
      showAddLinkInput: false,
    }));
  }

  toggleAddLinkInput() {
    this.setState(state => ({
      showAddLinkInput: !state.showAddLinkInput,
      showSearchArticleInput: false,
    }));
  }

  render() {
    const navLinkStyles = {
      display:
        this.state.showSearchArticleInput || this.state.showAddLinkInput
          ? 'none'
          : 'flex',
    };
    const searchInputStyle = {
      display: this.state.showSearchArticleInput ? 'initial' : 'none',
    };
    const addLinkStyle = {
      display: this.state.showAddLinkInput ? 'initial' : 'none',
    };
    const borderBottomStyle = { borderBottom: '2px solid #53a9d2' };

    return (
      <Navbar>
        <div id='logo-full'>
          <Link href='/'>
            <a>
              <img
                id='newsworthy-logo'
                src='./logo.png'
                alt='Newsworthy Logo'
              />
            </a>
          </Link>
        </div>
        <div id='navigation-options'>
          <ul style={navLinkStyles}>
            <li style={this.state.pathname === '/' ? borderBottomStyle : {}}>
              <Link href='/'>
                <a className='nav-link'>Home</a>
              </Link>
            </li>
            <li
              style={
                this.state.pathname === '/headlines' ? borderBottomStyle : {}
              }
            >
              <Link href='/headlines'>
                <a className='nav-link'>Headlines</a>
              </Link>
            </li>
            <li
              style={
                this.state.pathname === '/sources' ? borderBottomStyle : {}
              }
            >
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
                await this.addLink();
              }}
            >
              <input
                type='text'
                placeholder=' Add a link'
                name='add-article'
                style={addLinkStyle}
                value={this.state.linkToAdd}
                onChange={e => this.setState({ linkToAdd: e.target.value })}
              />
            </form>
          </div>
        </div>
        <div id='user-actions'>
          <span
            onClick={() => this.toggleSearchInput()}
            className='fas fa-search'
          ></span>
          <span
            onClick={() => this.toggleAddLinkInput()}
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
  }
}
