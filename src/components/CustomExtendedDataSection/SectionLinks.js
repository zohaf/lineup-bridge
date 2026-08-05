import React from 'react';
import classNames from 'classnames';

import { Heading, ExternalLink } from '../../components';
import IconSocialMediaFacebook from '../IconSocialMediaFacebook/IconSocialMediaFacebook';
import IconSocialMediaInstagram from '../IconSocialMediaInstagram/IconSocialMediaInstagram';
import {
  IconSocialMediaResidentAdvisor,
  IconSocialMediaSoundCloud,
  IconSocialMediaSpotify,
  IconSocialMediaWebsite,
} from './SocialLinkIcons';
import css from './CustomExtendedDataSection.module.css';

const isUrl = text =>
  typeof text === 'string' &&
  (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.'));

const linkConfFromHeading = heading => {
  const normalizedHeading = typeof heading === 'string' ? heading.trim().toLowerCase() : '';
  if (normalizedHeading.includes('facebook')) return { label: 'Facebook', Icon: IconSocialMediaFacebook };
  if (normalizedHeading.includes('insta')) return { label: 'Instagram', Icon: IconSocialMediaInstagram };
  if (normalizedHeading.includes('bandcamp')) return { label: 'Bandcamp', Icon: null };
  if (normalizedHeading.includes('spotify')) return { label: 'Spotify', Icon: IconSocialMediaSpotify };
  if (normalizedHeading.includes('soundcloud')) {
    return { label: 'SoundCloud', Icon: IconSocialMediaSoundCloud };
  }
  if (normalizedHeading.includes('youtube')) return { label: 'YouTube', Icon: null };
  if (normalizedHeading.includes('tiktok')) return { label: 'TikTok', Icon: null };
  if (normalizedHeading.includes('website') || normalizedHeading.includes('web site')) {
    return { label: 'Website', Icon: IconSocialMediaWebsite };
  }
  if (normalizedHeading.includes('resident advisor') || normalizedHeading === 'ra') {
    return { label: 'RA', Icon: IconSocialMediaResidentAdvisor };
  }
  const fallbackLabel = typeof heading === 'string' && heading.trim() ? heading.trim() : 'Link';
  return { label: fallbackLabel, Icon: null };
};

/**
 * Renders a compact "Links" section (icon + label), derived from text fields containing URLs.
 */
const SectionLinks = props => {
  const { links = [], className, rootClassName, heading = 'Links' } = props;
  const classes = classNames(rootClassName || css.sectionLinks, className);

  const validLinks = links
    .map(l => ({
      href: typeof l?.text === 'string' ? l.text.trim() : '',
      conf: linkConfFromHeading(l?.heading),
    }))
    .filter(l => isUrl(l.href));

  if (!validLinks.length) return null;

  return (
    <section className={classes}>
      <Heading as="h2" rootClassName={css.sectionHeading}>
        {heading}:
      </Heading>
      <div className={css.linksList}>
        {validLinks.map(({ href, conf }) => (
          <ExternalLink key={`${conf.label}-${href}`} className={css.socialLink} href={href}>
            {conf.Icon ? <conf.Icon className={css.socialIcon} /> : null}
            <span>{conf.label}</span>
          </ExternalLink>
        ))}
      </div>
    </section>
  );
};

export default SectionLinks;

