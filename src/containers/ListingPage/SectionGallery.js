import React, { useState } from 'react';

import { Modal } from '../../components';

import ImageCarousel from './ImageCarousel/ImageCarousel';
import ListingImageGrid from './ListingImageGrid/ListingImageGrid';

import css from './ListingPage.module.css';

const LISTING_GRID_LIGHTBOX_ID = 'ListingPage.listingImageGridLightbox';

const SectionGallery = props => {
  const { listing, variantPrefix, onManageDisableScrolling } = props;
  const images = listing.images;
  const imageVariants = ['scaled-small', 'scaled-medium', 'scaled-large', 'scaled-xlarge'];
  const thumbnailVariants = [variantPrefix, `${variantPrefix}-2x`, `${variantPrefix}-4x`];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);

  const handleTileClick = index => {
    setCarouselStartIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <section className={css.productGallery} data-testid="carousel">
      <ListingImageGrid
        images={images}
        thumbnailVariants={thumbnailVariants}
        onTileClick={handleTileClick}
      />
      <Modal
        id={LISTING_GRID_LIGHTBOX_ID}
        scrollLayerClassName={css.carouselModalScrollLayer}
        containerClassName={css.carouselModalContainer}
        lightCloseButton
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <ImageCarousel
          images={images}
          imageVariants={imageVariants}
          startIndex={carouselStartIndex}
        />
      </Modal>
    </section>
  );
};

export default SectionGallery;
