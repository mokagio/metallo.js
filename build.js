var metalsmith  = require("metalsmith")
    , jade      = require("metalsmith-jade")
    , markdown  = require("metalsmith-markdown")
    , templates = require("metalsmith-templates")

metalsmith(__dirname)
  .use(jade({
    pretty: true
  }))
  .use(markdown())
  .use(templates({
    engine: "jade",
    directory: "src/templates"
  }))

  .source("src")
  .destination("public")

  .build(function(err) {
        if (err) throw err;
    });
