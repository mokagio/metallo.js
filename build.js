var metalsmith  = require("metalsmith")
    , jade      = require("metalsmith-jade")

metalsmith(__dirname)
  .use(jade())

  .source("src")
  .destination("public")

  .build(function(err) {
        if (err) throw err;
    });
