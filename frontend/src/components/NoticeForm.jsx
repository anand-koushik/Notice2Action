import React, { useState } from 'react';
import { FileText, Upload, RefreshCw, AlertCircle, FileCode } from 'lucide-react';

export default function NoticeForm({ onAnalyze, isLoading }) {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB Limit
        setError('File size must be less than 10MB');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const readFileAsBase64 = (fileObj) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Get only the base64 string portion (strip the dataURL header)
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(fileObj);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'paste') {
      if (!text.trim()) {
        setError('Please paste the notice text first.');
        return;
      }
      onAnalyze({
        content: text,
        fileType: 'text',
        fileName: 'Pasted Text Notice'
      });
    } else {
      if (!file) {
        setError('Please upload a file first.');
        return;
      }

      try {
        const base64Data = await readFileAsBase64(file);
        
        let type = 'text';
        if (file.type === 'application/pdf') {
          type = 'pdf';
        } else if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type === 'text/plain') {
          // Send plain text files as text content
          const textContent = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsText(file);
          });
          onAnalyze({
            content: textContent,
            fileType: 'text',
            fileName: file.name
          });
          return;
        } else {
          setError('Unsupported file type. Use PDF, Images, or TXT.');
          return;
        }

        onAnalyze({
          content: base64Data,
          fileType: type,
          fileName: file.name,
          mimeType: file.type
        });
      } catch (err) {
        console.error('File reading error:', err);
        setError('Failed to read file. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={() => { setActiveTab('paste'); setError(''); }}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
            activeTab === 'paste'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Paste Notice Text</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('upload'); setError(''); }}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${
            activeTab === 'upload'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Upload File (PDF/Image)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-start space-x-2 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'paste' ? (
          <div>
            <label htmlFor="notice-text" className="block text-sm font-semibold text-gray-700 mb-2">
              Paste Official Notice Content
            </label>
            <textarea
              id="notice-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste admission criteria, circulars, corporate policy, deadlines, or any lengthy official announcements here..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Upload PDF or Image Notice
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative bg-gray-50/50">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {file ? file.name : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-gray-400">
                  Supports PDF, PNG, JPG, JPEG, and TXT (Max 10MB)
                </p>
              </div>
            </div>

            {file && (
              <div className="flex items-center space-x-2 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 text-xs text-indigo-700">
                <FileCode className="h-4 w-4 shrink-0" />
                <span className="font-medium truncate flex-1">{file.name}</span>
                <span className="shrink-0 text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-100 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:bg-indigo-400 disabled:shadow-none flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Analyzing with Groq AI...</span>
            </>
          ) : (
            <span>Simplify Notice</span>
          )}
        </button>
      </form>
    </div>
  );
}
