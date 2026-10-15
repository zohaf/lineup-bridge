import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

/**
 * Account settings menu (StepMenu "pages"): this page, then Payout details (DJ) or Payment methods
 * (event organizer), following the user type's account link visibility.
 */
export const accountSettingsMenuItems = (currentPage, showPayoutDetails, showPaymentMethods) => {
  const item = (name, labelId) => ({
    key: name,
    label: <FormattedMessage id={labelId} />,
    linkProps: { name },
    current: currentPage === name,
  });
  return [
    item('AccountSettingsPage', 'UserNav.accountSettings'),
    ...(showPayoutDetails
      ? [item('StripePayoutPage', 'LayoutWrapperAccountSettingsSideNav.paymentsTabTitle')]
      : []),
    ...(showPaymentMethods
      ? [item('PaymentMethodsPage', 'LayoutWrapperAccountSettingsSideNav.paymentMethodsTabTitle')]
      : []),
  ];
};
