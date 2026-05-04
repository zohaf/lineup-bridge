import React from 'react';
import classNames from 'classnames';
import { Heading, PropertyGroup } from '../../components';

import css from './CustomExtendedDataSection.module.css';

const SectionMultiEnum = props => {
  const {
    heading,
    options,
    selectedOptions,
    idPrefix,
    className,
    rootClassName,
    showUnselectedOptions = true,
    pillLayout = false,
  } = props;
  const effectiveShowUnselected = pillLayout ? false : showUnselectedOptions;
  const hasContent = effectiveShowUnselected || selectedOptions?.length > 0;
  if (!heading || !options || !hasContent) {
    return null;
  }
  const idSlug = heading.toLowerCase().replace(/ /g, '_');

  const classes = classNames(rootClassName || css.sectionMultiEnum, className);

  return (
    <section className={classes}>
      <Heading as="h2" rootClassName={css.sectionHeading}>
        {heading}
      </Heading>
      <PropertyGroup
        id={`${idPrefix}.${idSlug}`}
        ariaLabel={heading}
        options={options}
        selectedOptions={selectedOptions}
        twoColumns={!pillLayout && options.length > 5}
        showUnselectedOptions={effectiveShowUnselected}
        pillLayout={pillLayout}
      />
    </section>
  );
};

export default SectionMultiEnum;
