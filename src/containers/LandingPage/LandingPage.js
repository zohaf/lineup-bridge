import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { ASSET_NAME } from './LandingPage.duck';
import { fetchFeaturedListings } from '../../ducks/featuredListings.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { getFeaturedListingsProps } from '../../util/data';

import css from './LandingPage.module.css';

const isHowItWorksSection = section =>
  section?.sectionId === 'how-it-works' || section?.sectionName?.toLowerCase() === 'how it works';

const addLandingTitleBreak = title => {
  if (!title?.content) {
    return title;
  }

  const content = title.content.replace(/\s*-\s*without\b/, '\nwithout');
  return content === title.content ? title : { ...title, content };
};

const removeLandingDatePicker = section => {
  const callToAction = section?.callToAction;
  if (!callToAction?.searchFields) {
    return section;
  }

  return {
    ...section,
    callToAction: {
      ...callToAction,
      searchFields: {
        ...callToAction.searchFields,
        dateRange: false,
      },
    },
  };
};

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

export const LandingPageComponent = props => {
  const { pageAssetsData, inProgress, error } = props;
  const landingPageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;
  const pageAssetsDataWithoutHowItWorks = landingPageData
    ? {
        ...landingPageData,
        sections: landingPageData.sections?.filter(section => !isHowItWorksSection(section)),
      }
    : landingPageData;
  const sectionsWithLandingTitleBreak = pageAssetsDataWithoutHowItWorks?.sections?.map(
    (section, index) => {
      const sectionWithoutDatePicker = removeLandingDatePicker(section);
      return index === 0
        ? { ...sectionWithoutDatePicker, title: addLandingTitleBreak(section.title) }
        : sectionWithoutDatePicker;
    }
  );
  const pageAssetsDataForLanding = pageAssetsDataWithoutHowItWorks
    ? { ...pageAssetsDataWithoutHowItWorks, sections: sectionsWithLandingTitleBreak }
    : pageAssetsDataWithoutHowItWorks;

  return (
    <PageBuilder
      pageAssetsData={pageAssetsDataForLanding}
      className={css.landingPage}
      title="lineupBridge"
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
      featuredListings={getFeaturedListingsProps(camelize(ASSET_NAME), props)}
    />
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const featuredListingData = state.featuredListings || {};

  const getListingEntitiesById = listingIds => getListingsById(state, listingIds);

  return { pageAssetsData, featuredListingData, getListingEntitiesById, inProgress, error };
};

const mapDispatchToProps = dispatch => ({
  onFetchFeaturedListings: (sectionId, parentPage, listingImageConfig, allSections) =>
    dispatch(fetchFeaturedListings({ sectionId, parentPage, listingImageConfig, allSections })),
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(LandingPageComponent);

export default LandingPage;
