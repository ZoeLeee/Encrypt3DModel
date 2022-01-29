const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");

const app = express();
const config = require("./webpack.config.js");
const compiler = webpack(config);
const PORT = 3000

app.use(
    webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
    })
);

// app.use(express.static("./static"));

app.listen(PORT, function () {
    console.log(`app listening on port ${PORT}!\n`);
    console.log(`open:http://127.0.0.1:${PORT}`);
});
