import { fetchCurrentUser } from '../../ducks/user.duck';
import { fetchStripeAccount } from '../../ducks/stripeConnectAccount.duck';

// ================ Load Data ================ //

// The page uses the ContactDetailsPage, PasswordChangePage and ManageAccountPage slices for its
// forms. The Stripe account is fetched so the payout banner knows whether Stripe verification is
// done (src/util/payout.js).
export const loadData = () => (dispatch, getState) => {
  return dispatch(fetchCurrentUser()).then(response => {
    const currentUser = getState().user.currentUser;
    if (currentUser?.attributes?.stripeConnected || currentUser?.stripeAccount) {
      dispatch(fetchStripeAccount());
    }
    return response;
  });
};
