import React from 'react';

import { useIntl } from '../../../util/reactIntl';

import FaqList from './FaqList';
import LandingSection from './LandingSection';
import SectionHeader from './SectionHeader';

// Same header-left, list-right split as the How it works section
import css from './LandingSteps.module.css';

/**
 * Section 5: frequently asked questions as an accordion.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {'center'|'left'} props.align
 * @param {string} props.messageKeyPrefix e.g. 'LandingPage.faq'
 * @param {Array<string>} props.items question keys
 * @returns {JSX.Element}
 */
const LandingFaq = props => {
  const { sectionId, align, messageKeyPrefix, items = [] } = props;
  const intl = useIntl();
  const message = key => intl.formatMessage({ id: `${messageKeyPrefix}.${key}` });

  return (
    <LandingSection id={sectionId}>
      <div className={css.layout}>
        <SectionHeader
          eyebrow={message('eyebrow')}
          heading={message('heading')}
          lede={message('lede')}
          align={align}
        />
        <FaqList
          items={items.map(key => ({
            key,
            question: message(`items.${key}.question`),
            answer: message(`items.${key}.answer`),
          }))}
        />
      </div>
    </LandingSection>
  );
};

export default LandingFaq;
