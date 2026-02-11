'use client';

import { useState, useEffect } from 'react';
import {
  Device,
  AuditReport,
  generateAuditReport,
  exportAuditReportMarkdown,
  exportDeviceInventoryCSV,
  calculateDeviceCompliance,
  generateDeviceId,
} from '@/lib/data-device-audit';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ServerIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAnalytics } from '@/lib/mixpanel';

const STORAGE_KEY = 'data-device-audit';

const DEVICE_TYPE_ICONS: Record<Device['deviceType'], any> = {
  laptop: ComputerDesktopIcon,
  desktop: ComputerDesktopIcon,
  tablet: DevicePhoneMobileIcon,
  smartphone: DevicePhoneMobileIcon,
  server: ServerIcon,
  'removable-media': CircleStackIcon,
  other: ComputerDesktopIcon,
};

export default function DataDeviceAuditClient() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const analytics = useAnalytics();

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDevices(data.devices || []);
      } catch (e) {
        console.error('Failed to load saved devices:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (devices.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ devices, lastSaved: new Date().toISOString() }));
    }
  }, [devices]);

  const handleAddDevice = (device: Omit<Device, 'id'>) => {
    const newDevice: Device = {
      ...device,
      id: generateDeviceId(),
      lastAuditDate: new Date().toISOString(),
    };

    setDevices([...devices, newDevice]);
    setShowAddForm(false);

    analytics?.track('Device Added', {
      device_type: device.deviceType,
      accesses_ephi: device.accessesEPHI,
    });
  };

  const handleUpdateDevice = (device: Device) => {
    setDevices(devices.map(d => d.id === device.id ? { ...device, lastAuditDate: new Date().toISOString() } : d));
    setEditingDevice(null);

    analytics?.track('Device Updated', {
      device_type: device.deviceType,
      accesses_ephi: device.accessesEPHI,
    });
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (confirm('Are you sure you want to delete this device?')) {
      setDevices(devices.filter(d => d.id !== deviceId));
      analytics?.track('Device Deleted');
    }
  };

  const handleGenerateReport = () => {
    const newReport = generateAuditReport(devices);
    setReport(newReport);
    setShowReport(true);

    analytics?.track('Audit Report Generated', {
      total_devices: newReport.totalDevices,
      ephi_devices: newReport.ephiDevices,
      risk_score: newReport.riskScore,
    });
  };

  const handleExportMarkdown = () => {
    if (!report) return;

    const markdown = exportAuditReportMarkdown(report);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-device-audit-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    analytics?.track('Audit Report Exported', { format: 'markdown' });
  };

  const handleExportCSV = () => {
    const csv = exportDeviceInventoryCSV(devices);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    analytics?.track('Device Inventory Exported', { format: 'csv' });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all devices? This cannot be undone.')) {
      setDevices([]);
      setReport(null);
      setShowReport(false);
      localStorage.removeItem(STORAGE_KEY);
      analytics?.track('Device Audit Cleared');
    }
  };

  if (showReport && report) {
    return <ReportView report={report} onBack={() => setShowReport(false)} onExportMD={handleExportMarkdown} onExportCSV={handleExportCSV} />;
  }

  if (showAddForm) {
    return <DeviceForm onSave={handleAddDevice} onCancel={() => setShowAddForm(false)} />;
  }

  if (editingDevice) {
    return <DeviceForm device={editingDevice} onSave={(device) => handleUpdateDevice(device as Device)} onCancel={() => setEditingDevice(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Data Device Audit</h1>
          <p className="mt-3 text-lg text-slate-600">
            Track and assess security controls for all devices accessing ePHI
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Add Device
          </button>

          {devices.length > 0 && (
            <>
              <button
                onClick={handleGenerateReport}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg"
              >
                <ChartBarIcon className="h-5 w-5" />
                Generate Report
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export CSV
              </button>

              <button
                onClick={handleClearAll}
                className="ml-auto flex items-center gap-2 rounded-lg border-2 border-red-300 bg-white px-6 py-3 font-semibold text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-5 w-5" />
                Clear All
              </button>
            </>
          )}
        </div>

        {/* Summary Cards */}
        {devices.length > 0 && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              <p className="text-sm font-semibold text-slate-600">Total Devices</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{devices.length}</p>
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50 p-6 shadow-md">
              <p className="text-sm font-semibold text-violet-600">ePHI Access</p>
              <p className="mt-2 text-3xl font-bold text-violet-900">
                {devices.filter(d => d.accessesEPHI).length}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-md">
              <p className="text-sm font-semibold text-emerald-600">Compliant</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">
                {devices.filter(d => d.accessesEPHI && calculateDeviceCompliance(d) >= 80).length}
              </p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-md">
              <p className="text-sm font-semibold text-red-600">Non-Compliant</p>
              <p className="mt-2 text-3xl font-bold text-red-900">
                {devices.filter(d => d.accessesEPHI && calculateDeviceCompliance(d) < 80).length}
              </p>
            </div>
          </div>
        )}

        {/* Device List */}
        {devices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <ComputerDesktopIcon className="mx-auto h-16 w-16 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No devices added yet</h3>
            <p className="mt-2 text-slate-600">
              Start by adding devices to your inventory to track security controls and compliance.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Add Your First Device
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map(device => {
              const compliance = calculateDeviceCompliance(device);
              const IconComponent = DEVICE_TYPE_ICONS[device.deviceType];

              return (
                <div
                  key={device.id}
                  className={`rounded-xl border-2 p-6 shadow-md transition-all hover:shadow-lg ${
                    device.accessesEPHI
                      ? compliance >= 80
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : compliance >= 60
                        ? 'border-yellow-200 bg-yellow-50/50'
                        : 'border-red-200 bg-red-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        device.accessesEPHI
                          ? compliance >= 80
                            ? 'bg-emerald-100'
                            : compliance >= 60
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                          : 'bg-slate-100'
                      }`}>
                        <IconComponent className={`h-7 w-7 ${
                          device.accessesEPHI
                            ? compliance >= 80
                              ? 'text-emerald-600'
                              : compliance >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                            : 'text-slate-600'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900">
                            {device.manufacturer} {device.model}
                          </h3>
                          {device.accessesEPHI && (
                            <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
                              ePHI ACCESS
                            </span>
                          )}
                        </div>

                        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <span className="font-medium text-slate-600">Serial:</span>{' '}
                            <span className="text-slate-900">{device.serialNumber}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Assigned to:</span>{' '}
                            <span className="text-slate-900">{device.assignedTo}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Department:</span>{' '}
                            <span className="text-slate-900">{device.department}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Location:</span>{' '}
                            <span className="text-slate-900">{device.location}</span>
                          </div>
                        </div>

                        {device.accessesEPHI && (
                          <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-700">
                                Compliance Score
                              </span>
                              <span className={`text-lg font-bold ${
                                compliance >= 80 ? 'text-emerald-700' : compliance >= 60 ? 'text-yellow-700' : 'text-red-700'
                              }`}>
                                {compliance}%
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full transition-all ${
                                  compliance >= 80 ? 'bg-emerald-500' : compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${compliance}%` }}
                              />
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {device.securityControls.encryption && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" /> Encrypted
                                </span>
                              )}
                              {!device.securityControls.encryption && (
                                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                  <XCircleIcon className="h-4 w-4" /> No Encryption
                                </span>
                              )}
                              {device.securityControls.passwordProtection && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" /> Password
                                </span>
                              )}
                              {device.securityControls.remoteWipe && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" /> Remote Wipe
                                </span>
                              )}
                              {device.securityControls.mdmEnrolled && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircleIcon className="h-4 w-4" /> MDM
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {device.notes && (
                          <div className="mt-3 rounded-lg bg-white/50 p-3 text-sm text-slate-700">
                            <span className="font-medium">Notes:</span> {device.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingDevice(device)}
                        className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="rounded-lg border border-red-300 bg-white p-2 text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Device Form Component
function DeviceForm({
  device,
  onSave,
  onCancel,
}: {
  device?: Device;
  onSave: (device: Omit<Device, 'id'> | Device) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Omit<Device, 'id'>>(
    device || {
      deviceType: 'laptop',
      manufacturer: '',
      model: '',
      serialNumber: '',
      assignedTo: '',
      department: '',
      location: '',
      purchaseDate: '',
      operatingSystem: '',
      accessesEPHI: false,
      securityControls: {
        encryption: false,
        passwordProtection: false,
        autoLock: false,
        remoteWipe: false,
        antivirusMalware: false,
        osUpdated: false,
        mdmEnrolled: false,
      },
      notes: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (device) {
      onSave({ ...device, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {device ? 'Edit Device' : 'Add Device'}
          </h1>
          <p className="mt-2 text-slate-600">
            Complete the form below to {device ? 'update' : 'add'} a device to your inventory
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-8 shadow-md">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Device Type *
                  </label>
                  <select
                    value={formData.deviceType}
                    onChange={e => setFormData({ ...formData, deviceType: e.target.value as Device['deviceType'] })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    required
                  >
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="tablet">Tablet</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="server">Server</option>
                    <option value="removable-media">Removable Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assigned To *
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Operating System *
                  </label>
                  <input
                    type="text"
                    value={formData.operatingSystem}
                    onChange={e => setFormData({ ...formData, operatingSystem: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="e.g., Windows 11, macOS 14, iOS 17"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ePHI Access */}
            <div>
              <label className="flex items-center gap-3 rounded-lg border-2 border-violet-200 bg-violet-50 p-4">
                <input
                  type="checkbox"
                  checked={formData.accessesEPHI}
                  onChange={e => setFormData({ ...formData, accessesEPHI: e.target.checked })}
                  className="h-5 w-5 rounded border-violet-300 text-violet-600"
                />
                <div>
                  <div className="font-semibold text-violet-900">This device accesses ePHI</div>
                  <div className="text-sm text-violet-700">
                    Check this if the device stores, processes, or transmits electronic Protected Health Information
                  </div>
                </div>
              </label>
            </div>

            {/* Security Controls */}
            {formData.accessesEPHI && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Security Controls</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.securityControls.encryption}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityControls: { ...formData.securityControls, encryption: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Encryption at Rest (Required)</div>
                      <div className="text-sm text-slate-600">Full-disk encryption enabled (BitLocker, FileVault, etc.)</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.securityControls.passwordProtection}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityControls: { ...formData.securityControls, passwordProtection: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Password Protection (Required)</div>
                      <div className="text-sm text-slate-600">Strong password/PIN required for access</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.securityControls.autoLock}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityControls: { ...formData.securityControls, autoLock: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Auto-Lock (Required)</div>
                      <div className="text-sm text-slate-600">Automatic screen lock after inactivity</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.securityControls.remoteWipe}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityControls: { ...formData.securityControls, remoteWipe: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Remote Wipe Capability</div>
                      <div className="text-sm text-slate-600">Ability to remotely erase data if lost/stolen</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.securityControls.antivirusMalware}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityControls: { ...formData.securityControls, antivirusMalware: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Antivirus/Anti-malware</div>
                      <div className="text-sm text-slate-600">Enterprise antivirus software installed and updated</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.securityControls.osUpdated}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityControls: { ...formData.securityControls, osUpdated: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">OS Up to Date</div>
                      <div className="text-sm text-slate-600">Operating system has latest security patches</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      type="checkbox"
                      checked={formData.securityControls.mdmEnrolled}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityControls: { ...formData.securityControls, mdmEnrolled: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-violet-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">MDM Enrolled</div>
                      <div className="text-sm text-slate-600">Device enrolled in Mobile Device Management system</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
                placeholder="Additional information about this device..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg"
            >
              {device ? 'Update Device' : 'Add Device'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Report View Component
function ReportView({
  report,
  onBack,
  onExportMD,
  onExportCSV,
}: {
  report: AuditReport;
  onBack: () => void;
  onExportMD: () => void;
  onExportCSV: () => void;
}) {
  const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
    report.riskScore <= 20 ? 'low' : report.riskScore <= 40 ? 'medium' : report.riskScore <= 60 ? 'high' : 'critical';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700">
            ← Back to Inventory
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Audit Report</h1>
              <p className="mt-2 text-slate-600">
                Generated on {new Date(report.generatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onExportMD}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export Report
              </button>
              <button
                onClick={onExportCSV}
                className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Overall Risk Score</p>
              <p className="mt-2 text-6xl font-bold text-slate-900">{report.riskScore}</p>
              <p className="mt-2 text-lg text-slate-600">
                {riskLevel === 'low' && 'Low Risk ✅'}
                {riskLevel === 'medium' && 'Medium Risk ⚠️'}
                {riskLevel === 'high' && 'High Risk 🔶'}
                {riskLevel === 'critical' && 'Critical Risk 🔴'}
              </p>
            </div>
            <div
              className={`flex h-32 w-32 items-center justify-center rounded-full ${
                riskLevel === 'low'
                  ? 'bg-emerald-100'
                  : riskLevel === 'medium'
                  ? 'bg-yellow-100'
                  : riskLevel === 'high'
                  ? 'bg-orange-100'
                  : 'bg-red-100'
              }`}
            >
              {riskLevel === 'low' ? (
                <ShieldCheckIcon className="h-16 w-16 text-emerald-600" />
              ) : (
                <ExclamationTriangleIcon
                  className={`h-16 w-16 ${
                    riskLevel === 'medium'
                      ? 'text-yellow-600'
                      : riskLevel === 'high'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}
                />
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="text-2xl font-bold text-slate-900">{report.totalDevices}</p>
              <p className="text-sm text-slate-600">Total Devices</p>
            </div>
            <div className="rounded-lg bg-violet-100 p-4">
              <p className="text-2xl font-bold text-violet-900">{report.ephiDevices}</p>
              <p className="text-sm text-violet-600">ePHI Access</p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-4">
              <p className="text-2xl font-bold text-emerald-900">{report.compliantDevices}</p>
              <p className="text-sm text-emerald-600">Compliant</p>
            </div>
            <div className="rounded-lg bg-red-100 p-4">
              <p className="text-2xl font-bold text-red-900">{report.nonCompliantDevices}</p>
              <p className="text-sm text-red-600">Non-Compliant</p>
            </div>
          </div>
        </div>

        {/* Findings */}
        {report.findings.length > 0 && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Findings ({report.findings.length})</h2>
            <div className="space-y-4">
              {report.findings.map((finding, index) => (
                <div
                  key={`${finding.deviceId}-${index}`}
                  className={`rounded-lg border-2 p-4 ${
                    finding.severity === 'critical'
                      ? 'border-red-300 bg-red-50'
                      : finding.severity === 'high'
                      ? 'border-orange-300 bg-orange-50'
                      : finding.severity === 'medium'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-blue-300 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        finding.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : finding.severity === 'high'
                          ? 'bg-orange-600 text-white'
                          : finding.severity === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {finding.severity}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{finding.deviceName}</p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-medium">Issue:</span> {finding.issue}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium">Recommendation:</span> {finding.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {report.findings.length === 0 && (
          <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <ShieldCheckIcon className="mx-auto h-16 w-16 text-emerald-600" />
            <h3 className="mt-4 text-xl font-bold text-emerald-900">All Clear!</h3>
            <p className="mt-2 text-emerald-700">
              No compliance issues identified. All devices accessing ePHI have appropriate security controls in place.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
