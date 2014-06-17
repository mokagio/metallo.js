var metalsmith  = require("metalsmith")
    , markdown  = require("metalsmith-markdown")
    , templates = require("metalsmith-templates")
    , collections  = require("metalsmith-collections")
    , permalinks = require("metalsmith-permalinks")
    , branch = require("metalsmith-branch")
    , ignore = require("metalsmith-ignore")
;

metalsmith(__dirname)
  .source("src")
  .destination("public")

  .use(ignore("templates/*"))

  .use(markdown())

  // important: collections must be set before templates
  // or the templates won't have the variables and crash
  .use(collections({
    posts: {
      pattern: "posts/*",
      sortBy: "date",
      reverse: true
    }
  }))
  .use(paginator)
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
  }
);


function paginator(files, metalsmith, done) {
  var posts = metalsmith.data.posts;

  console.log(files);
  console.log(posts);
  console.log(metalsmith);
  console.log(metalsmith.metadata.posts);

  done();
}