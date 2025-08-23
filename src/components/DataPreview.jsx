import { useState } from 'react';
import { Eye, Download, Edit3, Check, X } from 'lucide-react';

const DataPreview = ({ data, onDownload, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Preview</h3>
          <p className="text-gray-500">
            Upload a PDF file to see the extracted data here.
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData([...data]);
  };

  const handleSave = () => {
    setIsEditing(false);
    onEdit(editedData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(data);
  };

  const handleCellEdit = (rowIndex, colIndex, value) => {
    const newData = [...editedData];
    newData[rowIndex][colIndex] = value;
    setEditedData(newData);
  };

  const getTableHeaders = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key, index) => ({
      key,
      label: `Column ${index + 1}`,
      index
    }));
  };

  const headers = getTableHeaders();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
          <p className="text-sm text-gray-500">
            {data.length} rows, {headers.length} columns extracted
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={onDownload}
                className="btn-success flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="btn-success flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="btn-error flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {editedData.slice(0, 10).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row[header.key] || ''}
                        onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="truncate block max-w-xs">
                        {row[header.key] || ''}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing first 10 rows of {data.length} total rows
          </p>
        </div>
      )}
    </div>
  );
};

export default DataPreview;
