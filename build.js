var metalsmith  = require("metalsmith")
    , jade      = require("metalsmith-jade")

metalsmith(__dirname)
  .use(jade({
    pretty: true
  }))

  .source("src")
  .destination("public")

  .build(function(err) {
        if (err) throw err;
    });
