/**
 * Detect table structures in PDF text content
 * @param {Array} textItems - Array of text items with positioning data
 * @param {Object} settings - Detection settings
 * @returns {Array} Array of detected tables
 */
export const detectTables = (textItems, settings = {}) => {
  const {
    detectionSensitivity = 'medium',
    minTableSize = 3,
    detectBorderedTables = true,
    detectUnborderedTables = true
  } = settings;

  const tables = [];
  
  // Group text items by page
  const pages = groupTextByPage(textItems);
  
  pages.forEach((pageItems, pageNum) => {
    // Detect tables on each page
    const pageTables = detectTablesOnPage(pageItems, {
      detectionSensitivity,
      minTableSize,
      detectBorderedTables,
      detectUnborderedTables
    });
    
    pageTables.forEach(table => {
      table.page = pageNum;
      tables.push(table);
    });
  });
  
  return tables;
};

/**
 * Group text items by page
 * @param {Array} textItems - Array of text items
 * @returns {Map} Map of page number to text items
 */
const groupTextByPage = (textItems) => {
  const pages = new Map();
  
  textItems.forEach(item => {
    const page = item.page || 1;
    if (!pages.has(page)) {
      pages.set(page, []);
    }
    pages.get(page).push(item);
  });
  
  return pages;
};

/**
 * Detect tables on a single page
 * @param {Array} pageItems - Text items from a single page
 * @param {Object} settings - Detection settings
 * @returns {Array} Array of detected tables
 */
const detectTablesOnPage = (pageItems, settings) => {
  const tables = [];
  
  // Sort items by Y position (top to bottom)
  const sortedItems = pageItems.sort((a, b) => b.y - a.y);
  
  // Find potential table regions
  const tableRegions = findTableRegions(sortedItems, settings);
  
  tableRegions.forEach(region => {
    const table = extractTableFromRegion(region, settings);
    if (table && table.rows.length >= settings.minTableSize) {
      tables.push(table);
    }
  });
  
  return tables;
};

/**
 * Find potential table regions in text
 * @param {Array} textItems - Sorted text items
 * @param {Object} settings - Detection settings
 * @returns {Array} Array of table regions
 */
const findTableRegions = (textItems, settings) => {
  const regions = [];
  const { detectionSensitivity } = settings;
  
  // Group items by Y position (rows)
  const rows = groupItemsByRow(textItems);
  
  // Find consecutive rows that might form a table
  let currentRegion = [];
  
  rows.forEach((row, index) => {
    const isTableRow = isLikelyTableRow(row, detectionSensitivity);
    
    if (isTableRow) {
      currentRegion.push(row);
    } else {
      if (currentRegion.length > 0) {
        regions.push([...currentRegion]);
        currentRegion = [];
      }
    }
  });
  
  // Add the last region if it exists
  if (currentRegion.length > 0) {
    regions.push(currentRegion);
  }
  
  return regions;
};

/**
 * Group text items by row (similar Y positions)
 * @param {Array} textItems - Text items
 * @returns {Array} Array of rows
 */
const groupItemsByRow = (textItems) => {
  const rows = [];
  const tolerance = 5; // pixels
  
  textItems.forEach(item => {
    let addedToRow = false;
    
    for (const row of rows) {
      if (row.length > 0) {
        const firstItem = row[0];
        if (Math.abs(item.y - firstItem.y) <= tolerance) {
          row.push(item);
          addedToRow = true;
          break;
        }
      }
    }
    
    if (!addedToRow) {
      rows.push([item]);
    }
  });
  
  // Sort items in each row by X position (left to right)
  rows.forEach(row => {
    row.sort((a, b) => a.x - b.x);
  });
  
  return rows;
};

/**
 * Check if a row is likely to be part of a table
 * @param {Array} row - Text items in a row
 * @param {string} sensitivity - Detection sensitivity
 * @returns {boolean} True if likely table row
 */
