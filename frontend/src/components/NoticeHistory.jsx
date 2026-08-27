import React from 'react';
import { FileText, FileCode2, Image, Trash2, Calendar, CheckSquare } from 'lucide-react';

export default function NoticeHistory({ notices, selectedId, onSelect, onDelete }) {
  const getIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileCode2 className="h-5 w-5 text-red-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCompletionStats = (checklist) => {
    if (!checklist || checklist.length === 0) return null;
    const completed = checklist.filter(item => item.completed).length;
    return `${completed}/${checklist.length}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">Analysis History</h2>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">
          {notices.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[calc(100vh-250px)]">
        {notices.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notices processed yet.</p>
          </div>
        ) : (
          notices.map((notice) => {
            const stats = getCompletionStats(notice.checklist);
            const isSelected = selectedId === notice._id;
            return (
              <div
                key={notice._id}
                onClick={() => onSelect(notice._id)}
                className={`p-4 transition-all duration-200 cursor-pointer flex items-start justify-between hover:bg-slate-50 ${
                  isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600 pl-3' : 'pl-4'
                }`}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notice.fileType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {notice.title}
                    </p>
                    <div className="flex items-center space-x-3 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(notice.createdAt)}
                      </span>
                      {stats && (
                        <span className="flex items-center bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-semibold text-[10px]">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          {stats} Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this notice?')) {
                      onDelete(notice._id);
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors duration-150 shrink-0"
                  title="Delete Notice"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
