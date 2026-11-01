import React from 'react';
import loadable from '@loadable/component';

import css from './ContactPage.module.css';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

// Contact section in the LineupBridge design (Centered · form, one card).
// See docs/5-pages/content-pages.html.
const SectionContact = props => {
  const { sectionId, title } = props;
  return (
    <section id={sectionId} className={css.root}>
      <h1 className={css.title}>{title?.content}</h1>
      <div className={css.card}>
        <div className={css.item}>
          <p className={css.label}>Email</p>
          <a className={css.link} href="mailto:info@lineupbridge.com">
            info@lineupbridge.com
          </a>
        </div>
        <div className={css.item}>
          <p className={css.label}>Address</p>
          <p className={css.value}>Singel 126, 1015 AE Amsterdam, Netherlands</p>
        </div>
      </div>
    </section>
  );
};

const contactPageData = {
  sections: [
    {
      sectionType: 'article',
      sectionId: 'contact',
      title: { fieldType: 'heading1', content: 'Let us know how we can help' },
    },
  ],
  meta: {
    pageTitle: { fieldType: 'metaTitle', content: 'Contact us | lineupBridge' },
    pageDescription: {
      fieldType: 'metaDescription',
      content: 'Get in touch with lineupBridge.',
    },
  },
};

const ContactPage = () => (
  <PageBuilder
    pageAssetsData={contactPageData}
    schemaType="ContactPage"
    options={{ sectionComponents: { article: { component: SectionContact } } }}
  />
);

export default ContactPage;
