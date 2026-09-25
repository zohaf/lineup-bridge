import React from 'react';
import loadable from '@loadable/component';

import css from './ContactPage.module.css';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const ContactDetails = () => (
  <div className={css.contactDetails}>
    <div>
        <div className={css.contactLabel}>Email</div>
      <div>info@lineupbridge.com</div>
    </div>
    <div>
        <div className={css.contactLabel}>Address</div>
      <div>Singel 126, 1015 AE Amsterdam, Netherlands</div>
    </div>
  </div>
);

const contactPageData = {
  sections: [
    {
      sectionType: 'article',
      sectionId: 'contact',
      title: { fieldType: 'heading1', content: 'Let us know how we can help' },
      blocks: [{ blockType: 'contactDetails', blockId: 'contact-details' }],
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
  <div className={css.page}>
    <PageBuilder
      pageAssetsData={contactPageData}
      schemaType="ContactPage"
      options={{ blockComponents: { contactDetails: { component: ContactDetails } } }}
    />
  </div>
);

export default ContactPage;
