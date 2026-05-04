import React from 'react';
import classNames from 'classnames';

import { AspectRatioWrapper, ResponsiveImage } from '../../../components';
import { useIntl } from '../../../util/reactIntl';

import css from './ListingImageGrid.module.css';

const FALLBACK_THUMB_VARIANTS = ['scaled-small', 'scaled-medium', 'scaled-large'];

/**
 * Listing photos as a responsive tile grid (2 / 3 / 4 columns). Opens lightbox via parent.
 *
 * @param {Object} props
 * @param {Array} props.images
 * @param {Array<string>} props.thumbnailVariants
 * @param {function(number): void} props.onTileClick
 * @param {string} [props.className]
 * @param {string} [props.rootClassName]
 */
const ListingImageGrid = props => {
  const intl = useIntl();
  const {
    rootClassName,
    className,
    images = [],
    thumbnailVariants,
    onTileClick,
  } = props;

  const thumbVariants = thumbnailVariants?.length ? thumbnailVariants : FALLBACK_THUMB_VARIANTS;

  if (!images.length) {
    return (
      <ResponsiveImage className={css.noImage} image={null} variants={[]} alt="" />
    );
  }

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.grid} role="list">
        {images.map((image, index) => {
          const alt = intl.formatMessage(
            { id: 'ListingImageGallery.imageAltText' },
            { index: index + 1, count: images.length }
          );
          return (
            <button
              key={image.id?.uuid || index}
              type="button"
              className={css.tileButton}
              onClick={() => onTileClick(index)}
              aria-label={alt}
              role="listitem"
            >
              <AspectRatioWrapper width={1} height={1} className={css.tileAspect}>
                <div className={css.tileImageClip}>
                  <ResponsiveImage
                    rootClassName={css.tileImage}
                    image={image}
                    alt={alt}
                    variants={thumbVariants}
                    sizes="(max-width: 767px) 45vw, (max-width: 1023px) 28vw, 22vw"
                  />
                </div>
              </AspectRatioWrapper>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ListingImageGrid;
