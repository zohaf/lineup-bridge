import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router-dom';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';

import { FieldTextInput, Form, PrimaryButton } from '../../../components';

import buttonCss from '../../../styles/lineupButtons.module.css';
import css from './HeroSearch.module.css';

/**
 * Keyword search bar of the landing hero: input and Search button on one line.
 * Searches like the Console hero: keywords go to the search page as a query parameter.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @returns {JSX.Element}
 */
const HeroSearch = props => {
  const { className } = props;
  const intl = useIntl();
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const placeholder = intl.formatMessage({ id: 'PageBuilder.SearchCTA.keywordFilterPlaceholderDJ' });

  const onSubmit = values => {
    const queryParams = values.keywords ? { keywords: values.keywords } : {};
    history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, queryParams));
  };

  return (
    <FinalForm
      onSubmit={onSubmit}
      render={({ handleSubmit }) => (
        <Form role="search" className={classNames(css.root, className)} onSubmit={handleSubmit}>
          <FieldTextInput
            rootClassName={css.field}
            inputRootClass={css.input}
            name="keywords"
            type="text"
            placeholder={placeholder}
            aria-label={placeholder}
          />
          <PrimaryButton type="submit" rootClassName={buttonCss.primary} className={css.button}>
            <FormattedMessage id="PageBuilder.SearchCTA.buttonLabel" />
          </PrimaryButton>
        </Form>
      )}
    />
  );
};

export default HeroSearch;
