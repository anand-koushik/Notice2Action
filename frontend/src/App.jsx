import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NoticeForm from './components/NoticeForm';
import NoticeDetails from './components/NoticeDetails';
import NoticeHistory from './components/NoticeHistory';
import { fetchNotices, analyzeNotice, updateChecklist, deleteNotice } from './utils/api';
import { PlusCircle, FileQuestion, AlertTriangle, Key } from 'lucide-react';

export default function App() {
  const [notices, setNotices] = useState([]);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  // Load notices history on mount
  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setError('');
      const data = await fetchNotices();
      setNotices(data);
      // Auto-select the first notice if there is one
      if (data.length > 0 && !selectedNoticeId) {
        setSelectedNoticeId(data[0]._id);
      }
    } catch (err) {
      console.error('Error loading notices:', err);
      // Check if error might be database connection or key issue
      setError('Could not connect to the backend. Make sure the Node server is running.');
    }
  };

  const handleAnalyze = async (payload) => {
    setIsLoading(true);
    setError('');
    setIsApiKeyMissing(false);
    try {
      const newNotice = await analyzeNotice(payload);
      setNotices((prev) => [newNotice, ...prev]);
      setSelectedNoticeId(newNotice._id);
    } catch (err) {
      console.error('Error analyzing notice:', err);
      const errMsg = err.message || '';
      if (errMsg.includes('GROQ_API_KEY') || errMsg.includes('API key not found') || errMsg.includes('api_key')) {
        setIsApiKeyMissing(true);
      } else {
        setError(errMsg || 'An error occurred during AI analysis. Please check backend logs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n._id !== id));
      if (selectedNoticeId === id) {
        setSelectedNoticeId(null);
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      setError('Failed to delete notice.');
    }
  };

  const handleToggleChecklist = async (itemId, completed) => {
    if (!selectedNoticeId) return;

    // Optimistically update local UI state first
    setNotices((prevNotices) =>
      prevNotices.map((n) => {
        if (n._id !== selectedNoticeId) return n;
        return {
          ...n,
          checklist: n.checklist.map((item) =>
            item._id === itemId ? { ...item, completed } : item
          ),
        };
      })
    );

    try {
      await updateChecklist(selectedNoticeId, itemId, completed);
    } catch (err) {
      console.error('Error updating checklist in database:', err);
      // Revert change on failure
      loadNotices();
      setError('Failed to sync checklist update with database.');
    }
  };

  const selectedNotice = notices.find((n) => n._id === selectedNoticeId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: History Sidebar */}
        <section className="w-full lg:w-80 shrink-0">
          <NoticeHistory
            notices={notices}
            selectedId={selectedNoticeId}
            onSelect={(id) => setSelectedNoticeId(id)}
            onDelete={handleDelete}
          />
        </section>

        {/* Right Column: Active Workspace (Details or Input Form) */}
        <section className="flex-1 min-w-0">
          {isApiKeyMissing && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl mb-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <Key className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Groq API Key Required</h3>
                  <p className="text-sm text-amber-700 mt-2 leading-relaxed">
                    The application needs a valid API key to communicate with Groq AI.
                  </p>
                  <ol className="list-decimal pl-5 mt-3 space-y-1.5 text-xs text-amber-800 font-medium">
                    <li>Get a free or tier-based Groq API Key from the <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-indigo-700">Groq Console</a>.</li>
                    <li>Open the file <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">notice2action/backend/.env</code> in your editor.</li>
                    <li>Paste your key next to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GROQ_API_KEY=your_key_here</code>.</li>
                    <li>Restart the backend Node.js server.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 flex items-start space-x-3 text-red-800 text-sm shadow-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action workspace toggle buttons */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
              {selectedNotice ? 'Simplified Notice Dashboard' : 'Analyze New Notice'}
            </h2>
            {selectedNotice && (
              <button
                onClick={() => setSelectedNoticeId(null)}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold px-4 py-2 rounded-xl transition text-sm flex items-center space-x-2 shadow-sm border border-indigo-100/50"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Analyze New Notice</span>
              </button>
            )}
          </div>

          {selectedNotice ? (
            <NoticeDetails
              notice={selectedNotice}
              onToggleChecklist={handleToggleChecklist}
            />
          ) : (
            <div className="max-w-2xl mx-auto">
              <NoticeForm onAnalyze={handleAnalyze} isLoading={isLoading} />
              
              {/* App Welcome Info */}
              {!isLoading && notices.length === 0 && (
                <div className="mt-8 border border-slate-100 bg-white p-6 rounded-2xl text-center shadow-sm">
                  <FileQuestion className="h-10 w-10 text-indigo-500 mx-auto opacity-75 mb-3" />
                  <h4 className="font-bold text-gray-800">Ready to simplify complex notices?</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-md mx-auto">
                    Paste raw notice text or upload complex document files (like PDFs or images). Our AI will instantly dissect and structure them so you never miss eligibility details or deadlines.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400 font-medium">
          <p>© {new Date().getFullYear()} Notice2Action. Built with MongoDB, Express, React, Node.js & Groq AI.</p>
        </div>
      </footer>
    </div>
  );
}
