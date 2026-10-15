import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

// Import order: components before the page builder helpers
import { ExternalLink, LinkedLogo, NamedLink, SocialIcon } from '../../components';
import { exposeSocialMediaProps } from '../PageBuilder/Field/Field.helpers';

import buttonCss from '../../styles/lineupButtons.module.css';
import css from './Footer.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 1024;

const PLATFORM_NAMES = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
  twitter: 'X',
  youtube: 'YouTube',
};

/**
 * Footer built in code. Only the social links come from Console.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>?} props.socialMediaLinks items like { link: { platform, url } } from the footer asset
 * @param {string?} props.linkLogoToExternalSite external URL for the logo link
 * @returns {JSX.Element} footer
 */
const Footer = props => {
  const { socialMediaLinks = [], linkLogoToExternalSite } = props;

  const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
  const isMobileLayout = hasMatchMedia
    ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
    : true;
  const logoLayout = isMobileLayout ? 'mobile' : 'desktop';

  const socialLinks = socialMediaLinks
    .map(item => exposeSocialMediaProps(item?.link || {}))
    .filter(({ href, platform }) => !!href && !!platform);

  return (
    <footer className={css.root}>
      <div className={css.top}>
        <div className={css.brand}>
          <LinkedLogo
            rootClassName={css.logoLink}
            logoClassName={css.logoWrapper}
            logoImageClassName={css.logoImage}
            linkToExternalSite={linkLogoToExternalSite}
            layout={logoLayout}
          />
          <p className={css.slogan}>
            <FormattedMessage id="Footer.slogan" />
          </p>
        </div>
        {socialLinks.length > 0 ? (
          <ul className={css.social}>
            {socialLinks.map(({ href, platform }) => {
              const name = PLATFORM_NAMES[platform] || platform;
              return (
                <li key={`${platform}-${href}`} className={css.socialItem}>
                  <ExternalLink
                    className={css.socialLink}
                    href={href}
                    aria-label={name}
                    title={name}
                  >
                    <SocialIcon platform={platform} ariaLabel={name} />
                  </ExternalLink>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div className={css.meta}>
        <div className={css.legal}>
          <p className={css.copyright}>
            <FormattedMessage id="Footer.copyright" values={{ year: new Date().getFullYear() }} />
          </p>
          <NamedLink className={buttonCss.linkMuted} name="PrivacyPolicyPage">
            <FormattedMessage id="Footer.privacyPolicy" />
          </NamedLink>
          <NamedLink
            className={buttonCss.linkMuted}
            name="CMSPage"
            params={{ pageId: 'terms-of-use' }}
          >
            <FormattedMessage id="Footer.termsOfUse" />
          </NamedLink>
          <NamedLink
            className={buttonCss.linkMuted}
            name="CMSPage"
            params={{ pageId: 'payment-terms' }}
          >
            <FormattedMessage id="Footer.paymentTerms" />
          </NamedLink>
        </div>
        <ul className={css.nav}>
          <li className={css.navItem}>
            <NamedLink className={buttonCss.linkMuted} name="CMSPage" params={{ pageId: 'faq' }}>
              <FormattedMessage id="Footer.faq" />
            </NamedLink>
          </li>
          <li className={css.navItem}>
            <NamedLink
              className={buttonCss.linkMuted}
              name="CMSPage"
              params={{ pageId: 'contact-us' }}
            >
              <FormattedMessage id="Footer.contactUs" />
            </NamedLink>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
