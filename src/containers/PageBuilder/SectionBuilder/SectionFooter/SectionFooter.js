import React from 'react';
import { LinkedLogo, NamedLink } from '../../../../components';

import { FormattedMessage } from '../../../../util/reactIntl';
import Field from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';
import css from './SectionFooter.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 1024;

/**
 * @typedef {Object} SocialMediaLinkConfig
 * @property {'socialMediaLink'} fieldType
 * @property {string} platform
 * @property {string} url
 */

/**
 * @typedef {Object} BlockConfig
 * @property {string} blockId
 * @property {string} blockName
 * @property {'defaultBlock' | 'footerBlock' | 'socialMediaLink'} blockType
 */

/**
 * @typedef {Object} FieldComponentConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

/**
 * Section component that's able to show blocks in multiple different columns (defined by "numberOfColumns" prop)
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string} props.sectionId id of the section
 * @param {'footer'} props.sectionType
 * @param {number} props.numberOfColumns columns for blocks in footer (1-4)
 * @param {Array<SocialMediaLinkConfig>?} props.socialMediaLinks array of social media link configs
 * @param {Object?} props.slogan
 * @param {Object?} props.copyright
 * @param {Object?} props.appearance
 * @param {Array<BlockConfig>?} props.blocks array of block configs
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} Section for article content
 */
const SectionFooter = props => {
  const {
    sectionId,
    className,
    rootClassName,
    slogan,
    appearance,
    copyright,
    blocks = [],
    options,
    linkLogoToExternalSite,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };
  const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
  const isMobileLayout = hasMatchMedia
    ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
    : true;
  const logoLayout = isMobileLayout ? 'mobile' : 'desktop';

  // use block builder instead of mapping blocks manually

  return (
    <SectionContainer
      as="footer"
      id={sectionId}
      className={className || css.root}
      rootClassName={rootClassName}
      sectionContentClassName={css.sectionContentNoPadding}
      appearance={appearance}
      options={fieldOptions}
    >
      <div className={css.footer}>
        <div className={css.logoRow}>
          <LinkedLogo
            rootClassName={css.logoLink}
            logoClassName={css.logoWrapper}
            logoImageClassName={css.logoImage}
            linkToExternalSite={linkLogoToExternalSite}
            layout={logoLayout}
          />
          <Field data={slogan} className={css.slogan} />
        </div>
        <div className={css.footerMetaRow}>
          <div className={css.legalColumn}>
            <BlockBuilder
              blocks={blocks}
              sectionId={sectionId}
              options={options}
              rootClassName={css.footerBlock}
              textClassName={css.footerBlockText}
            />
          </div>
          <div className={css.contactColumn}>
            <NamedLink
              name="ContactPage"
              className={css.footerContactLink}
            >
              <FormattedMessage id="SectionFooter.contactUs" />
            </NamedLink>
          </div>
          <Field data={copyright} className={css.copyright} />
        </div>
      </div>
    </SectionContainer>
  );
};

export default SectionFooter;
