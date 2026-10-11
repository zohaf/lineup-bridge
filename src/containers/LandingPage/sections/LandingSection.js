import React from 'react';
import classNames from 'classnames';

import SectionContainer from '../../PageBuilder/SectionBuilder/SectionContainer';

import css from './LandingSection.module.css';

/**
 * Shell for the code-defined landing page sections:
 * background (beige page color or black), content max width and vertical padding.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string} props.id section id
 * @param {'page'|'dark'} props.variant background
 * @param {boolean?} props.wide wider content area with smaller side padding
 * @param {ReactNode} props.children
 * @returns {JSX.Element}
 */
const LandingSection = props => {
  const { className, id, variant = 'page', wide = false, children } = props;
  const rootClasses = classNames(css.root, { [css.dark]: variant === 'dark' }, className);

  return (
    <SectionContainer id={id} rootClassName={rootClasses} sectionContentClassName={css.content}>
      <div className={classNames(css.inner, { [css.wide]: wide })}>{children}</div>
    </SectionContainer>
  );
};

export default LandingSection;
