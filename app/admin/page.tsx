'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { importLeagueData } from '../lib/importLeague';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'full' | 'update'>('full');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError('');
    setSuccess(false);
    setStatus('');
  };

  const MAX_SERVER_POST_SIZE = 20 * 1024 * 1024; // 20MB

  const handleImport = async () => {
    if (!file) {
      setError('Please select a JSON file first');
      return;
    }

    setLoading(true);
    setStatus('Reading file...');
    setError('');
    setSuccess(false);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      setStatus(`Importing league data...`);
      try {
        await importLeagueData(data, importMode);
        setStatus(`✅ League import completed successfully.`);
        setSuccess(true);
      } catch (errInner) {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const shouldAttemptServerFallback = isLocal && file.size <= MAX_SERVER_POST_SIZE;

        if (shouldAttemptServerFallback) {
          setStatus('Client import failed, attempting local server-side fallback...');
          try {
            const res = await fetch('/api/import', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
            const json = await res.json();
            if (res.ok && json.ok) {
              setStatus(`✅ Fallback import completed: ${json.teams} teams, ${json.players} players`);
              setSuccess(true);
              return;
            } else {
              throw new Error(json.error || 'Fallback import failed');
            }
          } catch (fallbackErr) {
            const message = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
            setError(`Fallback import failed: ${message}`);
            return;
          }
        }

        const message = errInner instanceof Error ? errInner.message : String(errInner);
        if (!isLocal && file.size > MAX_SERVER_POST_SIZE) {
          setError(`Import failed: ${message}. This JSON file is too large to send through /api/import on this deployment. Please import locally or reduce the file size.`);
        } else {
          setError(`Import failed: ${message}. If you are using a browser extension that blocks Firebase or Cloud Firestore, disable it and try again.`);
        }
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 px-4 pb-8 lg:px-6">
      {/* Hero Section */}
      <section className="rounded-[20px] border border-white/10 bg-bml-surface p-8 shadow-glass">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Administration</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Admin Control Center</h1>
          <p className="text-lg leading-8 text-bml-muted">
            Manage league configuration, import BBGM exports, and oversee league operations.
          </p>
        </div>
      </section>

      {/* Import Section */}
      <section className="rounded-[20px] border border-white/10 bg-bml-surface p-8 shadow-glass">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Import Center</h2>
            <p className="text-bml-muted">Upload a Basketball GM JSON export file to import league data</p>
          </div>

          <div className="space-y-4">
            {/* File Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-white mb-2">Select JSON File</label>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
              {file && (
                <div className="space-y-2">
                  <p className="mt-2 text-sm text-blue-300">Selected: {file.name}</p>
                  <p className="text-sm text-bml-muted">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  {file.size > MAX_SERVER_POST_SIZE ? (
                    <p className="text-sm text-yellow-300">
                      Note: this file is larger than 3 MB. Local fallback import via <code>/api/import</code> may not work.
                    </p>
                  ) : (
                    <p className="text-sm text-bml-muted">
                      Local fallback import is available for files smaller than 3 MB.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Import Mode */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Import Mode</label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'full' | 'update')}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="full">Full Import (Replace All)</option>
                <option value="update">Update Import (Merge Data)</option>
              </select>
            </div>

            {/* Action Button */}
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Import League JSON
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {status && (
            <div className={`p-4 rounded-xl border ${success ? 'border-green-500/20 bg-green-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
              <div className="flex gap-3">
                {success ? (
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <div className="text-blue-400 flex-shrink-0 mt-0.5">
                    <Loader className="animate-spin" size={20} />
                  </div>
                )}
                <div>
                  <p className={`text-sm whitespace-pre-wrap ${success ? 'text-green-300' : 'text-blue-300'}`}>
                    {status}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <div className="flex gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="rounded-[20px] border border-white/10 bg-white/5 p-8">
        <h3 className="text-xl font-semibold text-white mb-4">About BBGM Imports</h3>
        <ul className="space-y-2 text-bml-muted">
          <li>✓ Supports Basketball GM version 72+ export files</li>
          <li>✓ Imports teams, players, games, awards, and playoff data</li>
          <li>✓ Full Import mode replaces all existing league data</li>
          <li>✓ Update Import mode merges with existing data</li>
          <li>✓ Player ratings, contracts, and injury data are preserved</li>
        </ul>
      </section>
    </div>
  );
}
