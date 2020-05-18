import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import axios, { AxiosError } from 'axios';

interface HeaderState {
  showSearchArticleInput: boolean;
  showAddLinkInput: boolean;
  linkToAdd: string;
}

const Navbar = styled.header`
  display: flex;

  #logo-full {
    flex: 0.8;
    text-align: center;

    img#newsworthy-logo {
      width: 60%;
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
      color: #b385bd;
      :hover {
        color: whitesmoke;
        cursor: pointer;
      }
    }
  }

  #navigation-options {
    > ul {
      display: flex;
      > li {
        margin: 0.5rem 1rem;
      }
      a.nav-link {
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

export default class Header extends React.Component<{}, HeaderState> {
  state = {
    showSearchArticleInput: false,
    showAddLinkInput: false,
    linkToAdd: '',
  };

  async addLink() {
    try {
      const { data } = await axios.post('/api/article/save', {
        url: this.state.linkToAdd,
      });

      console.log(data);
    } catch (error) {
      console.log(error, new Date());
    } finally {
      this.setState({ linkToAdd: '' });
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
            <li>
              <Link href='/'>
                <a className='nav-link'>Home</a>
              </Link>
            </li>
            <li>
              <Link href='/headlines'>
                <a className='nav-link'>Headlines</a>
              </Link>
            </li>
            <li>
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
