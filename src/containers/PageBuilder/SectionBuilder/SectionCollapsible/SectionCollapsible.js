import React from 'react';
import { ChevronDown } from 'lucide-react';

import Field from '../../Field';

import css from './SectionCollapsible.module.css';

/**
 * LineupBridge restyle of a Console 'article' section (legal pages, FAQ).
 * Content comes from Console; only the presentation lives here:
 * section title = page title, description = small text under it,
 * blocks without a title = intro text, blocks with a title = one collapsible card each.
 * See .claude/design/content-pages.html.
 *
 * @component
 * @param {Object} props
 * @param {string} props.sectionId id of the section
 * @param {Object?} props.title
 * @param {Object?} props.description
 * @param {Array<Object>?} props.blocks array of block configs
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @returns {JSX.Element} section with collapsible cards
 */
const SectionCollapsible = props => {
  const { sectionId, title, description, blocks = [], options } = props;
  const fieldOptions = { fieldComponents: options?.fieldComponents };

  const intro = blocks.filter(b => !b.title?.content);
  const cards = blocks.filter(b => b.title?.content);

  return (
    <section id={sectionId} className={css.root}>
      {title?.content || description?.content ? (
        <header className={css.header}>
          {title?.content ? <h1 className={css.title}>{title.content}</h1> : null}
          <Field data={description} className={css.description} options={fieldOptions} />
        </header>
      ) : null}

      {intro.map((b, i) => (
        <div key={b.blockId || i} id={b.blockId} className={css.text}>
          <Field data={b.text} options={fieldOptions} />
        </div>
      ))}

      {cards.length > 0 ? (
        <div className={css.cards}>
          {cards.map((b, i) => (
            <details key={b.blockId || i} id={b.blockId} className={css.card} open={i === 0}>
              <summary className={css.summary}>
                <h2 className={css.cardTitle}>{b.title.content}</h2>
                <span className={css.chevron} aria-hidden="true">
                  <ChevronDown size={20} />
                </span>
              </summary>
              <div className={css.answer}>
                <div className={css.text}>
                  <Field data={b.text} options={fieldOptions} />
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default SectionCollapsible;
