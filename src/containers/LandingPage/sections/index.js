import LandingSectionShell from './LandingSectionShell';
import LandingAudiences from './LandingAudiences';
import LandingFaq from './LandingFaq';
import LandingHero from './LandingHero';
import LandingSteps from './LandingSteps';
import LandingValue from './LandingValue';

// Section types for PageBuilder's `options.sectionComponents`, see ../landingSections.js
export const landingSectionComponents = {
  landingHero: { component: LandingHero },
  landingValue: { component: LandingValue },
  landingSteps: { component: LandingSteps },
  landingAudiences: { component: LandingAudiences },
  landingFaq: { component: LandingFaq },
};
