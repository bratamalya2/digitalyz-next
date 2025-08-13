'use client';

import { useState } from 'react';

const AIAnalysis = ({ data }) => {
  const [analysis, setAnalysis] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');

  // Check if data is available
  const hasData = data.clientData?.length > 0 || data.workerData?.length > 0 || data.taskData?.length > 0;

  const handleAnalyze = async (analysisType = 'general') => {
    if (!hasData) {
      setError('Please load data first before requesting analysis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          analysisType
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result.analysis);
      setActiveTab('analysis');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!hasData) {
      setError('Please load data first before requesting suggestions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/allocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get suggestions');
      }

      setSuggestions(result.suggestions);
      setActiveTab('suggestions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">AI Analysis & Suggestions</h2>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => handleAnalyze('general')}
          disabled={loading || !hasData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analyzing...' : 'General Analysis'}
        </button>
        
        <button
          onClick={() => handleAnalyze('capacity')}
          disabled={loading || !hasData}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Capacity Analysis
        </button>
        
        <button
          onClick={() => handleAnalyze('skills')}
          disabled={loading || !hasData}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Skills Analysis
        </button>
        
        <button
          onClick={handleGetSuggestions}
          disabled={loading || !hasData}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Get Allocation Suggestions
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Data Status */}
      {!hasData && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Note:</strong> Please load data using the file uploader or sample data button to enable AI analysis.
        </div>
      )}

      {/* Tabs */}
      {(analysis || suggestions) && (
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis Results
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Allocation Suggestions
            </button>
          </nav>
        </div>
      )}

      {/* Results Display */}
      {activeTab === 'analysis' && analysis && (
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="font-semibold mb-2">Analysis Results:</h3>
          <div className="whitespace-pre-wrap text-sm text-gray-700">
            {analysis}
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && suggestions && (
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="font-semibold mb-2">Allocation Suggestions:</h3>
          <div className="whitespace-pre-wrap text-sm text-gray-700">
            {suggestions}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Processing with AI...</span>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;