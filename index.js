const express = require("express");
const path = require("path");
const { PORT } = process.env;

express()
  .use(express.static(path.join(__dirname, "public")))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
