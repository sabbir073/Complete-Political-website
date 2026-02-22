'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

interface FileItem {
  url: string;
  s3Key: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

interface Submission {
  id: string;
  challenge_id: string;
  name: string;
  mobile: string;
  description?: string;
  files: FileItem[];
  created_at: string;
  challenges?: { title_en: string; title_bn: string };
}

interface Challenge {
  id: string;
  title_en: string;
  title_bn: string;
}

export default function ChallengeSubmissionsPage() {
  const { isDark } = useTheme();
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert();
  const searchParams = useSearchParams();
  const challengeIdParam = searchParams.get('challenge_id');

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState(challengeIdParam || '');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  useEffect(() => { fetchChallenges(); }, []);
  useEffect(() => { fetchSubmissions(); }, [selectedChallengeId, page]);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/admin/challenges?limit=100');
      const data = await res.json();
      if (data.success) setChallenges(data.data || []);
    } catch {}
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (selectedChallengeId) params.append('challenge_id', selectedChallengeId);
      const res = await fetch(`/api/admin/challenges/submissions?${params}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data || []);
        setTotal(data.pagination?.total || 0);
      } else {
        showError('Error', data.error || 'Failed to fetch submissions');
      }
    } catch {
      showError('Error', 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (submission: Submission) => {
    const result = await showDeleteConfirm(`submission by ${submission.name}`);
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/admin/challenges/submissions?id=${submission.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showSuccess('Deleted', 'Submission deleted');
        fetchSubmissions();
        if (selectedSubmission?.id === submission.id) setSelectedSubmission(null);
      } else {
        showError('Error', data.error || 'Failed to delete');
      }
    } catch {
      showError('Error', 'Failed to delete submission');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Challenge Submissions</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {total} submission{total !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link
          href="/admin/services/challenges"
          className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm font-medium ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Challenges
        </Link>
      </div>

      {/* Filter */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Filter by Challenge
        </label>
        <select
          value={selectedChallengeId}
          onChange={(e) => { setSelectedChallengeId(e.target.value); setPage(1); }}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="">All Challenges</option>
          {challenges.map(c => (
            <option key={c.id} value={c.id}>{c.title_en}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No submissions yet</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedSubmission?.id === submission.id
                      ? isDark ? 'bg-green-900/30' : 'bg-green-50'
                      : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{submission.name}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{submission.mobile}</p>
                      {submission.challenges && (
                        <p className={`text-xs mt-1 truncate ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {submission.challenges.title_en}
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {format(new Date(submission.created_at), 'MMM d, yyyy • h:mm a')}
                        {' · '}{submission.files?.length || 0} file{submission.files?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(submission); }}
                      className="ml-2 p-1 text-red-500 hover:text-red-600 flex-shrink-0"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`px-4 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded text-sm disabled:opacity-50 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                Previous
              </button>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded text-sm disabled:opacity-50 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          {!selectedSubmission ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select a submission to view details</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Submission Details</h3>
                <button onClick={() => setSelectedSubmission(null)} className={`p-1 rounded ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-2`}>
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Name</span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedSubmission.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mobile</span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedSubmission.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Submitted</span>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {format(new Date(selectedSubmission.created_at), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                {selectedSubmission.challenges && (
                  <div className="flex justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Challenge</span>
                    <span className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{selectedSubmission.challenges.title_en}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedSubmission.description && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</p>
                  <div className={`p-3 rounded-lg text-sm whitespace-pre-line ${isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {selectedSubmission.description}
                  </div>
                </div>
              )}

              {/* Files */}
              <div>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Uploaded Files ({selectedSubmission.files?.length || 0})
                </p>
                <div className="space-y-3">
                  {(selectedSubmission.files || []).map((file, i) => (
                    <div key={i} className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      {file.fileType?.startsWith('image/') ? (
                        <div className="relative">
                          <img src={file.url} alt={file.filename} className="w-full h-48 object-cover" />
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ) : (
                        <div className={`p-3 flex items-center gap-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{file.filename}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.fileSize)}</p>
                          </div>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                      <div className={`px-3 py-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{file.filename} • {formatFileSize(file.fileSize)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
