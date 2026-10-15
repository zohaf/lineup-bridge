import React from 'react';
import classNames from 'classnames';

import LayoutComposer from '../LayoutComposer/LayoutComposer';

import css from '../../styles/lineupLayout.module.css';

/**
 * Split page layout, role "summary": page header, a main column and a summary column.
 * Phones and tablets: header, summary, main. From 1024px header and main share the left column
 * and the summary sits on the right (360px, sticky), level with the first main card or the title. Renders no text. Built on LayoutComposer like LayoutCentered.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules to the page column
 * @param {ReactNode?} props.header page header, first in the left column
 * @param {ReactNode?} props.side summary column content
 * @param {'content'|'title'} [props.sideAlign] desktop: summary level with the first main card
 *   ('content', default) or with the page title when there is no main content ('title')
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
    sideAlign = 'content',
    stickyTopbar = true,
    children,
    after,
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
              <div
                className={classNames(
                  css.split,
                  {
                    [css.splitBelowTopbar]: stickyTopbar,
                    [css.splitAlignTitle]: sideAlign === 'title',
                  },
                  className
                )}
              >
                {header ? <div className={css.splitHeader}>{header}</div> : null}
                {side ? <aside className={css.splitSide}>{side}</aside> : null}
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
