import React from 'react';
import classNames from 'classnames';
import { Heading } from '../../components';
import { richText } from '../../util/richText';
import { ExternalLink } from '../../components';
import IconSocialMediaFacebook from '../IconSocialMediaFacebook/IconSocialMediaFacebook';
import IconSocialMediaInstagram from '../IconSocialMediaInstagram/IconSocialMediaInstagram';
import {
  IconSocialMediaResidentAdvisor,
  IconSocialMediaSoundCloud,
  IconSocialMediaSpotify,
  IconSocialMediaWebsite,
} from './SocialLinkIcons';
import css from './CustomExtendedDataSection.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 20;

const SectionText = props => {
  const {
    text,
    heading,
    headingClassName,
    className,
    rootClassName,
    showAsIngress = false,
  } = props;
  const textClass = showAsIngress ? css.ingress : css.text;

  const normalizedHeading = typeof heading === 'string' ? heading.trim().toLowerCase() : '';
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  const isUrl =
    typeof normalizedText === 'string' &&
    (normalizedText.startsWith('http://') ||
      normalizedText.startsWith('https://') ||
      normalizedText.startsWith('www.'));

  const linkConf = (() => {
    if (!isUrl) return null;
    const h = normalizedHeading;
    if (h.includes('facebook')) return { label: 'Facebook', Icon: IconSocialMediaFacebook };
    if (h.includes('insta')) return { label: 'Instagram', Icon: IconSocialMediaInstagram };
    if (h.includes('bandcamp')) return { label: 'Bandcamp', Icon: null };
    if (h.includes('spotify')) return { label: 'Spotify', Icon: IconSocialMediaSpotify };
    if (h.includes('soundcloud')) return { label: 'SoundCloud', Icon: IconSocialMediaSoundCloud };
    if (h.includes('youtube')) return { label: 'YouTube', Icon: null };
    if (h.includes('tiktok')) return { label: 'TikTok', Icon: null };
    if (h.includes('website') || h.includes('web site')) {
      return { label: 'Website', Icon: IconSocialMediaWebsite };
    }
    if (h.includes('resident advisor') || h === 'ra' || h.includes(' ra')) {
      return { label: 'RA', Icon: IconSocialMediaResidentAdvisor };
    }

    // Fallback: show the configured heading as the label (no title/heading above).
    const fallbackLabel = typeof heading === 'string' && heading.trim() ? heading.trim() : 'Link';
    return { label: fallbackLabel, Icon: null };
  })();

  const content = richText(text, {
    linkify: true,
    longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
    longWordClass: css.longWord,
    breakChars: '/',
  });

  const classes = classNames(rootClassName || css.sectionText, className);

  return text ? (
    <section className={classes}>
      {/* For URL fields, render a compact row: icon + platform name (no separate title). */}
      {linkConf ? (
        <ExternalLink className={css.socialLink} href={normalizedText}>
          {linkConf.Icon ? <linkConf.Icon className={css.socialIcon} /> : null}
          <span>{linkConf.label}</span>
        </ExternalLink>
      ) : (
        <>
          {heading ? (
            <Heading as="h2" rootClassName={css.sectionHeading} className={headingClassName}>
              {heading}
            </Heading>
          ) : null}
          <p className={textClass}>{content}</p>
        </>
      )}
    </section>
  ) : null;
};

export default SectionText;
