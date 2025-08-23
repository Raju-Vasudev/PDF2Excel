import { Clock, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const ProcessingStatus = ({ status, progress, currentStep, totalSteps }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Clock className="w-5 h-5 text-primary-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error-600" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-primary-600';
      case 'completed':
        return 'text-success-600';
      case 'error':
        return 'text-error-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing PDF document...';
      case 'completed':
        return 'PDF processed successfully!';
      case 'error':
        return 'Error processing PDF';
      default:
        return 'Ready to process';
    }
  };

  const getStepMessage = () => {
    if (!currentStep || !totalSteps) return '';
    
    const steps = [
      'Loading PDF document',
      'Extracting text content',
      'Detecting table structures',
      'Parsing tabular data',
      'Generating Excel file'
    ];
    
    return steps[currentStep - 1] || `Step ${currentStep} of ${totalSteps}`;
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon()}
        <div>
          <h3 className={`font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </h3>
          {currentStep && totalSteps && (
            <p className="text-sm text-gray-500">
              {getStepMessage()} ({currentStep}/{totalSteps})
            </p>
          )}
        </div>
      </div>

      {status === 'processing' && progress !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-3">
          <p className="text-sm text-success-700">
            Your PDF has been successfully converted to Excel format. 
            You can now download the file.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-3">
          <p className="text-sm text-error-700">
            There was an error processing your PDF. Please try again with a different file.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
