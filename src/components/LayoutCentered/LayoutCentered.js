import React from 'react';
import classNames from 'classnames';

import LayoutComposer from '../LayoutComposer/LayoutComposer';

import css from '../../styles/lineupLayout.module.css';

const VARIANT_CLASSES = {
  narrow: css.narrow,
  form: css.form,
  wide: css.wide,
  profile: css.profile,
};

/**
 * Centered page layout: one column, centered. The variant sets the column's max width.
 * Renders no text. Built on LayoutComposer with the same areas as LayoutSingleColumn
 * (topbar, main with id="main-content", footer), using our own classes.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules to the column
 * @param {'narrow'|'profile'|'form'|'wide'} props.variant column max width: 440px, 600px, 760px or 920px
 * @param {boolean?} props.stickyTopbar keep the topbar pinned while scrolling (default true)
 * @param {ReactNode} props.children
 * @param {ReactNode} props.topbar
 * @param {ReactNode?} props.footer
 * @returns {JSX.Element}
 */
const LayoutCentered = props => {
  const {
    className,
    variant = 'form',
    stickyTopbar = true,
    children,
    topbar: topbarContent,
    footer: footerContent,
    ...rest
  } = props;

  const layoutAreas = `
    topbar
    main
    footer
  `;

  return (
    <LayoutComposer areas={layoutAreas} className={css.root} {...rest}>
      {layoutProps => {
        const { Topbar, Main, Footer } = layoutProps;
        return (
          <>
            <Topbar
              as="header"
              className={classNames(css.topbar, { [css.stickyTopbar]: stickyTopbar })}
            >
              {topbarContent}
            </Topbar>
            <Main as="main" id="main-content" className={css.main}>
              <div className={classNames(css.centered, VARIANT_CLASSES[variant], className)}>
                {children}
              </div>
            </Main>
            <Footer>{footerContent}</Footer>
          </>
        );
      }}
    </LayoutComposer>
  );
};

LayoutCentered.displayName = 'LayoutCentered';

export default LayoutCentered;
