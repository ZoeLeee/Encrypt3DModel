const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");

const app = express();
const config = require("./webpack.config.js");
const compiler = webpack(config);
const PORT = 3000

const crypto = require("crypto");
const fs = require("fs");
const path = require("path")


const key = Buffer.from(
    "6b65796b65796b65796b65796b65796b65796b65796b6579",
    "hex"
).toString("utf8");

app.get("/*.glb$/", function (req, res) {
    console.log("123");
    //先固定路径为例
    const filepath = path.join(__dirname, "./public/models/Xbot.glb");
    console.log("filepath: ", filepath);
    if (!fs.existsSync(filepath)) {
        res.status(404).send("");
    } else {
        const cipher = crypto.createCipheriv(
            "aes-192-ctr",
            key,
            Buffer.alloc(16, 0)
        );
        const buf = Buffer.from(filepath);

        fs.createReadStream(buf).pipe(cipher).pipe(res);
    }
});

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
