import React, { useEffect, useState } from 'react';

import typeCss from './lineupType.module.css';
import css from './Foundations.module.css';

// Design tokens rendered from the CSS variables in lineupTokens.css and marketplaceDefaults.css,
// so this page always shows the values the app uses. Names and use: docs/4-design-system/tokens.md.

const COLOURS = [
  '--colorBlack',
  '--colorWhite',
  '--colorPageBackground',
  '--colorGrey50',
  '--colorGrey100',
  '--colorGrey200',
  '--colorGrey300',
  '--colorGrey600',
  '--colorGrey700',
  '--colorGrey800',
  '--colorGrey900',
  '--colorSuccess',
  '--colorAttention',
  '--colorAttentionDark',
  '--colorAttentionSubtle',
  '--colorFail',
  '--colorFailSubtle',
  '--lb-grille-dot',
];

const TYPE_ROLES = [
  'display',
  'h2',
  'h3',
  'leadLarge',
  'lead',
  'body',
  'small',
  'eyebrow',
  'label',
  'button',
  'fieldLabel',
];

const SPACING = [
  '--lb-space-1',
  '--lb-space-2',
  '--lb-space-3',
  '--lb-space-4',
  '--lb-space-5',
  '--lb-space-6',
  '--lb-space-7',
  '--lb-space-8',
  '--lb-space-9',
  '--lb-space-10',
];

const ROLES = [
  '--lb-gutter',
  '--lb-section-pad',
  '--lb-header-gap',
  '--lb-card-pad',
  '--lb-card-gap',
  '--lb-row-pad',
  '--lb-topbar-height',
  '--lb-header-side',
  '--lb-button-height',
  '--lb-input-height',
  '--lb-width-narrow',
  '--lb-width-form',
  '--lb-width-wide',
  '--lb-width-split',
  '--lb-width-search',
  '--lb-grille-pitch',
  '--lb-grille-reveal',
  '--lb-motion-fade',
];

// Reads the current value of each variable; values change with the window width (768px, 1024px).
const useTokenValues = names => {
  const [values, setValues] = useState({});
  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      setValues(Object.fromEntries(names.map(n => [n, style.getPropertyValue(n).trim()])));
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, [names]);
  return values;
};

const TokenTable = ({ names, renderSample }) => {
  const values = useTokenValues(names);
  return (
    <table className={css.table}>
      <tbody>
        {names.map(name => (
          <tr key={name}>
            <td className={css.sample}>{renderSample(name)}</td>
            <td>
              <code>{name}</code>
            </td>
            <td className={css.value}>
              <code>{values[name]}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
};

export const Colours = {
  render: () => (
    <TokenTable
      names={COLOURS}
      renderSample={name => <span className={css.swatch} style={{ background: `var(${name})` }} />}
    />
  ),
};

export const Type = {
  render: () => (
    <div className={css.stack}>
      {TYPE_ROLES.map(role => (
        <div key={role} className={css.typeRow}>
          <code className={css.typeName}>.{role}</code>
          <p className={`${typeCss.reset} ${typeCss[role]}`}>{role}</p>
        </div>
      ))}
    </div>
  ),
};

export const Spacing = {
  render: () => (
    <TokenTable
      names={SPACING}
      renderSample={name => <span className={css.bar} style={{ width: `var(${name})` }} />}
    />
  ),
};

export const SizesAndRoles = {
  render: () => <TokenTable names={ROLES} renderSample={() => null} />,
};
