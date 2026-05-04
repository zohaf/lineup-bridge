import React from 'react';

import { SCHEMA_TYPE_MULTI_ENUM, SCHEMA_TYPE_TEXT, SCHEMA_TYPE_YOUTUBE } from '../../util/types';

import SectionDetails from './SectionDetails';
import SectionText from './SectionText';
import SectionLinks from './SectionLinks';
import SectionMultiEnum from './SectionMultiEnum';
import SectionYoutubeVideo from './SectionYoutubeVideo';

/**
 * This component displays extended data that corresponds to asset based custom field
 * configurations. It can be used for displaying listing, user, and transaction custom fields.
 * - Fields with schema types enum, long, and boolean are displayed with a SectionDetails
 *   subcomponent
 * - Fields with schema type multi-enum, text, and youtubeVideoUrl are each displayed
 *   with dedicated subcomponents
 *
 * @param {Object} props props for the component:
 *   - sectionDetailsProps (Object) is passed directly to SectionDetails component
 *   - propsForCustomFields (Array) can be constructed with the pickCustomFieldProps helper
 *   - page is used to set translation key prefixes and component ids
 *   - pickExtendedDataFields is an entity-specific function that determines what data
 *     is selected to be picked from the entity's extended data
 * @return A component that displays the existing extended data according to
 * the provided field configuration
 */
const CustomExtendedDataSection = props => {
  const {
    sectionDetailsProps,
    propsForCustomFields = [],
    idPrefix,
    pickExtendedDataFields,
    className,
    rootClassName,
  } = props;

  const isUrlTextField = f => {
    const text = f?.text;
    return (
      f?.schemaType === SCHEMA_TYPE_TEXT &&
      typeof text === 'string' &&
      (text.trim().startsWith('http://') ||
        text.trim().startsWith('https://') ||
        text.trim().startsWith('www.'))
    );
  };

  const linkFields = propsForCustomFields.filter(isUrlTextField);
  const otherFields = propsForCustomFields.filter(f => !isUrlTextField(f));

  return (
    <>
      <SectionDetails {...sectionDetailsProps} pickExtendedDataFields={pickExtendedDataFields} />
      <SectionLinks links={linkFields} className={className} rootClassName={rootClassName} />
      {otherFields.map(customFieldProps => {
        const { schemaType, key, ...fieldProps } = customFieldProps;
        return schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
          <SectionMultiEnum
            key={key}
            idPrefix={idPrefix}
            className={className}
            rootClassName={rootClassName}
            pillLayout={key === 'genre'}
            {...fieldProps}
          />
        ) : schemaType === SCHEMA_TYPE_TEXT ? (
          <SectionText
            key={key}
            className={className}
            rootClassName={rootClassName}
            {...fieldProps}
          />
        ) : schemaType === SCHEMA_TYPE_YOUTUBE ? (
          <SectionYoutubeVideo
            key={key}
            className={className}
            rootClassName={rootClassName}
            {...fieldProps}
          />
        ) : null;
      })}
    </>
  );
};

export default CustomExtendedDataSection;
