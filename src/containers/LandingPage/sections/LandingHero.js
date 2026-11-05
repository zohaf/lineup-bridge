import React, { useEffect, useRef } from 'react';

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
  const areaRef = useRef(null);
  const meshRef = useRef(null);

  // Speaker grille: gray dots appear around the pointer anywhere over the black area, including
  // under the transparent topbar (docs/5-pages/landing.md). A touch ends with the finger lifted or
  // when the browser takes over the gesture to scroll.
  useEffect(() => {
    let pointer = null;
    const paint = () => {
      const area = areaRef.current;
      const mesh = meshRef.current;
      if (!area || !mesh) return;
      const r = area.getBoundingClientRect();
      const inside = !!pointer && pointer.y >= r.top && pointer.y <= r.bottom;
      mesh.classList.toggle(css.meshOn, inside);
      if (!inside) return;
      mesh.style.setProperty('--x', `${pointer.x - r.left}px`);
      mesh.style.setProperty('--y', `${pointer.y - r.top}px`);
    };
    const onMove = e => {
      pointer = { x: e.clientX, y: e.clientY };
      paint();
    };
    const onLeave = () => {
      pointer = null;
      paint();
    };
    const onTouchEnd = e => {
      if (e.pointerType !== 'mouse') onLeave();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('pointerup', onTouchEnd);
    window.addEventListener('pointercancel', onTouchEnd);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointerup', onTouchEnd);
      window.removeEventListener('pointercancel', onTouchEnd);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', paint);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <>
      <div ref={areaRef} className={css.darkArea} aria-hidden="true">
        <div ref={meshRef} className={css.mesh} />
      </div>
      <LandingSection id={sectionId} variant="clear" className={css.section}>
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
    </>
  );
};

export default LandingHero;
