import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const FileUpload = ({ onFileSelect, isProcessing = false }) => {
  const [uploadStatus, setUploadStatus] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a valid PDF file (max 10MB)'
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadStatus({
        type: 'success',
        message: `File "${file.name}" uploaded successfully`
      });
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isProcessing
  });

  const getDropzoneClasses = () => {
    let classes = 'dropzone';
    if (isDragActive && !isDragReject) {
      classes += ' dropzone-active';
    } else if (isDragReject) {
      classes += ' dropzone-reject';
    }
    if (isProcessing) {
      classes += ' opacity-50 cursor-not-allowed';
    }
    return classes;
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={getDropzoneClasses()}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-8 h-8 text-primary-600" />
            )}
          </div>
          
          <div className="text-center">
            {isProcessing ? (
              <p className="text-lg font-medium text-gray-900">Processing PDF...</p>
            ) : isDragActive ? (
              <p className="text-lg font-medium text-primary-600">Drop the PDF here</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900">
                  Drag & drop your PDF file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Supports PDF files up to 10MB</span>
          </div>
        </div>
      </div>

      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
          uploadStatus.type === 'success' 
            ? 'bg-success-50 text-success-700 border border-success-200' 
            : 'bg-error-50 text-error-700 border border-error-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
