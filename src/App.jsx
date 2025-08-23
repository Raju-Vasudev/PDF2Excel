import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import DataPreview from './components/DataPreview';
import ExportOptions from './components/ExportOptions';
import SettingsPanel from './components/SettingsPanel';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedData, setExtractedData] = useState([]);
  const [settings, setSettings] = useState({
    detectionSensitivity: 'medium',
    minTableSize: 3,
    detectBorderedTables: true,
    detectUnborderedTables: true,
    autoCleanData: true,
    mergeEmptyCells: false,
    textEncoding: 'utf-8'
  });

  const handleFileSelect = async (file) => {
    setCurrentFile(file);
    setProcessingStatus('processing');
    setProcessingProgress(0);
    setCurrentStep(1);
    setExtractedData([]);

    // Simulate processing for now (we'll implement actual PDF processing in Phase 2)
    try {
      // Simulate loading PDF
      await simulateProgress(20, 1000);
      setCurrentStep(2);
      
      // Simulate text extraction
      await simulateProgress(40, 1500);
      setCurrentStep(3);
      
      // Simulate table detection
      await simulateProgress(60, 2000);
      setCurrentStep(4);
      
      // Simulate data parsing
      await simulateProgress(80, 1500);
      setCurrentStep(5);
      
      // Simulate completion
      await simulateProgress(100, 500);
      
      // Generate sample data for preview
      const sampleData = generateSampleData();
      setExtractedData(sampleData);
      setProcessingStatus('completed');
    } catch (error) {
      setProcessingStatus('error');
      console.error('Processing error:', error);
    }
  };

  const simulateProgress = (targetProgress, duration) => {
    return new Promise((resolve) => {
      const startProgress = processingProgress;
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(
          startProgress + (elapsed / duration) * (targetProgress - startProgress),
          targetProgress
        );
        
        setProcessingProgress(progress);
        
        if (progress < targetProgress) {
          requestAnimationFrame(updateProgress);
        } else {
          resolve();
        }
      };
      
      updateProgress();
    });
  };

  const generateSampleData = () => {
    // Generate sample table data for demonstration
    const headers = ['Name', 'Age', 'Department', 'Salary', 'Start Date'];
    const sampleRows = [
      ['John Doe', '32', 'Engineering', '$75,000', '2020-01-15'],
      ['Jane Smith', '28', 'Marketing', '$65,000', '2019-03-20'],
      ['Mike Johnson', '35', 'Sales', '$80,000', '2018-07-10'],
      ['Sarah Wilson', '29', 'HR', '$60,000', '2021-02-28'],
      ['David Brown', '31', 'Engineering', '$78,000', '2020-11-05'],
      ['Lisa Davis', '27', 'Marketing', '$62,000', '2021-06-15'],
      ['Tom Miller', '33', 'Sales', '$85,000', '2019-09-12'],
      ['Emily Taylor', '26', 'HR', '$58,000', '2022-01-08'],
      ['Chris Anderson', '30', 'Engineering', '$76,000', '2020-08-22'],
      ['Amanda White', '34', 'Marketing', '$68,000', '2019-12-03']
    ];

    return sampleRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  };

  const handleDataEdit = (newData) => {
    setExtractedData(newData);
  };

  const handleExport = (exportOptions) => {
    // We'll implement actual export functionality in Phase 3
    console.log('Export options:', exportOptions);
    console.log('Data to export:', extractedData);
    
    // For now, just show a success message
    alert(`Exporting data as ${exportOptions.format.toUpperCase()}...`);
  };

  const handleDownload = () => {
    // We'll implement actual download functionality in Phase 3
    console.log('Downloading Excel file...');
    alert('Download functionality will be implemented in Phase 3');
  };

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
                progress={processingProgress}
                currentStep={currentStep}
                totalSteps={5}
              />
            )}

            {/* Data Preview */}
            {extractedData.length > 0 && (
              <DataPreview
                data={extractedData}
                onDownload={handleDownload}
                onEdit={handleDataEdit}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Options */}
            {extractedData.length > 0 && (
              <ExportOptions
                onExport={handleExport}
                isProcessing={processingStatus === 'processing'}
              />
            )}

            {/* Settings Panel */}
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
