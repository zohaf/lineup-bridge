import React from 'react';
import classNames from 'classnames';

import { propTypes } from '../../../util/types';
import { createSlug } from '../../../util/urlHelpers';

import { AspectRatioWrapper, H4, NamedLink, ResponsiveImage } from '../../../components';

import css from './DetailsSideCard.module.css';

/**
 * A card that displays the listing image and title on the RequestQuotePage sidebar.
 *
 * @component
 * @param {Object} props
 * @param {propTypes.listing} props.listing - The listing
 * @param {string} props.listingTitle - The listing title
 * @param {propTypes.image} props.firstImage - The first image
 * @param {boolean} props.showListingImage - Whether to show the listing image
 * @param {Object} props.layoutListingImageConfig - The layout listing image config
 * @param {ReactNode} props.speculateTransactionErrorMessage - The speculate transaction error message
 * @param {intlShape} props.intl - The intl object
 */
const DetailsSideCard = props => {
  const {
    listing,
    listingTitle,
    firstImage,
    layoutListingImageConfig,
    speculateTransactionErrorMessage,
    showListingImage,
  } = props;

  const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } =
    layoutListingImageConfig || {};
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  return (
    <div className={css.detailsContainerDesktop} role="complementary">
      {showListingImage && (
        <AspectRatioWrapper
          width={aspectWidth}
          height={aspectHeight}
          className={css.detailsAspectWrapper}
        >
          <ResponsiveImage
            rootClassName={css.rootForImage}
            alt={listingTitle}
            image={firstImage}
            variants={variants}
          />
        </AspectRatioWrapper>
      )}
      <div className={css.listingDetailsWrapper}>
        <div
          className={classNames(css.detailsHeadings, { [css.noListingImage]: !showListingImage })}
        >
          <H4 as="h2">
            <NamedLink
              name="ListingPage"
              params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
            >
              {listingTitle}
            </NamedLink>
          </H4>
        </div>

        {speculateTransactionErrorMessage}
      </div>
    </div>
  );
};

export default DetailsSideCard;