const isLikelyTableRow = (row, sensitivity) => {
  if (row.length < 2) return false;
  
  const thresholds = {
    low: { minItems: 3, maxSpacing: 100 },
    medium: { minItems: 2, maxSpacing: 150 },
    high: { minItems: 2, maxSpacing: 200 }
  };
  
  const threshold = thresholds[sensitivity] || thresholds.medium;
  
  // Check if row has enough items
  if (row.length < threshold.minItems) return false;
  
  // Check spacing between items
  for (let i = 1; i < row.length; i++) {
    const spacing = row[i].x - (row[i-1].x + row[i-1].width);
    if (spacing > threshold.maxSpacing) return false;
  }
  
  // Check for consistent formatting (optional)
  const fontSizes = row.map(item => item.fontSize || 12);
  const avgFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;
  const fontSizeVariance = fontSizes.reduce((sum, size) => sum + Math.abs(size - avgFontSize), 0) / fontSizes.length;
  
  return fontSizeVariance < 2; // Low variance in font sizes
};

/**
 * Extract table data from a region
 * @param {Array} region - Table region (array of rows)
 * @param {Object} settings - Detection settings
 * @returns {Object} Table data
 */
const extractTableFromRegion = (region, settings) => {
  if (region.length === 0) return null;
  
  // Determine column structure
  const columns = determineColumns(region);
  
  // Extract data into table format
  const rows = region.map(row => {
    const tableRow = {};
    columns.forEach((column, index) => {
      const cellItems = row.filter(item => 
        item.x >= column.start && item.x <= column.end
      );
      tableRow[`column_${index}`] = cellItems
        .map(item => item.text || item.str || '')
        .join(' ')
        .trim();
    });
    return tableRow;
  });
  
  return {
    rows,
    columns: columns.map((col, index) => ({
      id: `column_${index}`,
      start: col.start,
      end: col.end,
      width: col.end - col.start
    })),
    bounds: calculateTableBounds(region)
  };
};

/**
 * Determine column structure from table region
 * @param {Array} region - Table region
 * @returns {Array} Array of column definitions
 */
const determineColumns = (region) => {
  // Collect all X positions
  const allXPositions = [];
  region.forEach(row => {
    row.forEach(item => {
      allXPositions.push(item.x);
      allXPositions.push(item.x + (item.width || 0));
    });
  });
  
  // Find common column boundaries
  const sortedPositions = [...new Set(allXPositions)].sort((a, b) => a - b);
  const columns = [];
  
  // Group nearby positions into columns
  const tolerance = 10;
  let currentColumn = { start: sortedPositions[0], end: sortedPositions[0] };
  
  for (let i = 1; i < sortedPositions.length; i++) {
    const pos = sortedPositions[i];
    
    if (pos - currentColumn.end <= tolerance) {
      currentColumn.end = pos;
    } else {
      if (currentColumn.end - currentColumn.start > tolerance) {
        columns.push({ ...currentColumn });
      }
      currentColumn = { start: pos, end: pos };
    }
  }
  
  // Add the last column
  if (currentColumn.end - currentColumn.start > tolerance) {
    columns.push(currentColumn);
  }
  
  return columns;
};

/**
 * Calculate table bounds
 * @param {Array} region - Table region
 * @returns {Object} Table bounds
 */
const calculateTableBounds = (region) => {
  if (region.length === 0) return null;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  region.forEach(row => {
    row.forEach(item => {
      minX = Math.min(minX, item.x);
      maxX = Math.max(maxX, item.x + (item.width || 0));
      minY = Math.min(minY, item.y);
      maxY = Math.max(maxY, item.y + (item.height || 0));
    });
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

/**
 * Clean and normalize table data
 * @param {Array} tables - Array of detected tables
 * @param {Object} settings - Processing settings
 * @returns {Array} Cleaned tables
 */
export const cleanTableData = (tables, settings = {}) => {
  const { autoCleanData = true, mergeEmptyCells = false } = settings;
  
  return tables.map(table => {
    const cleanedRows = table.rows.map(row => {
      const cleanedRow = {};
      
      Object.keys(row).forEach(key => {
        let value = row[key];
        
        if (autoCleanData) {
          // Remove extra whitespace
          value = value.replace(/\s+/g, ' ').trim();
          
          // Normalize common characters
          value = value.replace(/[–—]/g, '-'); // Normalize dashes
          value = value.replace(/[""]/g, '"'); // Normalize quotes
          value = value.replace(/['']/g, "'"); // Normalize apostrophes
        }
        
        cleanedRow[key] = value;
      });
      
      return cleanedRow;
    });
    
    // Merge empty cells if enabled
    if (mergeEmptyCells) {
      // Implementation for merging empty cells
      // This would combine adjacent empty cells
    }
    
    return {
      ...table,
      rows: cleanedRows
    };
  });
};
