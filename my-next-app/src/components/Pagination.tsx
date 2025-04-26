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
      
      // Always show first page
      pageNumbers.push(1);
      
      // Current page and surrounding pages
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pageNumbers.push(i);
      }
      
      // Always show last page if there are more than 1 page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
      
      // Add ellipses where needed
      const result = [];
      let prev = 0;
      
      for (const num of pageNumbers) {
        if (num - prev > 1) {
          result.push(-1); // -1 represents ellipsis
        }
        result.push(num);
        prev = num;
      }
      
      return result;
    };
  
    return (
      <div className="flex items-center justify-center">
        <nav className="flex items-center space-x-1">
          {/* Previous button */}
          <button
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Page numbers */}
          {getPageNumbers().map((pageNumber, index) => (
            pageNumber === -1 ? (
              // Ellipsis
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-700">
                ...
              </span>
            ) : (
              // Page number button
              <button
                key={`page-${pageNumber}`}
                className={`px-3 py-2 rounded-md border ${
                  currentPage === pageNumber 
                    ? "border-blue-600 bg-blue-50 text-blue-600" 
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => onPageChange(pageNumber)}
                aria-current={currentPage === pageNumber ? "page" : undefined}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            )
          ))}
          
          {/* Next button */}
          <button
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    );
  }