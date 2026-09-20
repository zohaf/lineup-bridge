import React from 'react';
import loadable from '@loadable/component';

import css from './ContactPage.module.css';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const contactPageData = {
  sections: [
    {
      sectionType: 'article',
      sectionId: 'contact',
      title: { fieldType: 'heading1', content: 'Let us know how we can help' },
      blocks: [
        {
          blockType: 'defaultBlock',
          blockId: 'contact-details',
          text: {
            fieldType: 'markdown',
            content: `
**Phone**
To be added

**Email**
To be added

**Address**
To be added
`,
          },
        },
      ],
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
  <PageBuilder pageAssetsData={contactPageData} className={css.page} schemaType="ContactPage" />
);

export default ContactPage;
