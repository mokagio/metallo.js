var metalsmith  = require("metalsmith")

metalsmith(__dirname)
  .source("src")
  .destination("public")
  .build(function(err) {
        if (err) throw err;
    });
