# newsworthy

newsworthy is a news article saver with a no-nonsense UI.

# Features

- Add news article content and metadata with just the URL
- Uses [Postlight's Mercury Parser](https://github.com/postlight/mercury-parser) and [JSDOM](https://github.com/jsdom/jsdom) to parse ([sanitized](https://github.com/cure53/DOMPurify)) article HTML for title, keywords, description, etc.
- Uses a [Next.js custom server](https://nextjs.org/docs/advanced-features/custom-server) to handle frontend routing and rendering
- Uses [Koa](https://github.com/koajs/koa) for backend API and [MongoDB](https://github.com/mongodb/node-mongodb-native) to save articles
- Secure response headers, including CSP
- (Optional) Uses [Cloudinary](https://cloudinary.com/) to host leading article images

# Todo

- Save lead image to filesystem (in case of Cloudinary failure)
- Implement stream of recent news from [News API's](https://newsapi.org) (API prepped in `src/api/index.ts`)
- Find way to remove `'unsafe-eval'` and `'unsafe-inline'` from current CSP (currently required for Next to work properly 😐)
- Add tag functionality to saved articles
- Save articles for offline viewing
- Add more database choices (MySQL, SQLite, etc.)
