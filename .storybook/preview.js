import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';

// Global styles, imported first as in src/index.js.
import '../src/styles/marketplaceDefaults.css';

import { IntlProvider } from '../src/util/reactIntl';
import { mergeConfig } from '../src/util/configHelpers';
import configureStore from '../src/store';
import defaultConfig from '../src/config/configDefault';
import { ConfigurationProvider } from '../src/context/configurationContext';
import { RouteConfigurationProvider } from '../src/context/routeConfigurationContext';
import routeConfiguration from '../src/routing/routeConfiguration';
import messages from '../src/translations/en.json';

// Local config and en.json only. Hosted Console config and translations are not fetched, so the
// console logs "Mandatory hosted asset ... is missing" and copy can differ from the live app.
const appConfig = mergeConfig({}, defaultConfig);
const routeConfig = routeConfiguration(appConfig.layout, appConfig.accessControl);
const store = configureStore({});

const withAppProviders = Story => (
  <ConfigurationProvider value={appConfig}>
    <RouteConfigurationProvider value={routeConfig}>
      <IntlProvider locale="en" messages={messages} textComponent="span">
        <Provider store={store}>
          <HelmetProvider>
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </HelmetProvider>
        </Provider>
      </IntlProvider>
    </RouteConfigurationProvider>
  </ConfigurationProvider>
);

const preview = {
  decorators: [withAppProviders],
  parameters: {
    layout: 'padded',
    viewport: {
      options: {
        mobile: { name: 'Mobile 375', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' } },
        laptop: { name: 'Laptop 1024', styles: { width: '1024px', height: '768px' } },
        desktop: { name: 'Desktop 1280', styles: { width: '1280px', height: '800px' } },
      },
    },
  },
};

export default preview;
