module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '20.0.0'
      },
      useBuiltIns: 'usage',
      corejs: 3,
      modules: 'auto'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
      useESModules: false,
      absoluteRuntime: false,
      version: '^7.22.15'
    }]
  ]
};
