// Code-defined landing page sections, in page order.
// Each `sectionType` is rendered by a component registered in ./sections (landingSectionComponents).
// Message ids are resolved with intl, copy lives in src/translations.

export const landingSections = [
  {
    sectionType: 'landingHero',
    sectionId: 'landing-hero',
    sectionName: 'Hero',
    messageKeyPrefix: 'LandingPage.hero',
  },
  {
    sectionType: 'landingValue',
    sectionId: 'landing-value',
    sectionName: 'Why LineupBridge',
    variant: 'dark',
    align: 'center',
    messageKeyPrefix: 'LandingPage.value',
    stages: [
      { key: 'offer', tone: 'neutral' },
      { key: 'negotiation', tone: 'active' },
      { key: 'confirmed', tone: 'success' },
      { key: 'paid', tone: 'success' },
    ],
  },
  {
    sectionType: 'landingSteps',
    sectionId: 'landing-steps',
    sectionName: 'How it works',
    variant: 'page',
    align: 'left',
    messageKeyPrefix: 'LandingPage.steps',
    items: [
      { key: 'discover', role: 'organizer' },
      { key: 'offer', role: 'organizer' },
      { key: 'negotiate', role: 'both' },
      { key: 'confirm', role: 'dj' },
      { key: 'pay', role: 'organizer' },
    ],
  },
  {
    sectionType: 'landingAudiences',
    sectionId: 'landing-audiences',
    sectionName: 'Get started',
    variant: 'page',
    align: 'center',
    messageKeyPrefix: 'LandingPage.audiences',
    cards: [
      {
        key: 'dj',
        userType: 'dj',
        buttonVariant: 'filled',
        itemKeys: ['item1', 'item2', 'item3'],
      },
      {
        key: 'organizer',
        userType: 'organizer',
        buttonVariant: 'outlined',
        itemKeys: ['item1', 'item2', 'item3'],
      },
    ],
  },
  {
    sectionType: 'landingFaq',
    sectionId: 'landing-faq',
    sectionName: 'FAQ',
    variant: 'page',
    align: 'left',
    messageKeyPrefix: 'LandingPage.faq',
    items: ['payWhen', 'handled', 'stripe', 'release', 'fullPayment', 'fee', 'vat'],
  },
];
