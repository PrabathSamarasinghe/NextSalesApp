export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) {
    // Function to determine which page numbers to render
    const getPageNumbers = () => {
      const pageNumbers = [];
      
      if (totalPages <= 7) {
        // If 7 or fewer pages, show all pages
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Always show first page
        pageNumbers.push(1);
        
        if (currentPage <= 3) {
          // Near the beginning
          pageNumbers.push(2, 3, 4, -1, totalPages);
        } else if (currentPage >= totalPages - 2) {
          // Near the end
          pageNumbers.push(-1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          // In the middle
          pageNumbers.push(-1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
        }
      }
      
      return pageNumbers;
    };
  
    if (totalPages <= 1) return null; // Don't show pagination for single page
  
    return (
      <div className="flex items-center justify-center">
        <nav className="flex items-center gap-1" aria-label="Pagination">
          {/* Previous button */}
          <button
            className="group relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Page numbers */}
          {getPageNumbers().map((pageNumber, index) => (
            pageNumber === -1 ? (
              // Ellipsis
              <span 
                key={`ellipsis-${index}`} 
                className="px-3 py-2 text-gray-500 font-medium select-none"
                aria-hidden="true"
              >
                ···
              </span>
            ) : (
              // Page number button
              <button
                key={`page-${pageNumber}`}
                className={`min-w-[40px] px-3 py-2 rounded-lg border font-medium transition-all duration-200 shadow-sm ${
                  currentPage === pageNumber 
                    ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg scale-105" 
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-md hover:scale-105"
                }`}
                onClick={() => onPageChange(pageNumber)}
                aria-current={currentPage === pageNumber ? "page" : undefined}
                aria-label={`${currentPage === pageNumber ? "Current page, " : ""}Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            )
          ))}
          
          {/* Next button */}
          <button
            className="group relative inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    );
  }