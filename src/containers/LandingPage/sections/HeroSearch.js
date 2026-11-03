import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import { useHistory } from 'react-router-dom';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';

import { FieldTextInput, Form } from '../../../components';

import buttonCss from '../../../styles/lineupButtons.module.css';
import css from './HeroSearch.module.css';

/**
 * Keyword search bar of the landing hero: input and Search button on one line.
 * Searches like the Console hero: keywords go to the search page as a query parameter.
 *
 * The button is a plain <button>, not the template's Button: that one is disabled until the page
 * hydrates, so it rendered gray first and then turned black. Before hydration the form submits
 * as a GET to the search page, which gives the same URL; keywords are not sensitive.
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
  const placeholder = intl.formatMessage({
    id: 'PageBuilder.SearchCTA.keywordFilterPlaceholderDJ',
  });

  const searchPath = createResourceLocatorString('SearchPage', routeConfiguration, {}, {});

  const onSubmit = values => {
    const queryParams = values.keywords ? { keywords: values.keywords } : {};
    history.push(createResourceLocatorString('SearchPage', routeConfiguration, {}, queryParams));
  };

  return (
    <FinalForm
      onSubmit={onSubmit}
      render={({ handleSubmit }) => (
        <Form
          role="search"
          className={classNames(css.root, className)}
          method="get"
          action={searchPath}
          onSubmit={handleSubmit}
        >
          <FieldTextInput
            rootClassName={css.field}
            inputRootClass={css.input}
            name="keywords"
            type="text"
            placeholder={placeholder}
            aria-label={placeholder}
          />
          <button type="submit" className={classNames(buttonCss.primary, css.button)}>
            <FormattedMessage id="PageBuilder.SearchCTA.buttonLabel" />
          </button>
        </Form>
      )}
    />
  );
};

export default HeroSearch;
