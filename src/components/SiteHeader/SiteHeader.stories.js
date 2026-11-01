import React from 'react';

import GuestHeader from '../../../.storybook/GuestHeader';

import SiteHeader from './SiteHeader';

export default {
  title: 'Components/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
};

export const Guest = { render: () => <GuestHeader /> };

export const GuestInverse = { render: () => <GuestHeader inverse /> };
