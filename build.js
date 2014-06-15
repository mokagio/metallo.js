var metalsmith  = require("metalsmith")
    , markdown  = require("metalsmith-markdown")
    , templates = require("metalsmith-templates")
    , collections  = require("metalsmith-collections")
    , permalinks = require("metalsmith-permalinks")

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

  .use(permalinks({
    pattern: ':title'
  }))

  .use(templates({
    engine: "jade",
    directory: "src/templates"
  }))

  .build(function(err) {
    if (err) throw err;
  });
