// A lot of this is taken form https://github.com/lsjroberts/gelatin-design/blob/master/build.js

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
    .use(function (files, metalsmith, done) {
      for (var file in files) {
        files[file].template = 'post.jade';
      }
      done();
    })
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
  var index = files['index.html'],
      original_posts = metalsmith.data.posts,
      perPage = 1;

  // hack for rendering of multiple templates.
  //
  // if we push the original post object in the pagination array, when it comes to render the pagination view jade is gonna render
  // first the pagination, which extends the base template, then when it comes to the post it's gonna render the post as it's own
  // page extending the base template as well, this means that we're gonna end up with a weird page inside the page.
  //
  // i'm sure that to avoid it there must be some option to pass to the jade compiler, but i haven't find it yet.
  //
  // what we do here is manually copy (by value) the posts array in order to be able to reset the template of the object that will
  // go in the pagination array, without changing the original one.
  posts = [];
  for (var i = 0; i < original_posts.length; i++) {
    original_post = original_posts[i];
    post = {};
    for (var key in original_post) {
      if (key != 'template') {
        post[key] = original_post[key];
      }
    }
    posts.push(post);
  }

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
              template: 'index.jade',
              mode: '0644',
              contents: '',
              title: 'Page ' + i + ' of ' + index.numPages,
              posts: posts.slice((i-1) * perPage, ((i-1) * perPage) + perPage),
              currentPage: i,
              numPages: index.numPages,
              pagination: index.pagination,
          };
      }
  }

  done();
}