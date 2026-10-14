import React from 'react';
import { useIntl } from 'react-intl';

import { useConfiguration } from '../../context/configurationContext';

import { SiteHeader } from '../../components';

/**
 * A component that renders a simplified top bar. This is used on situations,
 * where we don't want the user to be distacted by the multiple links in the Topbar component.
 * This is used in CheckoutPage, MakeOfferPage, and RequestQuotePage.
 *
 * Note: the real Topbar component can be found from src/containers/TopbarContainer/
 *
 * @component
 * @param {Object} props
 * @param {string} props.className - The class name for the topbar
 * @param {string} props.rootClassName - The root class name for the topbar
 * @returns {JSX.Element}
 */
const TopbarSimplified = props => {
  const intl = useIntl();
  const config = useConfiguration();
  const { className, rootClassName } = props;
  const label = intl.formatMessage({ id: 'TopbarSimplified.goToLandingPage' });

  return (
    <SiteHeader
      className={className}
      rootClassName={rootClassName}
      ariaLabel={label}
      logoAlt={label}
      linkToExternalSite={config?.topbar?.logoLink}
    />
  );
};

export default TopbarSimplified;
