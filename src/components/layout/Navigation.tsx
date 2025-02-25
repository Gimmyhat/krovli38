import React from 'react';
import { Phone, Building2 } from 'lucide-react';
import { NAV_ITEMS, CONTACT_INFO } from '../../constants/navigation';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold">РемонтКровли</span>
          </div>
          <div className="flex items-center space-x-8 text-white">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className="hover:text-gray-300"
              >
                {item.label}
              </a>
            ))}
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>{CONTACT_INFO.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 