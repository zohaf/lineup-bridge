import React from 'react';

import { useIntl } from '../../../util/reactIntl';

import LandingSection from './LandingSection';
import SectionHeader from './SectionHeader';
import StepList from './StepList';

import css from './LandingSteps.module.css';

/**
 * Section 3: the booking process as a numbered list, from discovering a DJ to payment.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {'center'|'left'} props.align
 * @param {string} props.messageKeyPrefix e.g. 'LandingPage.steps'
 * @param {Array<{key: string, role: 'organizer'|'dj'|'both'}>} props.items
 * @returns {JSX.Element}
 */
const LandingSteps = props => {
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
        <StepList
          items={items.map(item => ({
            key: item.key,
            title: message(`items.${item.key}.title`),
            text: message(`items.${item.key}.text`),
            role: message(`roles.${item.role}`),
          }))}
        />
      </div>
    </LandingSection>
  );
};

export default LandingSteps;
