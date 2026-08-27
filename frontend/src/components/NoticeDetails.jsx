import React from 'react';
import { Calendar, CheckCircle2, ListChecks, UserCheck, AlertCircle, Info } from 'lucide-react';

export default function NoticeDetails({ notice, onToggleChecklist }) {
  if (!notice) return null;

  const completedCount = notice.checklist?.filter(item => item.completed).length || 0;
  const totalCount = notice.checklist?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {notice.fileType.toUpperCase()} Notice
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{notice.title}</h2>
          <p className="text-xs text-gray-400 mt-1">
            Processed on {new Date(notice.createdAt).toLocaleString()} {notice.fileName ? `• File: ${notice.fileName}` : ''}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="w-full md:w-64 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
              <span className="font-semibold flex items-center"><ListChecks className="h-4 w-4 mr-1 text-indigo-500" /> Actions Checklist</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{progressPercent}% Done</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-right font-medium">
              {completedCount} of {totalCount} items completed
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Eligibility (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
              <Info className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-gray-800 text-lg">AI Simplified Summary</h3>
            </div>
            {/* The summary might contain markdown headers or bullet points. We can render it with nice prose formatting */}
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line space-y-2">
              {notice.summary}
            </div>
          </div>

          {/* Eligibility Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
              <UserCheck className="h-5 w-5 text-green-500" />
              <h3 className="font-bold text-gray-800 text-lg">Eligibility & Requirements</h3>
            </div>
            {notice.eligibility?.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No specific eligibility criteria specified.</p>
            ) : (
              <ul className="space-y-2.5">
                {notice.eligibility?.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-gray-600">
                    <span className="h-5 w-5 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="flex-1 leading-normal">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines & Checklist (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Deadlines Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-gray-800 text-lg">Important Deadlines</h3>
            </div>
            {notice.deadlines?.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No key deadlines specified.</p>
            ) : (
              <div className="space-y-4">
                {notice.deadlines?.map((dl, idx) => (
                  <div key={idx} className="border-l-2 border-orange-500 pl-3 py-1 space-y-1">
                    <p className="text-xs text-orange-600 font-bold tracking-wide uppercase">
                      {dl.date}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {dl.task}
                    </p>
                    {dl.originalText && (
                      <p className="text-[11px] text-gray-400 italic leading-snug">
                        "{dl.originalText}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Checklist Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-gray-800 text-lg">Actions Checklist</h3>
            </div>
            {notice.checklist?.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No checklist items generated.</p>
            ) : (
              <div className="space-y-3">
                {notice.checklist?.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onToggleChecklist(item._id, !item.completed)}
                    className={`flex items-start space-x-3 p-3 rounded-xl border transition cursor-pointer ${
                      item.completed
                        ? 'bg-gray-50 border-gray-100 text-gray-400 line-through'
                        : 'bg-indigo-50/20 border-indigo-100/50 hover:bg-indigo-50/55 hover:border-indigo-100 text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}} // Handled by outer div onClick
                      className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{item.task}</p>
                      {item.dueDate && item.dueDate !== 'Not specified' && (
                        <p className={`text-[10px] mt-1 font-semibold ${item.completed ? 'text-gray-400' : 'text-red-500'}`}>
                          Due: {item.dueDate}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
