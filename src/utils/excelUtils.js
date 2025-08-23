import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { convertTableFormat } from './dataProcessing';

/**
 * Generate Excel file from table data
 * @param {Array} tables - Array of table objects
 * @param {Object} options - Export options
 * @returns {Blob} Excel file blob
 */
export const generateExcelFile = (tables, options = {}) => {
  const {
    includeHeaders = true,
    multipleSheets = true,
    fileName = 'extracted_data.xlsx'
  } = options;

  const workbook = XLSX.utils.book_new();

  if (multipleSheets && tables.length > 1) {
    // Create separate sheets for each table
    tables.forEach((table, index) => {
      const sheetName = `Table_${index + 1}`;
      const worksheet = createWorksheet(table, { includeHeaders });
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  } else {
    // Combine all tables into a single sheet
    const combinedData = combineTables(tables, { includeHeaders });
    const worksheet = XLSX.utils.aoa_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  }

  // Generate the Excel file
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array',
    compression: true
  });

  return new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
};

/**
 * Create a worksheet from table data
 * @param {Object} table - Table object
 * @param {Object} options - Worksheet options
 * @returns {Object} Worksheet object
 */
const createWorksheet = (table, options = {}) => {
  const { includeHeaders = true } = options;

  // Convert table to array format
  const dataArray = convertTableFormat(table, 'array');

  if (!includeHeaders && dataArray.length > 0) {
    // Remove headers if not included
    dataArray.shift();
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(dataArray);

  // Apply formatting
  applyWorksheetFormatting(worksheet, table);

  return worksheet;
};

/**
 * Apply formatting to worksheet
 * @param {Object} worksheet - Worksheet object
 * @param {Object} table - Table object
 */
const applyWorksheetFormatting = (worksheet, table) => {
  // Set column widths
  if (table.columns) {
    const columnWidths = table.columns.map(col => ({
      wch: Math.max(col.width / 10, 10) // Convert pixels to character width
    }));
    worksheet['!cols'] = columnWidths;
  }

  // Apply header styling if headers exist
  if (table.headers && worksheet['!ref']) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headerRow = range.s.r; // First row

    // Style header row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "CCCCCC" } },
          alignment: { horizontal: "center" }
        };
      }
    }
  }
};

/**
 * Combine multiple tables into a single array
 * @param {Array} tables - Array of table objects
 * @param {Object} options - Combine options
 * @returns {Array} Combined data array
 */
const combineTables = (tables, options = {}) => {
  const { includeHeaders = true } = options;
  const combinedData = [];

  tables.forEach((table, tableIndex) => {
    const tableData = convertTableFormat(table, 'array');

    // Add table separator if not the first table
    if (tableIndex > 0) {
      combinedData.push([]); // Empty row as separator
    }

    // Add table title
    combinedData.push([`Table ${tableIndex + 1}`]);
    combinedData.push([]); // Empty row after title

    // Add table data
    if (includeHeaders) {
      combinedData.push(...tableData);
    } else {
      // Skip headers
      combinedData.push(...tableData.slice(1));
    }
  });

  return combinedData;
};

/**
 * Download Excel file
 * @param {Blob} blob - Excel file blob
 * @param {string} fileName - File name
 */
export const downloadExcelFile = (blob, fileName = 'extracted_data.xlsx') => {
  saveAs(blob, fileName);
};

/**
 * Generate CSV file from table data
 * @param {Array} tables - Array of table objects
 * @param {Object} options - Export options
 * @returns {Blob} CSV file blob
 */
export const generateCSVFile = (tables, options = {}) => {
  const { includeHeaders = true, multipleSheets = false } = options;

  let csvContent = '';

  if (multipleSheets && tables.length > 1) {
    // Create separate CSV sections for each table
    tables.forEach((table, index) => {
      csvContent += `Table ${index + 1}\n`;
      csvContent += convertTableFormat(table, 'csv');
      csvContent += '\n\n';
    });
  } else {
    // Combine all tables
    const combinedData = combineTables(tables, { includeHeaders });
    csvContent = combinedData.map(row => 
      row.map(cell => `"${cell || ''}"`).join(',')
    ).join('\n');
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Generate JSON file from table data
 * @param {Array} tables - Array of table objects
 * @param {Object} options - Export options
 * @returns {Blob} JSON file blob
 */
export const generateJSONFile = (tables, options = {}) => {
  const { includeHeaders = true, prettyPrint = true } = options;

  const jsonData = {
    metadata: {
      tableCount: tables.length,
      totalRows: tables.reduce((sum, table) => sum + table.rows.length, 0),
      exportDate: new Date().toISOString(),
      version: '1.0'
    },
    tables: tables.map((table, index) => ({
      id: `table_${index + 1}`,
      headers: table.headers || [],
      rows: table.rows,
      columns: table.columns || [],
      bounds: table.bounds || null
    }))
  };

  const jsonString = prettyPrint 
    ? JSON.stringify(jsonData, null, 2)
    : JSON.stringify(jsonData);

  return new Blob([jsonString], { type: 'application/json' });
};

/**
 * Export data in specified format
 * @param {Array} tables - Array of table objects
 * @param {Object} options - Export options
 * @returns {Blob} File blob
 */
export const exportData = (tables, options = {}) => {
  const {
    format = 'xlsx',
    fileName = 'extracted_data',
    includeHeaders = true,
    multipleSheets = true,
    prettyPrint = true
  } = options;

  let blob;
  let extension;

  switch (format.toLowerCase()) {
    case 'xlsx':
      blob = generateExcelFile(tables, { includeHeaders, multipleSheets });
      extension = 'xlsx';
      break;
    case 'csv':
      blob = generateCSVFile(tables, { includeHeaders, multipleSheets });
      extension = 'csv';
      break;
    case 'json':
      blob = generateJSONFile(tables, { includeHeaders, prettyPrint });
      extension = 'json';
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  const fullFileName = `${fileName}.${extension}`;
  downloadExcelFile(blob, fullFileName);

  return { blob, fileName: fullFileName };
};

/**
 * Get file size in human readable format
 * @param {Blob} blob - File blob
 * @returns {string} Formatted file size
 */
export const getFileSize = (blob) => {
  const bytes = blob.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate export options
 * @param {Object} options - Export options
 * @returns {Object} Validated options
 */
export const validateExportOptions = (options = {}) => {
  const defaults = {
    format: 'xlsx',
    fileName: 'extracted_data',
    includeHeaders: true,
    multipleSheets: true,
    prettyPrint: true
  };

  return {
    ...defaults,
    ...options,
    format: options.format?.toLowerCase() || 'xlsx'
  };
};
