import { authInfo } from '../../ducks/auth.duck';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { loadData as loadInboxData } from '../InboxPage/InboxPage.duck';
import { queryOwnListings } from '../ManageListingsPage/ManageListingsPage.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { getCurrentUserTypeRoles } from '../../util/userHelpers';

/**
 * CMS pages load hosted JSON. For `home`, also load inbox orders and own listings for the
 * dashboard (after auth is known so `fetchCurrentUser` does not no-op on SSR).
 */
export const loadData = (params, search, config) => async (dispatch, getState) => {
  const pageId = params.pageId;
  const pageAsset = { [pageId]: `content/pages/${pageId}.json` };
  const hasFallbackContent = false;

  const isHome = String(pageId).toLowerCase() === 'home';

  if (!isHome) {
    return dispatch(fetchPageAssets(pageAsset, hasFallbackContent));
  }

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config?.layout?.listingImage || {};
  const aspectRatio = aspectHeight / aspectWidth;

  await dispatch(fetchPageAssets(pageAsset, hasFallbackContent));

  try {
    await dispatch(authInfo());
  } catch {
    // authInfo logs failures; anonymous users still get the CMS page
  }

  await dispatch(fetchCurrentUser());

  const state = getState();
  const { isAuthenticated } = state.auth || {};
  if (!isAuthenticated) {
    return;
  }

  const currentUser = state.user?.currentUser;
  const roles = getCurrentUserTypeRoles(config, currentUser);
  const inboxTab = roles?.provider && !roles?.customer ? 'sales' : 'orders';

  await Promise.all([
    dispatch(loadInboxData({ tab: inboxTab }, '')),
    dispatch(
      queryOwnListings({
        page: 1,
        perPage: 3,
        include: ['images', 'currentStock'],
        'fields.image': [`variants.${variantPrefix}`, `variants.${variantPrefix}-2x`],
        ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
        ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
        'limit.images': 1,
      })
    ),
  ]);
};
