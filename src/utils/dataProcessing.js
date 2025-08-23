import _ from 'lodash';

/**
 * Process and clean extracted table data
 * @param {Array} tables - Array of detected tables
 * @param {Object} settings - Processing settings
 * @returns {Array} Processed tables
 */
export const processTableData = (tables, settings = {}) => {
  const {
    autoCleanData = true,
    mergeEmptyCells = false,
    textEncoding = 'utf-8'
  } = settings;

  return tables.map(table => {
    let processedTable = { ...table };
    
    if (autoCleanData) {
      processedTable = cleanTableData(processedTable);
    }
    
    if (mergeEmptyCells) {
      processedTable = mergeEmptyCellsInTable(processedTable);
    }
    
    // Validate table structure
    processedTable = validateTableStructure(processedTable);
    
    // Generate headers if missing
    processedTable = generateHeaders(processedTable);
    
    return processedTable;
  });
};

/**
 * Clean individual table data
 * @param {Object} table - Table object
 * @returns {Object} Cleaned table
 */
const cleanTableData = (table) => {
  const cleanedRows = table.rows.map(row => {
    const cleanedRow = {};
    
    Object.keys(row).forEach(key => {
      let value = row[key];
      
      if (typeof value === 'string') {
        // Remove extra whitespace
        value = value.replace(/\s+/g, ' ').trim();
        
        // Normalize common characters
        value = value.replace(/[–—]/g, '-'); // Normalize dashes
        value = value.replace(/[""]/g, '"'); // Normalize quotes
        value = value.replace(/['']/g, "'"); // Normalize apostrophes
        value = value.replace(/…/g, '...'); // Normalize ellipsis
        value = value.replace(/×/g, 'x'); // Normalize multiplication sign
        
        // Remove control characters
        value = value.replace(/[\x00-\x1F\x7F]/g, '');
      }
      
      cleanedRow[key] = value;
    });
    
    return cleanedRow;
  });
  
  return {
    ...table,
    rows: cleanedRows
  };
};

/**
 * Merge empty cells in a table
 * @param {Object} table - Table object
 * @returns {Object} Table with merged empty cells
 */
const mergeEmptyCellsInTable = (table) => {
  const mergedRows = [];
  
  table.rows.forEach(row => {
    const mergedRow = {};
    let currentKey = null;
    let currentValue = '';
    
    Object.keys(row).forEach(key => {
      const value = row[key];
      
      if (!value || value.trim() === '') {
        // Empty cell - merge with previous
        if (currentKey) {
          currentValue += ' ';
        }
      } else {
        // Non-empty cell
        if (currentKey) {
          mergedRow[currentKey] = currentValue.trim();
        }
        currentKey = key;
        currentValue = value;
      }
    });
    
    // Add the last cell
    if (currentKey) {
      mergedRow[currentKey] = currentValue.trim();
    }
    
    mergedRows.push(mergedRow);
  });
  
  return {
    ...table,
    rows: mergedRows
  };
};

/**
 * Validate table structure
 * @param {Object} table - Table object
 * @returns {Object} Validated table
 */
const validateTableStructure = (table) => {
  if (!table.rows || table.rows.length === 0) {
    return table;
  }
  
  // Find the maximum number of columns
  const maxColumns = Math.max(...table.rows.map(row => Object.keys(row).length));
  
  // Ensure all rows have the same number of columns
  const normalizedRows = table.rows.map(row => {
    const normalizedRow = {};
    
    // Fill missing columns with empty values
    for (let i = 0; i < maxColumns; i++) {
      const key = `column_${i}`;
      normalizedRow[key] = row[key] || '';
    }
    
    return normalizedRow;
  });
  
  return {
    ...table,
    rows: normalizedRows
  };
};

/**
 * Generate headers for table columns
 * @param {Object} table - Table object
 * @returns {Object} Table with generated headers
 */
const generateHeaders = (table) => {
  if (!table.rows || table.rows.length === 0) {
    return table;
  }
  
  const firstRow = table.rows[0];
  const columnKeys = Object.keys(firstRow);
  
  // Check if first row looks like headers
  const isFirstRowHeaders = checkIfHeaders(firstRow);
  
  if (isFirstRowHeaders) {
    // Use first row as headers
    const headers = columnKeys.map(key => firstRow[key]);
    const dataRows = table.rows.slice(1);
    
    // Convert data rows to use header names
    const processedRows = dataRows.map(row => {
      const processedRow = {};
      columnKeys.forEach((key, index) => {
        processedRow[headers[index]] = row[key];
      });
      return processedRow;
    });
    
    return {
      ...table,
      headers,
      rows: processedRows
    };
  } else {
    // Generate generic headers
    const headers = columnKeys.map((_, index) => `Column ${index + 1}`);
    
    return {
      ...table,
      headers,
      rows: table.rows
    };
  }
};

/**
 * Check if a row contains header-like data
 * @param {Object} row - Table row
 * @returns {boolean} True if row looks like headers
 */
const checkIfHeaders = (row) => {
  const values = Object.values(row);
  
  // Check if all values are strings
  const allStrings = values.every(value => typeof value === 'string');
  if (!allStrings) return false;
  
  // Check if values are short (typical for headers)
  const avgLength = values.reduce((sum, value) => sum + value.length, 0) / values.length;
  if (avgLength > 20) return false;
  
  // Check if values contain common header words
  const headerWords = ['name', 'id', 'date', 'time', 'amount', 'price', 'total', 'description', 'type', 'status'];
  const hasHeaderWords = values.some(value => 
    headerWords.some(word => value.toLowerCase().includes(word))
  );
  
  return hasHeaderWords;
};

