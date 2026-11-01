import React from 'react';
import { User } from 'lucide-react';

import { FormattedMessage, useIntl } from '../../util/reactIntl';

import HeaderMenu, { HeaderMenuItem } from './HeaderMenu';

// The logged-in menu items that show at every width, as built in Topbar. The trigger is an icon
// here; in the app it is the user's Avatar. Open it to see the panel (dropdown from 768px, full
// width with a scrim below).
const LoggedInMenu = ({ showDot = false }) => {
  const intl = useIntl();
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 240 }}>
      <HeaderMenu
        id="header-menu"
        showDot={showDot}
        ariaLabel={intl.formatMessage({ id: 'TopbarDesktop.screenreader.profileMenu' })}
        trigger={<User size={20} aria-hidden="true" />}
      >
        <HeaderMenuItem name="AccountSettingsPage" current>
          <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
        </HeaderMenuItem>
        <HeaderMenuItem onClick={() => {}}>
          <FormattedMessage id="TopbarDesktop.logout" />
        </HeaderMenuItem>
      </HeaderMenu>
    </div>
  );
};

export default {
  title: 'Components/HeaderMenu',
  component: HeaderMenu,
};

export const LoggedIn = { render: () => <LoggedInMenu /> };

// The unread dot shows on phones only.
export const UnreadDot = {
  render: () => <LoggedInMenu showDot />,
  globals: { viewport: { value: 'mobile' } },
};
