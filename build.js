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

  // important: collections must be set before templates
  // or the templates won't have the variables and crash
  .use(collections({
    posts: {
      pattern: "posts/*",
      sortBy: "date",
      reverse: true
    }
  }))

  .use(markdown({
    highlight: function (code) {
      return require('highlight.js').highlightAuto(code).value;
    },
    langPrefix: 'hljs '
  }))

  .use(branch("posts/*.html")
    .use(permalinks({
        pattern: 'blog/:slug'
    }))
  )

  .use(paginator)

  // temp fix for metalsmith-template corrupting images
  // see https://github.com/segmentio/metalsmith/issues/60 and https://github.com/segmentio/metalsmith-templates/issues/17
  .use(branch(filterImages)
    .use(templates({
      engine: "jade",
      directory: "src/templates"
    }))
  )

  .build(function(err) {
    if (err) throw err;
  }
);

function filterImages(filename, properties, index) {
  var extension = filename.split('.').pop().toLowerCase();
  var imageExtensions = [ "jpg", "jpeg", "png" ];
  var notAnImage = imageExtensions.indexOf(extension) == -1;
  return notAnImage;
}


function paginator(files, metalsmith, done) {
  /*
   * mokagio's version
   *
  var posts = metalsmith.data.posts;

  var pages = [];
  var postsPerPage = 2;

  var numberOfPages = Math.ceil(posts.length / postsPerPage);
  for (var i = 0; i < numberOfPages; i++) {
    pages.push( posts.slice((postsPerPage * i), ((postsPerPage * i) + postsPerPage)) );
  }

  console.log(pages);
  console.log("Built an array of " + pages.length + " pages, with " + postsPerPage + " items per page. Last page has " + pages[numberOfPages - 1].length + " items");

  var index = files['index.md'];
  index.posts = pages[0];
  */

  // lsjroberts version
  var index = files['index.html']
      posts = metalsmith.data.posts,
      perPage = 1;

  index.posts = posts.slice(0,perPage);
  index.currentPage = 1;
  index.numPages = Math.ceil(posts.length / perPage);
  index.pagination = [];

  for (var i = 1; i <= index.numPages; i++) {
      index.pagination.push({
          num: i,
          url: (1 == i) ? '/' : '/index/' + i
      });

      if (i > 1) {
          files['index/' + i + '/index.html'] = {
              template: 'posts_list.jade',
              mode: '0644',
              contents: '',
              title: 'Page ' + i + ' of ' + index.numPages,
              posts: posts.slice((i-1) * perPage, ((i-1) * perPage) + perPage),
              currentPage: i,
              numPages: index.numPages,
              pagination: index.pagination,
          }
      }
  }

  done();
}