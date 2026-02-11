'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Policy {
  id: string;
  title: string;
  category: string;
  type: 'covered-entity' | 'business-associate';
}

interface CreateBundleModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateBundleModal({ onClose, onCreated }: CreateBundleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    policy_ids: [] as string[],
  });
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/policies');
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setPolicies(data);
    } catch (err) {
      console.error('Failed to load policies:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/policy-bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create bundle');
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bundle');
    } finally {
      setLoading(false);
    }
  };

  const togglePolicy = (policyId: string) => {
    setFormData((prev) => ({
      ...prev,
      policy_ids: prev.policy_ids.includes(policyId)
        ? prev.policy_ids.filter((id) => id !== policyId)
        : [...prev.policy_ids, policyId],
    }));
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      searchTerm === '' ||
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || policy.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(policies.map((p) => p.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-2xl font-bold text-white">Create Policy Bundle</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Bundle Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bundle Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="e.g., Clinical Staff Bundle, IT Department Bundle"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
              placeholder="Describe what this bundle covers..."
            />
          </div>

          {/* Policy Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Policies ({formData.policy_ids.length} selected)
            </label>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Policy List */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 max-h-96 overflow-y-auto space-y-2">
              {filteredPolicies.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No policies found</p>
              ) : (
                filteredPolicies.map((policy) => (
                  <label
                    key={policy.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={formData.policy_ids.includes(policy.id)}
                      onChange={() => togglePolicy(policy.id)}
                      className="mt-1 h-5 w-5 rounded border-slate-600 text-emerald-600 focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">
                        {policy.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">
                          {policy.category}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                          {policy.type === 'covered-entity' ? 'CE' : 'BA'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.policy_ids.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : `Create Bundle (${formData.policy_ids.length} policies)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
