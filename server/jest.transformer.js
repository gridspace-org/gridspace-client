import babelJest from 'babel-jest';

// Create a custom transformer that uses babel-jest but with the right config
const transformer = babelJest.createTransformer({
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      useBuiltIns: 'usage',
      corejs: 3,
    }],
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
    }],
  ],
});

// Handle ESM imports
transformer.canInstrument = false;

transformer.process = function (src, filename, config, transformOptions) {
  // Handle .js files with ES modules
  if (filename.endsWith('.js') || filename.endsWith('.mjs')) {
    return babelJest.createTransformer({
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          useBuiltIns: 'usage',
          corejs: 3,
          modules: 'auto',
        }],
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', {
          corejs: 3,
          useESModules: true,
        }],
      ],
    }).process(src, filename, config, transformOptions);
  }
  
  // Default processing for other files
  return babelJest.createTransformer({
    presets: [
      ['@babel/preset-env', {
        targets: { node: 'current' },
      }],
    ],
  }).process(src, filename, config, transformOptions);
};

export default transformer;
