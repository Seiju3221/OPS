import React, { memo } from 'react';
import { Search } from 'lucide-react';

const SearchBar = memo(({ search, setSearch, handleSearch }) => {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
      <button
        onClick={handleSearch}
        className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;