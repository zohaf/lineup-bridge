import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { DAY, HOUR } from '../../../../transactions/transaction';

const { Money } = sdkTypes;

/**
 * Listing types where price may be omitted on the pricing step.
 * `day` is included because this marketplace labels `day` as “Hourly rate” in UI copy while
 * still using the `day` unit type in public data.
 */
export const isListingPriceOptionalUnitType = unitType =>
  unitType === HOUR || unitType === DAY;

/**
 * Final Form validators for listing price (single price or price variant row).
 * Hourly listings (`unitType === hour`) and `day` (shown as hourly rate in UI) allow an empty price;
 * if a price is set, minimum rules apply.
 *
 * @param {number} listingMinimumPriceSubUnits
 * @param {string} marketplaceCurrency
 * @param {Object} intl react-intl
 * @param {string} [unitType]
 * @returns {Function}
 */
export const getListingPriceValidators = (
  listingMinimumPriceSubUnits,
  marketplaceCurrency,
  intl,
  unitType
) => {
  const priceRequiredMsg = intl.formatMessage({ id: 'EditListingPricingForm.priceRequired' });
  const priceRequired = validators.required(priceRequiredMsg);

  const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
  const minPrice = formatMoney(intl, minPriceRaw);
  const priceTooLowMsg = intl.formatMessage(
    { id: 'EditListingPricingForm.priceTooLow' },
    { minPrice }
  );
  const minPriceRequired = validators.moneySubUnitAmountAtLeast(
    priceTooLowMsg,
    listingMinimumPriceSubUnits
  );

  const strictValidators = listingMinimumPriceSubUnits
    ? validators.composeValidators(priceRequired, minPriceRequired)
    : priceRequired;

  if (!isListingPriceOptionalUnitType(unitType)) {
    return strictValidators;
  }

  return value => {
    if (value == null || value === '') {
      return undefined;
    }
    if (value instanceof Money && (value.amount == null || value.amount === '')) {
      return undefined;
    }
    if (listingMinimumPriceSubUnits) {
      return minPriceRequired(value);
    }
    return undefined;
  };
};
