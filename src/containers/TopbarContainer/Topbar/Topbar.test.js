import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../../util/testHelpers';

import Topbar from './Topbar';

const { act } = testingLibrary;

const noop = () => null;
const props = {
  isAuthenticated: false,
  authScopes: [],
  currentUserHasListings: false,
  currentUserHasOrders: false,
  notificationCount: 0,
  history: { push: noop },
  location: { search: '', pathname: '/' },
  onLogout: () => Promise.resolve(),
  onManageDisableScrolling: noop,
  onResendVerificationEmail: noop,
  onQueryOwnListings: noop,
  sendVerificationEmailInProgress: false,
  showGenericError: false,
};

const scrollTo = y => {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    jest.runOnlyPendingTimers();
  });
};

describe('Topbar on the landing page', () => {
  const realRaf = window.requestAnimationFrame;
  beforeEach(() => {
    // Like the browser: the frame callback runs after the scroll handler returns
    jest.useFakeTimers();
    window.requestAnimationFrame = cb => setTimeout(cb, 0);
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
  });
  afterEach(() => {
    window.requestAnimationFrame = realRaf;
    jest.useRealTimers();
  });

  it('is transparent at the top and solid once the page scrolls', () => {
    const { container } = render(<Topbar {...props} currentPage="LandingPage" />);
    const bar = () => container.querySelector('nav');

    expect(bar().className).toContain('headerOverDots');

    scrollTo(100);
    expect(bar().className).not.toContain('headerOverDots');

    scrollTo(0);
    expect(bar().className).toContain('headerOverDots');
  });

  it('is never transparent on other pages', () => {
    const { container } = render(<Topbar {...props} currentPage="SearchPage" />);
    expect(container.querySelector('nav').className).not.toContain('headerOverDots');
  });
});
