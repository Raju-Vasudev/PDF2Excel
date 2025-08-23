import { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import DataPreview from './components/DataPreview';
import ExportOptions from './components/ExportOptions';
import SettingsPanel from './components/SettingsPanel';
import { usePdfProcessor } from './hooks/usePdfProcessor';
import { useExcelGenerator } from './hooks/useExcelGenerator';
import DebugPanel from './components/DebugPanel';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [processedTables, setProcessedTables] = useState([]);
  const [settings, setSettings] = useState({
    detectionSensitivity: 'medium',
    minTableSize: 3,
    detectBorderedTables: true,
    detectUnborderedTables: true,
    autoCleanData: true,
    mergeEmptyCells: false,
    textEncoding: 'utf-8'
  });

  // Custom hooks for PDF processing and Excel generation
  const {
    processingStatus,
    progress,
    currentStep,
    totalSteps,
    error,
    metadata,
    extractedData,
    analysis,
    processPDF,
    reset: resetProcessing,
    retry
  } = usePdfProcessor(settings);

  const {
    exportStatus,
    exportProgress,
    exportError,
    exportedFile,
    exportToExcel,
    downloadFile,
    resetExport,
    getExportStatusMessage
  } = useExcelGenerator();

  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    
    try {
      // Process the PDF using our custom hook
      const tables = await processPDF(file);
      setProcessedTables(tables);
      
      toast.success('PDF processed successfully!');
    } catch (error) {
      console.error('File processing error:', error);
      toast.error(error.message || 'Failed to process PDF');
    }
  };

  const handleDataEdit = useCallback((newData) => {
    // Update the processed tables with edited data
    if (processedTables.length > 0) {
      const updatedTables = processedTables.map(table => ({
        ...table,
        rows: newData
      }));
      setProcessedTables(updatedTables);
    }
  }, [processedTables]);

  const handleExport = useCallback(async (exportOptions) => {
    if (processedTables.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const fileName = currentFile ? currentFile.name.replace('.pdf', '') : 'extracted_data';
      const result = await exportToExcel(processedTables, {
        ...exportOptions,
        fileName
      });
      
      toast.success(`Exported as ${exportOptions.format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export file');
    }
  }, [processedTables, currentFile, exportToExcel]);

  const handleDownload = useCallback(() => {
    if (exportedFile) {
      downloadFile(exportedFile);
    } else if (processedTables.length > 0) {
      // Auto-export and download
      const fileName = currentFile ? currentFile.name.replace('.pdf', '') : 'extracted_data';
      exportToExcel(processedTables, { fileName }).then(() => {
        toast.success('File downloaded successfully');
      }).catch(error => {
        toast.error('Failed to download file');
      });
    }
  }, [exportedFile, processedTables, currentFile, downloadFile, exportToExcel]);

  const handleRetry = useCallback(() => {
    if (currentFile) {
      retry(currentFile);
    }
  }, [currentFile, retry]);

  const handleReset = useCallback(() => {
    setCurrentFile(null);
    setProcessedTables([]);
    resetProcessing();
    resetExport();
  }, [resetProcessing, resetExport]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Section */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload PDF Document
              </h2>
              <FileUpload 
                onFileSelect={handleFileSelect}
                isProcessing={processingStatus === 'processing'}
              />
            </div>

            {/* Processing Status */}
            {processingStatus !== 'idle' && (
              <ProcessingStatus
                status={processingStatus}
                progress={progress}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className="card">
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-error-800">Processing Error</h3>
                      <p className="text-sm text-error-700 mt-1">{error}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleRetry}
                      className="btn-error text-sm"
                    >
                      Retry Processing
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data Preview */}
            {extractedData.length > 0 && (
              <DataPreview
                data={extractedData}
                onDownload={handleDownload}
                onEdit={handleDataEdit}
              />
            )}

            {/* Debug Panel */}
            <DebugPanel
              currentFile={currentFile}
              processingStatus={processingStatus}
              error={error}
              metadata={metadata}
              extractedData={extractedData}
              analysis={analysis}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Options */}
            {extractedData.length > 0 && (
              <ExportOptions
                onExport={handleExport}
                isProcessing={processingStatus === 'processing' || exportStatus === 'exporting'}
              />
            )}

            {/* Settings Panel */}
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
            />

            {/* Reset Button */}
            {(currentFile || extractedData.length > 0) && (
              <div className="card">
                <button
                  onClick={handleReset}
                  className="w-full btn-secondary"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
