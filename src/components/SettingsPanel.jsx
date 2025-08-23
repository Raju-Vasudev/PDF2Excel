import { useState } from 'react';
import { Settings, Table, Sliders, Eye } from 'lucide-react';

const SettingsPanel = ({ settings, onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="card">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
        </div>
        <Eye className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-slide-up">
          {/* Table Detection Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Table className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">Table Detection</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detection Sensitivity
                </label>
                <select
                  value={settings.detectionSensitivity}
                  onChange={(e) => handleSettingChange('detectionSensitivity', e.target.value)}
                  className="input-field"
                >
                  <option value="low">Low - Only clear tables</option>
                  <option value="medium">Medium - Most tables</option>
                  <option value="high">High - All possible tables</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Table Size
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.minTableSize}
                    onChange={(e) => handleSettingChange('minTableSize', parseInt(e.target.value))}
                    className="input-field w-20"
                  />
                  <span className="text-sm text-gray-500">rows minimum</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Detect Bordered Tables
                  </label>
                  <p className="text-xs text-gray-500">
                    Look for tables with visible borders
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.detectBorderedTables}
                    onChange={(e) => handleSettingChange('detectBorderedTables', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Detect Unbordered Tables
                  </label>
                  <p className="text-xs text-gray-500">
                    Look for tables without visible borders
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.detectUnborderedTables}
                    onChange={(e) => handleSettingChange('detectUnborderedTables', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Processing Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Sliders className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">Data Processing</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Auto-clean Data
                  </label>
                  <p className="text-xs text-gray-500">
                    Remove extra spaces and normalize text
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoCleanData}
                    onChange={(e) => handleSettingChange('autoCleanData', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Merge Empty Cells
                  </label>
                  <p className="text-xs text-gray-500">
                    Combine adjacent empty cells
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.mergeEmptyCells}
                    onChange={(e) => handleSettingChange('mergeEmptyCells', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Encoding
                </label>
                <select
                  value={settings.textEncoding}
                  onChange={(e) => handleSettingChange('textEncoding', e.target.value)}
                  className="input-field"
                >
                  <option value="utf-8">UTF-8 (Recommended)</option>
                  <option value="latin1">Latin-1</option>
                  <option value="ascii">ASCII</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
