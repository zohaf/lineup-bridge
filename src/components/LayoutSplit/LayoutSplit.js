import React from 'react';
import classNames from 'classnames';

import LayoutComposer from '../LayoutComposer/LayoutComposer';

import css from '../../styles/lineupLayout.module.css';

/**
 * Split page layout with two roles (see .claude/layouts.md). Renders no text. Built on
 * LayoutComposer like LayoutCentered.
 * - "summary" (default): page header, a main column and a summary column. Phones and tablets:
 *   header, summary, main. From 1024px header and main share the left column and the summary sits
 *   on the right (360px, sticky), level with the first main card or the title.
 * - "nav": a step menu (side), then header and main. Phones and tablets: the side is a sticky row
 *   under the topbar. From 1024px the side is the left column (264px, sticky) and header + main
 *   share the right column (max 760px).
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules to the page column
 * @param {ReactNode?} props.header page header, first in the left column
 * @param {'summary'|'nav'} [props.role] what the side column holds (default 'summary')
 * @param {ReactNode?} props.side summary column content, or the step menu for role 'nav'
 * @param {'content'|'title'} [props.sideAlign] role 'summary', desktop: summary level with the
 *   first main card ('content', default) or with the page title when there is no main content ('title')
 * @param {boolean?} props.stickyTopbar keep the topbar pinned while scrolling (default true)
 * @param {ReactNode} props.children main column content
 * @param {ReactNode?} props.after content after the page column inside main (a sticky action bar)
 * @param {ReactNode} props.topbar
 * @param {ReactNode?} props.footer
 * @returns {JSX.Element}
 */
const LayoutSplit = props => {
  const {
    className,
    header,
    side,
    role = 'summary',
    sideAlign = 'content',
    stickyTopbar = true,
    children,
    after,
    topbar: topbarContent,
    footer: footerContent,
    ...rest
  } = props;

  const isNav = role === 'nav';
  const headerMaybe = header ? <div className={css.splitHeader}>{header}</div> : null;
  const sideMaybe = side ? <aside className={css.splitSide}>{side}</aside> : null;

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
              <div
                className={classNames(
                  css.split,
                  {
                    [css.splitBelowTopbar]: stickyTopbar,
                    [css.splitNav]: isNav,
                    [css.splitAlignTitle]: !isNav && sideAlign === 'title',
                  },
                  className
                )}
              >
                {isNav ? sideMaybe : headerMaybe}
                {isNav ? headerMaybe : sideMaybe}
                <div className={css.splitMain}>{children}</div>
              </div>
              {after}
            </Main>
            <Footer>{footerContent}</Footer>
          </>
        );
      }}
    </LayoutComposer>
  );
};

LayoutSplit.displayName = 'LayoutSplit';

export default LayoutSplit;
