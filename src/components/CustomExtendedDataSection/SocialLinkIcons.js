import React from 'react';

import SocialIcon from '../SocialIcon/SocialIcon';

export const IconSocialMediaSpotify = props => {
  const { className } = props;

  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.5 6.4c2.25-.66 4.82-.45 7.02.67M5.02 8.45c1.86-.5 3.88-.35 5.72.52M5.5 10.35c1.42-.34 2.84-.24 4.2.35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const IconSocialMediaSoundCloud = props => {
  const { className } = props;

  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13 263v99M75 242v120M138 190v180M202 190v180M258 146A152 152 0 0 1 408 245L432 232A68 68 0 0 1 432 368H258"
        fill="none"
        stroke="currentColor"
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const IconSocialMediaResidentAdvisor = props => {
  const { className } = props;

  return <SocialIcon platform="resident-advisor" rootClassName={className} />;
};

export const IconSocialMediaWebsite = props => {
  const { className } = props;

  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M1.8 8h12.4M8 1.8c2 1.7 3.1 3.9 3.1 6.2S10 12.5 8 14.2M8 1.8C6 3.5 4.9 5.7 4.9 8s1.1 4.5 3.1 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
