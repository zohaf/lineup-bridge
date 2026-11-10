import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const TOS_ASSET_NAME = 'terms-of-service';
export const PRIVACY_POLICY_ASSET_NAME = 'privacy-policy';
// LineupBridge: the signup Terms link shows the Terms of use page (the one in the footer). The store
// key stays termsOfService, a fixed page asset in hostedAssets.duck.js.
const TERMS_PAGE_ID = 'terms-of-use';

export const loadData = (params, search) => dispatch => {
  const pageAsset = {
    termsOfService: `content/pages/${TERMS_PAGE_ID}.json`,
    privacyPolicy: `content/pages/${PRIVACY_POLICY_ASSET_NAME}.json`,
  };
  return dispatch(fetchPageAssets(pageAsset, true));
};
