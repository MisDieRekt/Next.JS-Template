import React from 'react';

interface SearchBoxProps {
  searchTerm: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ searchTerm, handleSearchChange }) => {
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Search..."
      className="p-2 border rounded"
    />
  );
};

export default SearchBox;
