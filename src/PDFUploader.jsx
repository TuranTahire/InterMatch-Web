import { useState } from 'react';
import axios from 'axios';

function PDFUploader({ onFileUpload }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted!');
      return;
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size cannot exceed 10MB!');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      console.log('PDF upload starting:', file.name);
      
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 saniye timeout
      });
      
      console.log('PDF upload successful:', response.data.text.length, 'characters');
      
      setText(response.data.text);
      setError('');
      
      // Parent component'e metni gönder
      if (onFileUpload) {
        onFileUpload(response.data.text);
      }
      
    } catch (err) {
      console.error('PDF upload error:', err);
      setError(err.response?.data?.error || 'File upload error!');
      setText('');
    } finally {
      setIsLoading(false);
    }
  };

  // Drag & Drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleUpload({ target: { files: [file] } });
    } else if (file) {
      setError('Only PDF files are accepted!');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {isDragOver ? 'Drop your PDF here' : 'Upload your CV'}
            </h3>
            <p className="text-gray-600">
              {isDragOver ? (
                <span className="text-blue-600 font-medium">Release to upload</span>
              ) : (
                <>
                  Drag and drop your PDF file here
                  <br />
                  <span className="text-sm">or click to browse</span>
                </>
              )}
            </p>
          </div>
          
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white hover:file:from-blue-600 hover:file:to-purple-700 transition-all duration-200"
            disabled={isLoading}
          />
        </div>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-xl">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-blue-700 font-medium">Processing PDF...</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {text && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-medium text-green-800">PDF Content Extracted</h3>
          </div>
          <div className="bg-white p-4 rounded-lg border text-sm text-gray-700 max-h-40 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{text.substring(0, 500)}...</pre>
          </div>
          <div className="mt-3 text-xs text-green-600 font-medium">
            {text.length} characters extracted • {text.split(' ').length} words
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFUploader;