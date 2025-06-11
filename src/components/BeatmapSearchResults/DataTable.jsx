'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import './dataTable.scss';

/**
 * Zaawansowana tabela danych wykorzystująca TanStack Table
 * Obsługuje sortowanie, filtrowanie, paginację i niestandardowe renderowanie komórek
 */
export default function DataTable({
  data = [],
  columns = [],
  initialSortBy = [],
  pagination = true,
  pageSize = 10,
  pageSizes = [5, 10, 20, 50],
  className = '',
  striped = true,
  bordered = true,
}) {
  const [sorting, setSorting] = useState(initialSortBy);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination_, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  // Inicjalizacja tabeli
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: pagination_,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
  });

  // Obliczanie klas CSS dla tabeli
  const tableClasses = useMemo(() => {
    const classes = ['tanstack-data-table'];
    if (striped) classes.push('table-striped');
    if (bordered) classes.push('table-bordered');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [striped, bordered, className]);

  return (
    <div className="data-table-container">
      {/* Wyszukiwanie globalne */}
      <div className="data-table-controls">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Wyszukaj..."
          className="data-table-search"
        />
      </div>

      {/* Tabela */}
      <div className="data-table-wrapper">
        <table className={tableClasses}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    colSpan={header.colSpan}
                    className={header.column.getCanSort() ? 'sortable-column' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="th-content">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {/* Ikona sortowania */}
                      {header.column.getCanSort() && (
                        <span className="sort-icon">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp size={16} />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown size={16} />
                          ) : (
                            <span className="sort-indicator">⇅</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-table-message">
                  Brak danych do wyświetlenia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacja */}
      {pagination && table.getPageCount() > 0 && (
        <div className="data-table-pagination">
          <div className="pagination-controls">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="pagination-button"
              aria-label="Pierwsza strona"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="pagination-button"
              aria-label="Poprzednia strona"
            >
              <ChevronLeft size={18} />
            </button>
            
            <span className="pagination-info">
              Strona{' '}
              <strong>
                {table.getState().pagination.pageIndex + 1} z {table.getPageCount()}
              </strong>
            </span>
            
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="pagination-button"
              aria-label="Następna strona"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="pagination-button"
              aria-label="Ostatnia strona"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
          
          {/* Wybór rozmiaru strony */}
          <div className="page-size-selector">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="page-size-select"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  Pokaż {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
