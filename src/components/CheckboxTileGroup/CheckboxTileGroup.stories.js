import React, { useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import * as validators from '../../util/validators';

import CheckboxTileGroup from './CheckboxTileGroup';

// The deck setup group from RequestQuoteForm, with the same keys, label and required message.
const DECK_SETUP_OPTION_KEYS = [
  'cdj_2000',
  'cdj_3000',
  'vinyl_turntables',
  'pioneer_djm',
  'allen_heath',
  'other',
];

// Submits once after mount, when the field array is registered, so the required error shows.
const SubmitOnMount = ({ form }) => {
  useEffect(() => {
    const timeout = setTimeout(form.submit, 0);
    return () => clearTimeout(timeout);
  }, []);
  return null;
};

const DeckSetupForm = ({ initialDeckSetup = [], showError = false }) => {
  const intl = useIntl();
  const options = DECK_SETUP_OPTION_KEYS.map(key => ({
    key,
    label: <FormattedMessage id={`RequestQuoteForm.deckSetup.${key}`} />,
  }));

  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      initialValues={{ deckSetup: initialDeckSetup }}
      onSubmit={() => {}}
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit}>
          <CheckboxTileGroup
            id="deckSetup"
            name="deckSetup"
            label={intl.formatMessage({ id: 'RequestQuoteForm.deckSetupLabel' })}
            options={options}
            validate={validators.nonEmptyArray(
              intl.formatMessage({ id: 'RequestQuoteForm.deckSetupRequired' })
            )}
          />
          {showError ? <SubmitOnMount form={form} /> : null}
        </form>
      )}
    />
  );
};

export default {
  title: 'Components/CheckboxTileGroup',
  component: CheckboxTileGroup,
};

export const Empty = { render: () => <DeckSetupForm /> };

export const Selected = {
  render: () => <DeckSetupForm initialDeckSetup={['cdj_3000', 'pioneer_djm']} />,
};

export const Error = { render: () => <DeckSetupForm showError /> };
