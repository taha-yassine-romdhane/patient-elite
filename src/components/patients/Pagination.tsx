import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-slate-600">
          <span>
            Affichage de {startIndex + 1} à {Math.min(endIndex, totalItems)} sur {totalItems} patients
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;