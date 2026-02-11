'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  is_anonymous: boolean;
  reporter_name?: string;
  reporter_email?: string;
  location?: string;
  affected_systems?: string[];
  affected_individuals_count?: number;
  resolution_notes?: string;
  reported_by_profile?: { full_name: string; email: string };
  assigned_to_profile?: { full_name: string };
  resolved_by_profile?: { full_name: string };
  created_at: string;
  resolved_at?: string;
  comments?: Array<{
    id: string;
    comment_text: string;
    created_at: string;
    user: { full_name: string };
  }>;
}

export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    severity: '',
    assigned_to: '',
    resolution_notes: ''
  });

  useEffect(() => {
    fetchIncident();
  }, [params.id]);

  const fetchIncident = async () => {
    try {
      const response = await fetch(`/api/incidents/${params.id}`);

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch incident');

      const data = await response.json();
      setIncident(data);
      setFormData({
        status: data.status,
        severity: data.severity,
        assigned_to: data.assigned_to || '',
        resolution_notes: data.resolution_notes || ''
      });
    } catch (err) {
      console.error('Error fetching incident:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateIncident = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/incidents/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update incident');

      await fetchIncident();
      setEditMode(false);
    } catch (err) {
      console.error('Error updating incident:', err);
      alert('Failed to update incident');
    } finally {
      setUpdating(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/incidents/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: newComment })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setNewComment('');
      await fetchIncident();
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 text-lg">Incident not found</p>
          <Link
            href="/dashboard/privacy-officer/incidents"
            className="mt-4 inline-block text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Incidents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/privacy-officer/incidents"
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-slate-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{incident.title}</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Reported {new Date(incident.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              {editMode ? 'Cancel Edit' : 'Edit Incident'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Incident Details</h2>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {formData.status === 'resolved' && (
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Resolution Notes</label>
                      <textarea
                        value={formData.resolution_notes}
                        onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white h-32"
                        placeholder="Describe how this was resolved..."
                      />
                    </div>
                  )}

                  <button
                    onClick={updateIncident}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-slate-300">
                  <p className="whitespace-pre-wrap">{incident.description}</p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-slate-500 text-sm">Category</p>
                      <p className="font-medium">{incident.category.replace('_', ' ')}</p>
                    </div>
                    {incident.location && (
                      <div>
                        <p className="text-slate-500 text-sm">Location</p>
                        <p className="font-medium">{incident.location}</p>
                      </div>
                    )}
                    {incident.affected_individuals_count && (
                      <div>
                        <p className="text-slate-500 text-sm">Affected Individuals</p>
                        <p className="font-medium">{incident.affected_individuals_count}</p>
                      </div>
                    )}
                  </div>

                  {incident.resolution_notes && (
                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-slate-500 text-sm mb-2">Resolution</p>
                      <p className="whitespace-pre-wrap">{incident.resolution_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ChatBubbleLeftIcon className="h-5 w-5" />
                Comments
              </h2>

              <div className="space-y-4 mb-6">
                {incident.comments?.map((comment) => (
                  <div key={comment.id} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-slate-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white font-medium">{comment.user.full_name}</p>
                          <p className="text-slate-500 text-sm">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-slate-300">{comment.comment_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white resize-none"
                  rows={3}
                />
                <button
                  onClick={addComment}
                  className="px-6 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Current Status</p>
                  <p className="text-white font-medium capitalize">{incident.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Severity</p>
                  <p className="text-white font-medium capitalize">{incident.severity}</p>
                </div>
              </div>
            </div>

            {/* Reporter Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Reporter</h3>
              {incident.is_anonymous ? (
                <div className="text-slate-400">
                  <p className="italic">Anonymous Report</p>
                  {incident.reporter_email && (
                    <p className="text-sm mt-2">Contact: {incident.reporter_email}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium">{incident.reported_by_profile?.full_name}</p>
                  <p className="text-slate-400 text-sm">{incident.reported_by_profile?.email}</p>
                </div>
              )}
            </div>

            {/* Timeline Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Reported</p>
                  <p className="text-white">{new Date(incident.created_at).toLocaleString()}</p>
                </div>
                {incident.resolved_at && (
                  <div>
                    <p className="text-slate-400">Resolved</p>
                    <p className="text-white">{new Date(incident.resolved_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
