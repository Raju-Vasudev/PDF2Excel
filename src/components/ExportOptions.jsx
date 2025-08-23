import { useState } from 'react';
import { Download, Settings, FileSpreadsheet, FileText, Database } from 'lucide-react';

const ExportOptions = ({ onExport, isProcessing = false }) => {
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [multipleSheets, setMultipleSheets] = useState(true);

  const formatOptions = [
    {
      value: 'xlsx',
      label: 'Excel (.xlsx)',
      icon: FileSpreadsheet,
      description: 'Best for data analysis and sharing'
    },
    {
      value: 'csv',
      label: 'CSV (.csv)',
      icon: FileText,
      description: 'Simple text format, widely compatible'
    },
    {
      value: 'json',
      label: 'JSON (.json)',
      icon: Database,
      description: 'Structured data format for developers'
    }
  ];

  const handleExport = () => {
    onExport({
      format: exportFormat,
      includeHeaders,
      multipleSheets
    });
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Export Options</h3>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    exportFormat === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={option.value}
                    checked={exportFormat === option.value}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${
                      exportFormat === option.value ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        exportFormat === option.value ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Include Headers
              </label>
              <p className="text-xs text-gray-500">
                Add column headers to the exported file
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {exportFormat === 'xlsx' && (
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Multiple Sheets
                </label>
                <p className="text-xs text-gray-500">
                  Create separate sheets for different tables
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={multipleSheets}
                  onChange={(e) => setMultipleSheets(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isProcessing}
          className="w-full btn-success flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>
            {isProcessing ? 'Processing...' : `Export as ${exportFormat.toUpperCase()}`}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ExportOptions;
