import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CatalogFilters {
  search: string;
  genre: string;
  language: string;
  year: string;
  minRating: number;
  sort: string;
  currentPage: number;
  viewMode: 'grid' | 'list';
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  search: '',
  genre: 'all',
  language: 'all',
  year: 'all',
  minRating: 0,
  sort: 'popular',
  currentPage: 1,
  viewMode: 'grid',
};

interface CatalogContextType {
  filters: CatalogFilters;
  search: string;
  genre: string;
  language: string;
  year: string;
  minRating: number;
  sort: string;
  currentPage: number;
  viewMode: 'grid' | 'list';
  catalogScrollY: number;
  setSearch: (search: string) => void;
  setGenre: (genre: string) => void;
  setLanguage: (language: string) => void;
  setYear: (year: string) => void;
  setMinRating: (rating: number) => void;
  setSort: (sort: string) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setCatalogScrollY: (scrollY: number) => void;
  updateFilters: (partial: Partial<CatalogFilters>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const [catalogScrollY, setCatalogScrollY] = useState<number>(0);

  const setSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, currentPage: 1 }));
  };

  const setGenre = (genre: string) => {
    setFilters((prev) => ({ ...prev, genre, currentPage: 1 }));
  };

  const setLanguage = (language: string) => {
    setFilters((prev) => ({ ...prev, language, currentPage: 1 }));
  };

  const setYear = (year: string) => {
    setFilters((prev) => ({ ...prev, year, currentPage: 1 }));
  };

  const setMinRating = (minRating: number) => {
    setFilters((prev) => ({ ...prev, minRating, currentPage: 1 }));
  };

  const setSort = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort, currentPage: 1 }));
  };

  const setCurrentPage = (pageOrFn: number | ((prev: number) => number)) => {
    setFilters((prev) => {
      const newPage = typeof pageOrFn === 'function' ? pageOrFn(prev.currentPage) : pageOrFn;
      return { ...prev, currentPage: newPage };
    });
  };

  const setViewMode = (viewMode: 'grid' | 'list') => {
    setFilters((prev) => ({ ...prev, viewMode }));
  };

  const updateFilters = (partial: Partial<CatalogFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
      currentPage: partial.currentPage !== undefined ? partial.currentPage : (
        // Reset to page 1 only if search, genre, language, year, minRating, or sort changed
        (partial.search !== undefined ||
         partial.genre !== undefined ||
         partial.language !== undefined ||
         partial.year !== undefined ||
         partial.minRating !== undefined ||
         partial.sort !== undefined)
          ? 1
          : prev.currentPage
      ),
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_CATALOG_FILTERS);
    setCatalogScrollY(0);
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.genre !== 'all' ||
    filters.language !== 'all' ||
    filters.year !== 'all' ||
    filters.minRating > 0 ||
    filters.sort !== 'popular';

  return (
    <CatalogContext.Provider
      value={{
        filters,
        search: filters.search,
        genre: filters.genre,
        language: filters.language,
        year: filters.year,
        minRating: filters.minRating,
        sort: filters.sort,
        currentPage: filters.currentPage,
        viewMode: filters.viewMode,
        catalogScrollY,
        setSearch,
        setGenre,
        setLanguage,
        setYear,
        setMinRating,
        setSort,
        setCurrentPage,
        setViewMode,
        setCatalogScrollY,
        updateFilters,
        resetFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
