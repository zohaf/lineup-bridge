import React from 'react';

import { useIntl } from '../../../util/reactIntl';

import AudienceCard from './AudienceCard';
import LandingSection from './LandingSection';
import SectionHeader from './SectionHeader';

import css from './LandingAudiences.module.css';

/**
 * Section 4: one signup card for DJs and one for event organizers.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {'center'|'left'} props.align
 * @param {string} props.messageKeyPrefix e.g. 'LandingPage.audiences'
 * @param {Array<Object>} props.cards card config, see landingSections.js
 * @returns {JSX.Element}
 */
const LandingAudiences = props => {
  const { sectionId, align, messageKeyPrefix, cards = [] } = props;
  const intl = useIntl();
  const message = key => intl.formatMessage({ id: `${messageKeyPrefix}.${key}` });

  return (
    <LandingSection id={sectionId}>
      <SectionHeader
        eyebrow={message('eyebrow')}
        heading={message('heading')}
        lede={message('lede')}
        align={align}
      />
      <div className={css.cards}>
        {cards.map(card => {
          const cardMessage = key => message(`cards.${card.key}.${key}`);
          return (
            <AudienceCard
              key={card.key}
              eyebrow={cardMessage('eyebrow')}
              title={cardMessage('title')}
              text={cardMessage('text')}
              items={card.itemKeys.map(cardMessage)}
              ctaLabel={cardMessage('cta')}
              userType={card.userType}
              buttonVariant={card.buttonVariant}
            />
          );
        })}
      </div>
    </LandingSection>
  );
};

export default LandingAudiences;
