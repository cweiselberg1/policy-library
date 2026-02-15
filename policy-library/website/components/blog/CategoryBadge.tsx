import React from 'react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const getCategoryColor = (cat: string): string => {
    const colors: Record<string, string> = {
      'compliance': 'bg-copper-100 text-copper-800',
      'security': 'bg-red-100 text-red-800',
      'privacy': 'bg-copper-100 text-copper-800',
      'hipaa': 'bg-green-100 text-green-800',
      'guide': 'bg-yellow-100 text-yellow-800',
      'regulation': 'bg-evergreen-100 text-evergreen-800',
    };

    const lowerCat = cat.toLowerCase();
    return colors[lowerCat] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)} ${className}`}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
