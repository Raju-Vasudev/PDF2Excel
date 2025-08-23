import { useState, useCallback } from 'react';
import { extractTextWithStyling, getPDFMetadata, isValidPDF } from '../utils/pdfUtils';
import { detectTables, cleanTableData } from '../utils/tableDetection';
import { processTableData, analyzeTableData } from '../utils/dataProcessing';

/**
 * Custom hook for PDF processing
 * @param {Object} settings - Processing settings
 * @returns {Object} Processing state and functions
 */
export const usePdfProcessor = (settings = {}) => {
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [extractedData, setExtractedData] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const totalSteps = 5;

  /**
   * Process a PDF file
   * @param {File} file - PDF file to process
   * @returns {Promise<Array>} Processed table data
   */
  const processPDF = useCallback(async (file) => {
    try {
      setError(null);
      setProcessingStatus('processing');
      setProgress(0);
      setCurrentStep(1);
      setExtractedData([]);
      setAnalysis(null);

      // Step 1: Validate file
      if (!isValidPDF(file)) {
        throw new Error('Invalid PDF file');
      }

      // Step 2: Extract metadata
      setCurrentStep(2);
      setProgress(20);
      const fileMetadata = await getPDFMetadata(file);
      setMetadata(fileMetadata);

      // Step 3: Extract text with positioning
      setCurrentStep(3);
      setProgress(40);
      console.log('Starting text extraction...');
      const textItems = await extractTextWithStyling(file);
      console.log('Text extraction completed. Items found:', textItems.length);
      
      if (!textItems || textItems.length === 0) {
        throw new Error('No text content found in the PDF. The PDF might contain only images or be corrupted.');
      }

      // Step 4: Detect tables
      setCurrentStep(4);
      setProgress(60);
      const detectedTables = detectTables(textItems, settings);
      
      if (detectedTables.length === 0) {
        throw new Error('No tables detected in the PDF');
      }

      // Step 5: Process and clean data
      setCurrentStep(5);
      setProgress(80);
      const processedTables = processTableData(detectedTables, settings);
      const cleanedTables = cleanTableData(processedTables, settings);

      // Analyze the data
      const tableAnalysis = cleanedTables.map(table => analyzeTableData(table));
      setAnalysis(tableAnalysis);

      // Convert to flat array for display
      const flatData = cleanedTables.flatMap(table => table.rows);
      setExtractedData(flatData);

      setProgress(100);
      setProcessingStatus('completed');

      return cleanedTables;

    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err.message);
      setProcessingStatus('error');
      throw err;
    }
  }, [settings]);

  /**
   * Reset processing state
   */
  const reset = useCallback(() => {
    setProcessingStatus('idle');
    setProgress(0);
    setCurrentStep(0);
    setError(null);
    setMetadata(null);
    setExtractedData([]);
    setAnalysis(null);
  }, []);

  /**
   * Retry processing with the same file
   * @param {File} file - PDF file to retry
   */
  const retry = useCallback(async (file) => {
    if (file) {
      await processPDF(file);
    }
  }, [processPDF]);

  return {
    // State
    processingStatus,
    progress,
    currentStep,
    totalSteps,
    error,
    metadata,
    extractedData,
    analysis,
    
    // Functions
    processPDF,
    reset,
    retry
  };
};
