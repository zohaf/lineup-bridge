import React from 'react';
import { useConfiguration } from '../../context/configurationContext';

import Footer from './Footer';

const FooterComponent = () => {
  const { footer = {}, topbar } = useConfiguration();

  return (
    <Footer
      socialMediaLinks={footer.socialMediaLinks || []}
      linkLogoToExternalSite={topbar?.logoLink}
    />
  );
};

// NOTE: if you want to add dynamic data to FooterComponent,
//       you could just connect this FooterContainer to Redux Store
//
// const mapStateToProps = state => {
//   const { currentUser } = state.user;
//   return { currentUser };
// };
// const FooterContainer = compose(connect(mapStateToProps))(FooterComponent);
// export default FooterContainer;

export default FooterComponent;
