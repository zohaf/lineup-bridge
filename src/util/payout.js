/**
 * Payout helpers. Business rule (.claude/business-rules.md): a DJ's payout setup is complete only
 * when Stripe verification is done, i.e. the Stripe account exists and Stripe has no past due or
 * currently due requirements. Saving the basic details on our platform is not enough.
 */

/**
 * Check if Stripe lists requirements of the given type ('past_due', 'currently_due', …).
 *
 * @param {Object} stripeAccountData the Stripe account object (stripeAccount.attributes.stripeAccountData)
 * @param {string} requirementType
 * @returns {boolean}
 */
export const hasStripeRequirements = (stripeAccountData, requirementType) =>
  stripeAccountData != null &&
  !!stripeAccountData.requirements &&
  Array.isArray(stripeAccountData.requirements[requirementType]) &&
  stripeAccountData.requirements[requirementType].length > 0;

/**
 * Payout setup is complete: the Stripe account exists, its data is loaded and nothing is due.
 * Returns false while the Stripe data is not loaded, so callers should wait for
 * stripeConnectAccount.stripeAccountFetched before showing anything based on it.
 *
 * @param {Object} stripeAccount stripeAccount entity from state.stripeConnectAccount
 * @returns {boolean}
 */
export const isPayoutSetupComplete = stripeAccount => {
  const stripeAccountData = stripeAccount?.attributes?.stripeAccountData;
  if (!stripeAccount?.id || !stripeAccountData) {
    return false;
  }
  return (
    !hasStripeRequirements(stripeAccountData, 'past_due') &&
    !hasStripeRequirements(stripeAccountData, 'currently_due')
  );
};

/**
 * Payout setup status for the current user: 'complete', 'incomplete', or 'unknown' while the
 * Stripe account data is still loading. Loading the current user stores the Stripe account without
 * its Stripe data (stripeAccountData), so a Stripe-connected user stays 'unknown' until
 * fetchStripeAccount has returned it. Use it to avoid showing a payout notice that then disappears.
 *
 * @param {Object} currentUser
 * @param {Object} stripeAccount stripeAccount entity from state.stripeConnectAccount
 * @returns {'complete'|'incomplete'|'unknown'}
 */
export const getPayoutSetupStatus = (currentUser, stripeAccount) => {
  if (!currentUser?.id) {
    return 'unknown';
  }
  if (!currentUser.attributes?.stripeConnected) {
    return 'incomplete';
  }
  if (!stripeAccount?.attributes?.stripeAccountData) {
    return 'unknown';
  }
  return isPayoutSetupComplete(stripeAccount) ? 'complete' : 'incomplete';
};
