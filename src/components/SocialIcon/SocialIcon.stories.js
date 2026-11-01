import React from 'react';

import SocialIcon from './SocialIcon';

const PLATFORMS = [
  'facebook',
  'instagram',
  'linkedin',
  'pinterest',
  'resident-advisor',
  'tiktok',
  'twitter',
  'youtube',
];

export default {
  title: 'Components/SocialIcon',
  component: SocialIcon,
  argTypes: { platform: { control: 'select', options: PLATFORMS } },
};

export const Single = {
  args: { platform: 'instagram', ariaLabel: 'Instagram' },
};

export const AllPlatforms = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {PLATFORMS.map(platform => (
        <SocialIcon key={platform} platform={platform} ariaLabel={platform} />
      ))}
    </div>
  ),
};
