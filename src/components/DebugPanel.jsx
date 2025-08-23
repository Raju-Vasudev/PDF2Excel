import { useState } from 'react';
import { AlertTriangle, Info, FileText, Table, Download } from 'lucide-react';

const DebugPanel = ({ 
  currentFile, 
  processingStatus, 
  error, 
  metadata, 
  extractedData, 
  analysis 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!currentFile) return null;

  return (
    <div className="card">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-warning-600" />
          <h3 className="text-lg font-medium text-gray-900">Debug Information</h3>
        </div>
        <span className="text-sm text-gray-500">
          {isOpen ? 'Hide' : 'Show'} Details
        </span>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-slide-up">
          {/* File Information */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">File Information</h4>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Name:</strong> {currentFile.name}</p>
              <p><strong>Size:</strong> {(currentFile.size / 1024).toFixed(2)} KB</p>
              <p><strong>Type:</strong> {currentFile.type}</p>
              <p><strong>Last Modified:</strong> {new Date(currentFile.lastModified).toLocaleString()}</p>
            </div>
          </div>

          {/* Processing Status */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">Processing Status</h4>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Status:</strong> <span className={`font-medium ${
                processingStatus === 'completed' ? 'text-success-600' :
                processingStatus === 'error' ? 'text-error-600' :
                processingStatus === 'processing' ? 'text-primary-600' :
                'text-gray-600'
              }`}>{processingStatus}</span></p>
              {metadata && (
                <>
                  <p><strong>Pages:</strong> {metadata.pageCount}</p>
                  <p><strong>Title:</strong> {metadata.title}</p>
                </>
              )}
            </div>
          </div>

          {/* Error Information */}
          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-error-600" />
                <h4 className="font-medium text-error-900">Error Details</h4>
              </div>
              <div className="text-sm text-error-700">
                <p className="font-medium">Error Message:</p>
                <p className="mt-1 bg-error-100 p-2 rounded text-xs font-mono break-all">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Data Information */}
          {extractedData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Table className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Extracted Data</h4>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Rows:</strong> {extractedData.length}</p>
                <p><strong>Columns:</strong> {extractedData[0] ? Object.keys(extractedData[0]).length : 0}</p>
                {analysis && analysis.length > 0 && (
                  <p><strong>Tables Detected:</strong> {analysis.length}</p>
                )}
              </div>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-warning-600" />
              <h4 className="font-medium text-warning-900">Troubleshooting Tips</h4>
            </div>
            <div className="text-sm text-warning-700 space-y-2">
              <p><strong>If no tables are detected:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Check if the PDF contains actual text (not just images)</li>
                <li>Try adjusting detection sensitivity in settings</li>
                <li>Ensure the PDF has proper table structure</li>
                <li>Check if tables have borders or clear column alignment</li>
              </ul>
              
              <p className="mt-3"><strong>If processing fails:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Ensure the PDF is not corrupted</li>
                <li>Try with a smaller PDF file</li>
                <li>Check if the PDF is password protected</li>
                <li>Verify the PDF contains readable text</li>
              </ul>
            </div>
          </div>

          {/* Sample Data Preview */}
          {extractedData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Download className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Sample Data</h4>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>First few rows:</strong></p>
                <div className="bg-white border rounded p-2 max-h-32 overflow-y-auto">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(extractedData.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
