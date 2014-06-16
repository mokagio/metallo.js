var metalsmith  = require("metalsmith")
    , markdown  = require("metalsmith-markdown")
    , templates = require("metalsmith-templates")
    , collections  = require("metalsmith-collections")
    , permalinks = require("metalsmith-permalinks")
    , branch = require("metalsmith-branch")

metalsmith(__dirname)
  .source("src")
  .destination("public")

  .use(collections({
    posts: {
      pattern: "src/posts/*.md",
      sortBy: "date",
      reverse: true
    }
  }))

  .use(markdown())

  .use(templates({
    engine: "jade",
    directory: "src/templates"
  }))

  .use(branch("posts/*.html")
    .use(permalinks({
        pattern: 'blog/:slug'
    }))
  )

  .build(function(err) {
    if (err) throw err;
  });