const config = {
  retainLines: true,
  presets: [
    [
      // https://babeljs.io/docs/en/babel-preset-env#options
      '@babel/preset-env',
      {
        debug: true,
        targets: {
          node: '20',
        },
        // useBuiltIns: "usage",
      },
    ],
  ],
}

module.exports = config
