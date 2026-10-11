import React from 'react';

import { useIntl } from '../../../util/reactIntl';

import LandingSection from './LandingSection';
import SectionHeader from './SectionHeader';

/**
 * Section with only its header. Placeholder for the landing sections whose content
 * is not built yet; each step replaces it with the real section component.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {'page'|'dark'} props.variant
 * @param {'center'|'left'} props.align
 * @param {string} props.messageKeyPrefix e.g. 'LandingPage.value' (.eyebrow, .heading, .lede)
 * @returns {JSX.Element}
 */
const LandingSectionShell = props => {
  const { sectionId, variant, align, messageKeyPrefix } = props;
  const intl = useIntl();
  const message = key => intl.formatMessage({ id: `${messageKeyPrefix}.${key}` });

  return (
    <LandingSection id={sectionId} variant={variant}>
      <SectionHeader
        eyebrow={message('eyebrow')}
        heading={message('heading')}
        lede={message('lede')}
        align={align}
        inverse={variant === 'dark'}
      />
    </LandingSection>
  );
};

export default LandingSectionShell;
