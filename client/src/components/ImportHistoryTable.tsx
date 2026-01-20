'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  RefreshCw,
  Server,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  BarChart3,
  Activity,
  Eye,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Define the type for our log
// (In a real app, this would be in a separate types file)
// interface ImportLog {
//   _id: string;
//   feedUrl: string;
//   status: 'pending' | 'processing' | 'completed' | 'failed';
//   totalFetched: number;
//   newJobs: number;
//   updatedJobs: number;
//   failedJobs: number;
//   createdAt: string;
// }

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to extract friendly feed name from URL
function getFeedDisplayName(url: string): { name: string; category: string } {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const category = params.get('job_categories') || 'General';
    const source = urlObj.hostname.replace('www.', '').split('.')[0];
    
    const categoryMap: Record<string, string> = {
      'smm': 'Social Media Marketing',
      'seller': 'Sales',
      'design-multimedia': 'Design & Multimedia',
      'data-science': 'Data Science',
      'copywriting': 'Copywriting',
      'business': 'Business',
      'management': 'Management',
    };
    
    return {
      name: source.charAt(0).toUpperCase() + source.slice(1),
      category: categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
    };
  } catch {
    return { name: 'Unknown', category: 'General' };
  }
}

export default function ImportHistoryTable() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [stats, setStats] = useState({ totalImports: 0, completedImports: 0, totalNewJobs: 0, totalUpdatedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState({ note: '', feedUrl: '' });

  const fetchHistory = async (pageNum = 1) => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs/history?page=${pageNum}&limit=10`);
      setLogs(data.data);
      if (data.pagination) {
        setPagination(data.pagination);
        setPage(data.pagination.page);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
    // Auto-refresh every 5 seconds to show progress
    const interval = setInterval(() => fetchHistory(page), 5000);
    return () => clearInterval(interval);
  }, [page]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory(page);
  };

  const handleFetchJobs = async () => {
    try {
      setFetching(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/jobs/import-all`);
      // Small delay then refresh
      setTimeout(() => fetchHistory(1), 1000);
    } catch (error) {
      console.error("Error triggering import:", error);
    } finally {
      setFetching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      fetchHistory(newPage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
    }
  };


  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Server className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Import History
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Real-time tracking of job feed imports
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={handleFetchJobs}
              disabled={fetching}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Download className={cn("w-4 h-4 mr-2", fetching && "animate-bounce")} />
              {fetching ? 'Starting...' : 'Fetch Jobs'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center rounded-xl border-2 border-indigo-200 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Imports</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.totalImports}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.completedImports}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Jobs</dt>
                  <dd className="text-2xl font-bold text-green-600">+{stats.totalNewJobs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Updated Jobs</dt>
                  <dd className="text-2xl font-bold text-blue-600">{stats.totalUpdatedJobs}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-3 py-4 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  New
                </th>
                <th scope="col" className="px-3 py-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Updated
                </th>
                <th scope="col" className="px-3 py-4 text-center text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Failed
                </th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && !logs.length ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="w-10 h-10 mx-auto animate-spin mb-3 text-indigo-600" />
                    <p className="text-gray-600 font-medium">Loading history...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No imports found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => {
                  const feedInfo = getFeedDisplayName(log.feedUrl);
                  return (
                    <tr key={log._id} className="hover:bg-indigo-50/50 transition-all duration-150">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-3 py-4 text-sm" title={log.feedUrl}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{feedInfo.name}</span>
                          <span className="text-xs text-gray-500">{feedInfo.category}</span>
                        </div>
                      </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : '-'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {log.createdAt ? format(new Date(log.createdAt), 'yyyy') : ''}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-center font-medium">
                          {log.totalFetched}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600 text-center font-medium bg-green-50 rounded-md">
                          +{log.newJobs}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-blue-600 text-center font-medium">
                          {log.updatedJobs}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600 text-center font-medium">
                          {log.failedJobs > 0 ? log.failedJobs : '-'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {log.error ? (
                            <div className="flex items-center gap-2">
                              <span className="text-red-500 truncate max-w-[200px]">{log.error}</span>
                              <button
                                onClick={() => {
                                  setSelectedNote({ note: log.error, feedUrl: log.feedUrl });
                                  setShowNotesModal(true);
                                }}
                                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                title="View full note"
                              >
                                <Eye className="w-4 h-4 text-indigo-600" />
                              </button>
                            </div>
                          ) : log.logs && log.logs.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[200px]">{log.logs[log.logs.length - 1].reason}</span>
                              <button
                                onClick={() => {
                                  setSelectedNote({ note: log.logs[log.logs.length - 1].reason, feedUrl: log.feedUrl });
                                  setShowNotesModal(true);
                                }}
                                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                title="View full note"
                              >
                                <Eye className="w-4 h-4 text-indigo-600" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pagination.totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} results)
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowNotesModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Full Notes</h2>
              </div>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source</p>
                <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg break-all">{selectedNote.feedUrl}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedNote.note}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
