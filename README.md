# newsworthy

newsworthy is a news article saver with a no-nonsense UI.

# Features

- Add news article content and metadata with just the URL
- Uses [Postlight's Mercury Parser](https://github.com/postlight/mercury-parser) and [JSDOM](https://github.com/jsdom/jsdom) to parse ([sanitized](https://github.com/cure53/DOMPurify)) article HTML for title, keywords, description, etc.
- Uses [React](https://reactjs.org) and a [Next.js custom server](https://nextjs.org/docs/advanced-features/custom-server) to handle frontend routing and rendering
- Uses [Koa](https://github.com/koajs/koa) for backend API and [MongoDB](https://github.com/mongodb/node-mongodb-native) to save articles
- Secure response headers, including CSP
- (Optional) Uses [Cloudinary](https://cloudinary.com) to host leading article images

# Todo

- ~~Implement stream of recent news from [News APIs](https://newsapi.org)~~
- ~~Cache News API response data to consume fewer API requests~~
- Add a "reader mode" for each article (in progress)
- Add tag functionality to saved articles
- Save lead image to filesystem (in case of Cloudinary failure)
- Save articles for offline viewing
- Find way to remove `'unsafe-eval'` and `'unsafe-inline'` from current CSP (currently required for Next to work properly 😐)
- Add more database choices (MySQL, SQLite, etc.)
