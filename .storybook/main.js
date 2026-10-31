// Storybook reuses the app's own webpack setup from sharetribe-scripts (a create-react-app fork)
// through preset-create-react-app, so CSS modules, the PostCSS plugins (custom media, nesting),
// SVG imports and REACT_APP_* env variables work the same as in `yarn dev`.
const config = {
  stories: ['../src/**/*.stories.js'],
  addons: [
    {
      name: '@storybook/preset-create-react-app',
      options: { scriptsPackageName: 'sharetribe-scripts' },
    },
    '@storybook/addon-docs',
  ],
  framework: { name: '@storybook/react-webpack5', options: {} },
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
};

export default config;
