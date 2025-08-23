import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

/**
 * Extract text content from a PDF file
 * @param {File} file - The PDF file to process
 * @returns {Promise<Array>} Array of text content from each page
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const textContent = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      textContent.push({
        page: pageNum,
        text: pageText,
        items: textContent.items
      });
    }
    
    return textContent;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};

/**
 * Get detailed text positioning information from PDF
 * @param {File} file - The PDF file to process
 * @returns {Promise<Array>} Array of text items with positioning data
 */
export const getTextPositions = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const allTextItems = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Add page information to each text item
      const pageTextItems = textContent.items.map(item => ({
        ...item,
        page: pageNum,
        pageWidth: page.view[2],
        pageHeight: page.view[3]
      }));
      
      allTextItems.push(...pageTextItems);
    }
    
    return allTextItems;
  } catch (error) {
    console.error('Error getting text positions:', error);
    throw new Error('Failed to get text positioning data');
  }
};

/**
 * Extract text with font and styling information
 * @param {File} file - The PDF file to process
 * @returns {Promise<Array>} Array of text items with styling data
 */
export const extractTextWithStyling = async (file) => {
  try {
    console.log('PDF.js version:', pdfjsLib.version);
    console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    const styledText = [];
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      console.log(`Page ${pageNum} has ${textContent.items.length} text items`);
      
      const pageText = textContent.items.map(item => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
        fontName: item.fontName,
        fontSize: Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]),
        page: pageNum
      }));
      
      styledText.push(...pageText);
    }
    
    return styledText;
  } catch (error) {
    console.error('Error extracting styled text:', error);
    
    // Try fallback method
    try {
      console.log('Trying fallback text extraction method...');
      return await extractTextFromPDF(file);
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
};

/**
 * Validate if a file is a valid PDF
 * @param {File} file - The file to validate
 * @returns {boolean} True if valid PDF, false otherwise
 */
export const isValidPDF = (file) => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * Get PDF metadata
 * @param {File} file - The PDF file
 * @returns {Promise<Object>} PDF metadata
 */
export const getPDFMetadata = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const metadata = await pdf.getMetadata();
    const info = pdf.getInfo();
    
    return {
      title: info.Title || metadata?.info?.Title || 'Untitled',
      author: info.Author || metadata?.info?.Author || 'Unknown',
      subject: info.Subject || metadata?.info?.Subject || '',
      creator: info.Creator || metadata?.info?.Creator || '',
      producer: info.Producer || metadata?.info?.Producer || '',
      creationDate: info.CreationDate || metadata?.info?.CreationDate || '',
      modificationDate: info.ModDate || metadata?.info?.ModDate || '',
      pageCount: pdf.numPages,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    return {
      title: file.name,
      pageCount: 0,
      fileSize: file.size
    };
  }
};
