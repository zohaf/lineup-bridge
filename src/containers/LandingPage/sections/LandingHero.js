import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import { NamedLink } from '../../../components';

import HeroSearch from './HeroSearch';
import LandingSection from './LandingSection';

import css from './LandingHero.module.css';

/**
 * Section 1: centered hero with the title, subtitle, keyword search and the signup links.
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
    <LandingSection id={sectionId} variant="page">
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
        <p className={css.signup}>
          <span>
            <FormattedMessage id={`${messageKeyPrefix}.newHere`} />
          </span>
          <NamedLink className={css.link} name="SignupForUserTypePage" params={{ userType: 'dj' }}>
            <FormattedMessage id="LandingPage.audiences.cards.dj.cta" />
          </NamedLink>
          <NamedLink
            className={css.link}
            name="SignupForUserTypePage"
            params={{ userType: 'organizer' }}
          >
            <FormattedMessage id="LandingPage.audiences.cards.organizer.cta" />
          </NamedLink>
        </p>
      </div>
    </LandingSection>
  );
};

export default LandingHero;
