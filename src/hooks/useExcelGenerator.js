import { useState, useCallback } from 'react';
import { exportData, validateExportOptions, getFileSize } from '../utils/excelUtils';

/**
 * Custom hook for Excel generation and export
 * @returns {Object} Export state and functions
 */
export const useExcelGenerator = () => {
  const [exportStatus, setExportStatus] = useState('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);
  const [exportedFile, setExportedFile] = useState(null);

  /**
   * Export data to Excel file
   * @param {Array} tables - Array of table objects
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export result
   */
  const exportToExcel = useCallback(async (tables, options = {}) => {
    try {
      setExportError(null);
      setExportStatus('exporting');
      setExportProgress(0);
      setExportedFile(null);

      // Validate options
      const validatedOptions = validateExportOptions(options);
      setExportProgress(20);

      // Generate file
      const result = exportData(tables, validatedOptions);
      setExportProgress(80);

      // Get file info
      const fileInfo = {
        name: result.fileName,
        size: getFileSize(result.blob),
        type: validatedOptions.format,
        blob: result.blob,
        downloadUrl: URL.createObjectURL(result.blob)
      };

      setExportedFile(fileInfo);
      setExportProgress(100);
      setExportStatus('completed');

      return fileInfo;

    } catch (err) {
      console.error('Export error:', err);
      setExportError(err.message);
      setExportStatus('error');
      throw err;
    }
  }, []);

  /**
   * Export data in multiple formats
   * @param {Array} tables - Array of table objects
   * @param {Array} formats - Array of formats to export
   * @param {Object} options - Export options
   * @returns {Promise<Array>} Array of exported files
   */
  const exportMultipleFormats = useCallback(async (tables, formats = ['xlsx'], options = {}) => {
    try {
      setExportError(null);
      setExportStatus('exporting');
      setExportProgress(0);
      setExportedFile(null);

      const exportedFiles = [];
      const progressPerFormat = 100 / formats.length;

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i];
        const formatOptions = { ...options, format };
        
        const result = await exportToExcel(tables, formatOptions);
        exportedFiles.push(result);
        
        setExportProgress((i + 1) * progressPerFormat);
      }

      setExportStatus('completed');
      return exportedFiles;

    } catch (err) {
      console.error('Multiple format export error:', err);
      setExportError(err.message);
      setExportStatus('error');
      throw err;
    }
  }, [exportToExcel]);

  /**
   * Download exported file
   * @param {Object} fileInfo - File information
   */
  const downloadFile = useCallback((fileInfo) => {
    if (fileInfo && fileInfo.blob) {
      const link = document.createElement('a');
      link.href = fileInfo.downloadUrl;
      link.download = fileInfo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  /**
   * Reset export state
   */
  const resetExport = useCallback(() => {
    setExportStatus('idle');
    setExportProgress(0);
    setExportError(null);
    setExportedFile(null);
  }, []);

  /**
   * Get export status message
   * @returns {string} Status message
   */
  const getExportStatusMessage = useCallback(() => {
    switch (exportStatus) {
      case 'idle':
        return 'Ready to export';
      case 'exporting':
        return 'Generating file...';
      case 'completed':
        return 'Export completed successfully';
      case 'error':
        return `Export failed: ${exportError}`;
      default:
        return 'Unknown status';
    }
  }, [exportStatus, exportError]);

  return {
    // State
    exportStatus,
    exportProgress,
    exportError,
    exportedFile,
    
    // Functions
    exportToExcel,
    exportMultipleFormats,
    downloadFile,
    resetExport,
    getExportStatusMessage
  };
};
