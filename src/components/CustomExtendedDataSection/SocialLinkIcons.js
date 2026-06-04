import React from 'react';

import soundCloudLogo from '../../assets/social/soundcloud-logo.png';

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
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
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

  return <img className={className} src={soundCloudLogo} alt="" aria-hidden="true" />;
};

export const IconSocialMediaResidentAdvisor = props => {
  const { className } = props;

  return (
    <svg
      className={className}
      width="22"
      height="16"
      viewBox="0 0 22 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <text
        x="11"
        y="11.5"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        RA
      </text>
    </svg>
  );
};
