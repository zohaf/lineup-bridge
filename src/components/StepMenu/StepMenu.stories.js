import React from 'react';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { accountSettingsMenuItems } from '../../containers/AccountSettingsPage/accountSettingsMenu';

import StepMenu from './StepMenu';

// "steps": the public profile builder for a new DJ profile (Profile, Links, Photos), as built in
// EditListingWizard. "pages": the account settings menu, built with the app's own helper.
const step = (tab, labelId, state) => ({
  key: tab,
  label: <FormattedMessage id={labelId} />,
  linkProps: {
    name: 'EditListingPage',
    params: { slug: 'draft', id: '00000000-0000-0000-0000-000000000000', type: 'new', tab },
  },
  ...state,
});

const WithIntlLabel = ({ ariaLabelId, ...rest }) => {
  const intl = useIntl();
  return <StepMenu ariaLabel={intl.formatMessage({ id: ariaLabelId })} {...rest} />;
};

export default {
  title: 'Components/StepMenu',
  component: StepMenu,
};

export const Steps = {
  render: () => (
    <WithIntlLabel
      variant="steps"
      ariaLabelId="EditListingWizard.screenreader.tabNavigation"
      items={[
        step('details', 'EditListingWizard.tabLabelDetailsDj', { done: true }),
        step('links', 'EditListingWizard.tabLabelLinks', { current: true }),
        step('photos', 'EditListingWizard.tabLabelPhotos', { disabled: true }),
      ]}
    />
  ),
};

// UserNav.accountSettings is not in en.json (Console only), so its key shows here.
export const Pages = {
  render: () => (
    <WithIntlLabel
      variant="pages"
      ariaLabelId="UserNav.accountSettings"
      items={accountSettingsMenuItems('StripePayoutPage', true, true)}
    />
  ),
};
