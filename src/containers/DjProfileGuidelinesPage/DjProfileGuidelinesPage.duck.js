import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const ASSET_NAME = 'dj-profile-guidelines';

export const loadData = (params, search) => dispatch => {
  const pageAsset = { djProfileGuidelines: `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
