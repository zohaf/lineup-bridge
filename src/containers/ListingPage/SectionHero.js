import React, { useEffect, useState } from 'react';

import { Modal } from '../../components';

import ImageCarousel from './ImageCarousel/ImageCarousel';
import ListingImageGrid from './ListingImageGrid/ListingImageGrid';

import css from './ListingPage.module.css';

const SectionHero = props => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    listing,
    isOwnListing,
    imageCarouselOpen,
    onImageCarouselClose,
    onManageDisableScrolling,
    actionBar,
    variantPrefix,
    carouselStartIndex = 0,
    onPhotoTileClick,
  } = props;

  const hasImages = listing.images && listing.images.length > 0;
  const thumbnailVariants = variantPrefix
    ? [variantPrefix, `${variantPrefix}-2x`, `${variantPrefix}-4x`]
    : ['scaled-small', 'scaled-medium', 'scaled-large'];
  const imageVariants = ['scaled-small', 'scaled-medium', 'scaled-large', 'scaled-xlarge'];

  return (
    <section className={css.sectionHero} data-testid="hero">
      <div className={css.imageWrapperForSectionHeroGrid}>
        {mounted && listing.id && isOwnListing ? (
          <div
            onClick={e => e.stopPropagation()}
            className={css.actionBarContainerForHeroLayout}
          >
            {actionBar}
          </div>
        ) : null}

        {hasImages ? (
          <ListingImageGrid
            images={listing.images}
            thumbnailVariants={thumbnailVariants}
            onTileClick={onPhotoTileClick}
          />
        ) : null}
      </div>
      <Modal
        id="ListingPage.imageCarousel"
        scrollLayerClassName={css.carouselModalScrollLayer}
        containerClassName={css.carouselModalContainer}
        lightCloseButton
        isOpen={imageCarouselOpen}
        onClose={onImageCarouselClose}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <ImageCarousel
          images={listing.images}
          imageVariants={imageVariants}
          startIndex={carouselStartIndex}
        />
      </Modal>
    </section>
  );
};

export default SectionHero;
