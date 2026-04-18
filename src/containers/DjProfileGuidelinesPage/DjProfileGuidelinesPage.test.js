import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { DjProfileGuidelinesPageComponent } from './DjProfileGuidelinesPage';

const { waitFor } = testingLibrary;

describe('DjProfileGuidelinesPage', () => {
  it('renders the Fallback page on error', async () => {
    const errorMessage = 'DjProfileGuidelinesPage failed';
    let e = new Error(errorMessage);
    e.type = 'error';
    e.name = 'Test';

    const { getByText } = render(
      <DjProfileGuidelinesPageComponent pageAssetsData={null} inProgress={false} error={e} />
    );

    await waitFor(() => {
      expect(getByText('DJ Profile Guidelines')).toBeInTheDocument();
      expect(getByText('Profile Basics')).toBeInTheDocument();
    });
  });
});
