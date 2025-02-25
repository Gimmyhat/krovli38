import React from 'react';
import { CheckCircle } from 'lucide-react';
import { WORK_ITEMS } from '../../constants/works';
import { WorkItem } from '../../types/common';

interface SectionProps {
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

interface WorkCardProps {
  work: WorkItem;
}

const WorkCard: React.FC<WorkCardProps> = ({ work }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <div className="flex items-center mb-4">
      {work.icon}
      <h3 className="text-xl font-semibold ml-3">{work.title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{work.description}</p>
    <ul className="space-y-2">
      {work.details.map((detail, i) => (
        <li key={i} className="flex items-center text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          {detail}
        </li>
      ))}
    </ul>
  </div>
);

const WorkTypes: React.FC<SectionProps> = ({ className = '', children, ...props }) => {
  return (
    <section id="types" className={`py-20 bg-gray-50 ${className}`} {...props}>
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Виды выполняемых работ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WORK_ITEMS.map((work, index) => (
            <WorkCard key={index} work={work} />
          ))}
        </div>
        {children}
      </div>
    </section>
  );
};

export default WorkTypes; 