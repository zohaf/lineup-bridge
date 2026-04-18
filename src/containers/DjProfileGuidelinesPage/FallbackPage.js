import React from 'react';
import loadable from '@loadable/component';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const fallbackMarkdown = `
To make things easier for you — and to help us showcase you in the best possible way — we recommend following these guidelines when creating your profile.

A clear and complete profile increases your chances of getting booked and helps clients quickly understand what you offer.

## Profile Basics

### Artist Name

Use your official DJ or artist name.

Keep it simple and consistent with your other platforms. Avoid adding extra text, symbols, or emojis.

### Bio

This is where you introduce yourself to potential clients.

We recommend keeping it clear and structured. A strong bio usually includes:

- The genres you play
- The type of events you perform at
- Your experience or background
- What clients can expect from your sets

Keep it concise and professional so it's easy to read.

### Links

Adding external links helps build trust and gives clients a better sense of your work.

You can include platforms like:

- SoundCloud (your mixes or sets)
- Instagram (your presence and activity)
- Resident Advisor (events and profile)
- Your personal website

At least one active and up-to-date link is strongly recommended.

## Photos

### Profile Image

Choose a clear, high-quality image that represents you as an artist.

Avoid screenshots, flyers, or low-resolution images.

### Additional Photos

Uploading 2–3 good photos helps clients get a better impression.

Try to include a mix of performance shots and portraits.

## Pricing

Setting a price helps clients understand your level and makes booking smoother.

You can always adjust your rate or send a custom offer later, so don't worry about getting it perfect.

## Availability

Keeping your availability updated makes it easier for clients to book you.

Start with a default weekly schedule, and adjust specific dates when needed.

## Quick Checklist

Before finishing your profile, make sure you have:

- A clear artist name
- A short, structured bio
- At least one external link
- A high-quality profile image
- A few additional photos
- Pricing set
- Availability updated
`;

export const fallbackSections = {
  sections: [
    {
      sectionType: 'article',
      sectionId: 'dj-profile-guidelines',
      appearance: { fieldType: 'customAppearance', backgroundColor: '#ffffff' },
      title: { fieldType: 'heading1', content: 'DJ Profile Guidelines' },
      blocks: [
        {
          blockType: 'defaultBlock',
          blockId: 'guidelines-content',
          text: {
            fieldType: 'markdown',
            content: fallbackMarkdown,
          },
        },
      ],
    },
  ],
  meta: {
    pageTitle: {
      fieldType: 'metaTitle',
      content: 'DJ Profile Guidelines',
    },
    pageDescription: {
      fieldType: 'metaDescription',
      content:
        'Recommendations for building a clear DJ profile: bio, links, photos, pricing, and availability.',
    },
  },
};

const FallbackPage = props => {
  return <PageBuilder pageAssetsData={fallbackSections} {...props} />;
};

export default FallbackPage;
