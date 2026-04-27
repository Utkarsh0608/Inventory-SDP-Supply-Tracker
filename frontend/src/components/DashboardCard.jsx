import React from 'react';

const DashboardCard = ({ title, value, icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-transform duration-200 hover:scale-105 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md"
    >
      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </button>
  );
};

export default DashboardCard;
