import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { Form, PrimaryButton } from '../..';

import css from './NegotiationRequestQuoteForm.module.css';

const renderForm = formRenderProps => {
  const {
    formId,
    className,
    rootClassName,
    handleSubmit,
    payoutDetailsWarning,
    isOwnListing,
    finePrintComponent: FinePrint,
  } = formRenderProps;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <Form id={formId} onSubmit={handleSubmit} className={classes}>
      <div className={css.startBox}>
        <PrimaryButton type="submit">
          <FormattedMessage id="NegotiationRequestQuoteForm.nextCta" />
        </PrimaryButton>

        <FinePrint
          payoutDetailsWarning={payoutDetailsWarning}
          isOwnListing={isOwnListing}
          omitYouWontBeChargedMessage={true}
        />
      </div>
    </Form>
  );
};

/**
 * Simple form that redirects the user to the RequestQuotePage (offer builder).
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} props.formId - The ID of the form
 * @param {Function} props.onSubmit - The function to handle the form submission
 * @returns {JSX.Element}
 */
const NegotiationRequestQuoteForm = props => {
  const intl = useIntl();
  const initialValues = {};

  return <FinalForm initialValues={initialValues} {...props} intl={intl} render={renderForm} />;
};

export default NegotiationRequestQuoteForm;
