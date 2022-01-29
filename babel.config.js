module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                useBuiltIns: "usage",
                loose: true,
                corejs: { version: 3, proposals: true },
            },
        ],
        "@babel/preset-typescript",
    ]
}