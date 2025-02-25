import React from 'react';
import Navigation from './Navigation';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <Navigation />
    </header>
  );
};

export default Header; 