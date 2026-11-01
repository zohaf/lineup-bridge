import React from 'react';
import classNames from 'classnames';
import { Menu as MenuIcon } from 'lucide-react';

import { FormattedMessage, useIntl } from '../src/util/reactIntl';
import { useConfiguration } from '../src/context/configurationContext';
import { NamedLink, HeaderMenu, HeaderMenuItem, SiteHeader } from '../src/components';

import buttonCss from '../src/styles/lineupButtons.module.css';
import topbarCss from '../src/containers/TopbarContainer/Topbar/Topbar.module.css';

// The guest header as built in Topbar: sign up and log in in the bar from 768px, a menu on phones.
const GuestHeader = ({ inverse = false }) => {
  const intl = useIntl();
  const config = useConfiguration();
  const linkClasses = classNames(buttonCss.linkHeader, topbarCss.barLink);
  return (
    <SiteHeader
      ariaLabel={intl.formatMessage({ id: 'TopbarDesktop.screenreader.topbarNavigation' })}
      logoAlt={intl.formatMessage(
        { id: 'TopbarDesktop.logo' },
        { marketplaceName: config.marketplaceName }
      )}
      inverse={inverse}
    >
      <NamedLink name="SignupPage" className={linkClasses}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </NamedLink>
      <NamedLink name="LoginPage" className={linkClasses}>
        <FormattedMessage id="TopbarDesktop.login" />
      </NamedLink>
      <HeaderMenu
        id="header-menu"
        phoneOnly
        ariaLabel={intl.formatMessage({ id: 'Topbar.menuIcon' })}
        trigger={<MenuIcon size={20} aria-hidden="true" />}
      >
        <HeaderMenuItem name="SignupPage">
          <FormattedMessage id="TopbarMobileMenu.signupLink" />
        </HeaderMenuItem>
        <HeaderMenuItem name="LoginPage">
          <FormattedMessage id="TopbarMobileMenu.loginLink" />
        </HeaderMenuItem>
      </HeaderMenu>
    </SiteHeader>
  );
};

export default GuestHeader;
