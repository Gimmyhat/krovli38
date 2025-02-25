import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="container mx-auto px-6 text-center">
        <p>© {currentYear} РемонтКровли. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer; 