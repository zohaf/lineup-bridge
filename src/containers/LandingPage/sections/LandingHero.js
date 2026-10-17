import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import HeroSearch from './HeroSearch';
import LandingSection from './LandingSection';

import css from './LandingHero.module.css';

/**
 * Section 1: centered hero on black with the title, subtitle, and keyword search.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId
 * @param {string} props.messageKeyPrefix e.g. 'LandingPage.hero'
 * @returns {JSX.Element}
 */
const LandingHero = props => {
  const { sectionId, messageKeyPrefix } = props;

  return (
    <LandingSection id={sectionId} variant="dark" className={css.section}>
      <div className={css.hero}>
        <h1 className={css.title}>
          <FormattedMessage
            id={`${messageKeyPrefix}.title`}
            values={{ lineBreak: <br className={css.titleBreak} /> }}
          />
        </h1>
        <p className={css.subtitle}>
          <FormattedMessage id={`${messageKeyPrefix}.subtitle`} />
        </p>
        <HeroSearch className={css.search} />
      </div>
    </LandingSection>
  );
};

export default LandingHero;
