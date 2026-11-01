import React from 'react';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { accountSettingsMenuItems } from '../../containers/AccountSettingsPage/accountSettingsMenu';
import { PageHeader, SectionCard, StepMenu } from '../../components';
import Footer from '../../containers/FooterContainer/Footer';
import GuestHeader from '../../../.storybook/GuestHeader';

import LayoutSplit from './LayoutSplit';

// Placeholder content: the layout renders no text. Header and menu text as used in
// CheckoutPage (summary) and StripePayoutPage (nav).
const Block = ({ height = 160 }) => <div style={{ height, background: 'var(--colorGrey50)' }} />;

const NavMenu = () => {
  const intl = useIntl();
  return (
    <StepMenu
      variant="pages"
      ariaLabel={intl.formatMessage({ id: 'UserNav.accountSettings' })}
      items={accountSettingsMenuItems('StripePayoutPage', true, true)}
    />
  );
};

export default {
  title: 'Layouts/LayoutSplit',
  component: LayoutSplit,
  parameters: { layout: 'fullscreen' },
};

export const Summary = {
  render: () => (
    <LayoutSplit
      topbar={<GuestHeader />}
      footer={<Footer />}
      header={<PageHeader title={<FormattedMessage id="RequestQuotePage.heading" />} />}
      side={
        <SectionCard
          title={<FormattedMessage id="CheckoutPage.default-negotiation.orderBreakdown" />}
        >
          <Block height={120} />
        </SectionCard>
      }
    >
      <SectionCard
        number={1}
        title={<FormattedMessage id="RequestQuoteForm.sectionEventDetails" />}
      >
        <Block />
      </SectionCard>
      <SectionCard number={2} title={<FormattedMessage id="RequestQuoteForm.sectionSetDetails" />}>
        <Block />
      </SectionCard>
    </LayoutSplit>
  ),
};

export const Nav = {
  render: () => (
    <LayoutSplit
      role="nav"
      topbar={<GuestHeader />}
      footer={<Footer />}
      header={<PageHeader title={<FormattedMessage id="StripePayoutPage.heading" />} />}
      side={<NavMenu />}
    >
      <SectionCard>
        <Block height={240} />
      </SectionCard>
    </LayoutSplit>
  ),
};
