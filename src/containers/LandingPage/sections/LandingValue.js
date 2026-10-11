import React from 'react';

import { useIntl } from '../../../util/reactIntl';

import LandingSection from './LandingSection';
import SectionHeader from './SectionHeader';
import StageCard from './StageCard';

import css from './LandingValue.module.css';

/**
 * Section 2: the booking stages (offer, negotiation, confirmed, paid) as four cards.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {'center'|'left'} props.align
 * @param {string} props.messageKeyPrefix e.g. 'LandingPage.value'
 * @param {Array<{key: string, tone: string}>} props.stages
 * @returns {JSX.Element}
 */
const LandingValue = props => {
  const { sectionId, align, messageKeyPrefix, stages = [] } = props;
  const intl = useIntl();
  const message = key => intl.formatMessage({ id: `${messageKeyPrefix}.${key}` });

  return (
    <LandingSection id={sectionId} variant="dark" wide>
      <SectionHeader
        eyebrow={message('eyebrow')}
        heading={message('heading')}
        lede={message('lede')}
        align={align}
        inverse
      />
      <ul className={css.stages}>
        {stages.map((stage, index) => (
          <li key={stage.key}>
            <StageCard
              number={`0${index + 1}`}
              tone={stage.tone}
              chip={message(`stages.${stage.key}.chip`)}
              title={message(`stages.${stage.key}.title`)}
              text={message(`stages.${stage.key}.text`)}
            />
          </li>
        ))}
      </ul>
    </LandingSection>
  );
};

export default LandingValue;