/**
 * Convert table data to different formats
 * @param {Object} table - Table object
 * @param {string} format - Output format ('array', 'object', 'csv')
 * @returns {*} Data in specified format
 */
export const convertTableFormat = (table, format = 'array') => {
  switch (format) {
    case 'array':
      return convertToArray(table);
    case 'object':
      return convertToObject(table);
    case 'csv':
      return convertToCSV(table);
    default:
      return table.rows;
  }
};

/**
 * Convert table to array format
 * @param {Object} table - Table object
 * @returns {Array} Array of arrays
 */
const convertToArray = (table) => {
  if (!table.rows || table.rows.length === 0) {
    return [];
  }
  
  const result = [];
  
  // Add headers if available
  if (table.headers) {
    result.push(table.headers);
  }
  
  // Add data rows
  table.rows.forEach(row => {
    const rowArray = Object.values(row);
    result.push(rowArray);
  });
  
  return result;
};

/**
 * Convert table to object format
 * @param {Object} table - Table object
 * @returns {Array} Array of objects
 */
const convertToObject = (table) => {
  return table.rows || [];
};

/**
 * Convert table to CSV format
 * @param {Object} table - Table object
 * @returns {string} CSV string
 */
const convertToCSV = (table) => {
  if (!table.rows || table.rows.length === 0) {
    return '';
  }
  
  const headers = table.headers || Object.keys(table.rows[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.map(header => `"${header}"`).join(','));
  
  // Add data rows
  table.rows.forEach(row => {
    const csvRow = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    csvRows.push(csvRow.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Analyze table data for patterns and statistics
 * @param {Object} table - Table object
 * @returns {Object} Analysis results
 */
export const analyzeTableData = (table) => {
  if (!table.rows || table.rows.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      dataTypes: {},
      statistics: {}
    };
  }
  
  const rowCount = table.rows.length;
  const columnCount = Object.keys(table.rows[0]).length;
  const dataTypes = {};
  const statistics = {};
  
  // Analyze each column
  Object.keys(table.rows[0]).forEach(columnKey => {
    const values = table.rows.map(row => row[columnKey]);
    const nonEmptyValues = values.filter(value => value !== null && value !== undefined && value !== '');
    
    // Determine data type
    dataTypes[columnKey] = determineDataType(nonEmptyValues);
    
    // Calculate statistics based on data type
    statistics[columnKey] = calculateColumnStatistics(nonEmptyValues, dataTypes[columnKey]);
  });
  
  return {
    rowCount,
    columnCount,
    dataTypes,
    statistics
  };
};

/**
 * Determine the data type of a column
 * @param {Array} values - Column values
 * @returns {string} Data type ('string', 'number', 'date', 'boolean')
 */
const determineDataType = (values) => {
  if (values.length === 0) return 'string';
  
  const sampleSize = Math.min(values.length, 100);
  const sample = values.slice(0, sampleSize);
  
  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;
  
  sample.forEach(value => {
    const strValue = value.toString().trim();
    
    // Check for numbers
    if (!isNaN(strValue) && strValue !== '') {
      numberCount++;
    }
    
    // Check for dates
    if (isValidDate(strValue)) {
      dateCount++;
    }
    
    // Check for booleans
    if (['true', 'false', 'yes', 'no', '1', '0'].includes(strValue.toLowerCase())) {
      booleanCount++;
    }
  });
  
  const threshold = sampleSize * 0.7; // 70% threshold
  
  if (dateCount >= threshold) return 'date';
  if (numberCount >= threshold) return 'number';
  if (booleanCount >= threshold) return 'boolean';
  
  return 'string';
};

/**
 * Check if a string is a valid date
 * @param {string} str - String to check
 * @returns {boolean} True if valid date
 */
const isValidDate = (str) => {
  const date = new Date(str);
  return date instanceof Date && !isNaN(date) && str.length > 0;
};

/**
 * Calculate statistics for a column
 * @param {Array} values - Column values
 * @param {string} dataType - Data type
 * @returns {Object} Statistics
 */
const calculateColumnStatistics = (values, dataType) => {
  const stats = {
    count: values.length,
    uniqueCount: _.uniq(values).length,
    emptyCount: values.filter(v => v === null || v === undefined || v === '').length
  };
  
  switch (dataType) {
    case 'number':
      const numbers = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
      if (numbers.length > 0) {
        stats.min = Math.min(...numbers);
        stats.max = Math.max(...numbers);
        stats.average = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        stats.sum = numbers.reduce((a, b) => a + b, 0);
      }
      break;
      
    case 'date':
      const dates = values.map(v => new Date(v)).filter(d => !isNaN(d));
      if (dates.length > 0) {
        stats.min = new Date(Math.min(...dates));
        stats.max = new Date(Math.max(...dates));
      }
      break;
      
    case 'string':
      const lengths = values.map(v => v.toString().length);
      if (lengths.length > 0) {
        stats.avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        stats.maxLength = Math.max(...lengths);
        stats.minLength = Math.min(...lengths);
      }
      break;
  }
  
  return stats;
};
