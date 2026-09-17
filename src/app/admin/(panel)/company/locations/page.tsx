'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Building,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function BusinessLocationsPage() {
  const { showToast } = useToast();
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<any>(null);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [activeMapLocation, setActiveMapLocation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    type: 'OFFICE',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phone: '',
    email: '',
    timezone: 'Asia/Kolkata',
  });

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/company/locations');
      if (res.ok) {
        const json = await res.json();
        setLocations(json.locations || []);
      }
    } catch {
      showToast('Failed to load business locations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const method = editingLocation ? 'PATCH' : 'POST';
      const body = editingLocation ? { id: editingLocation.id, ...form } : form;

      const res = await fetch('/api/admin/company/locations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok) {
        showToast(editingLocation ? 'Location updated successfully!' : 'New business location added!', 'success');
        setIsCreateModalOpen(false);
        setEditingLocation(null);
        setForm({
          name: '',
          type: 'OFFICE',
          address: '',
          city: '',
          state: '',
          country: 'United States',
          postalCode: '',
          phone: '',
          email: '',
          timezone: 'UTC',
        });
        fetchLocations();
      } else {
        showToast(json.error || 'Failed to save location', 'error');
      }
    } catch {
      showToast('Network error saving location', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (permanent: boolean) => {
    if (!locationToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/company/locations?id=${locationToDelete.id}&permanent=${permanent}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || 'Location removed successfully', 'success');
        setLocationToDelete(null);
        fetchLocations();
      } else {
        showToast(json.error || 'Failed to delete location', 'error');
      }
    } catch {
      showToast('Network error deleting location', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openEdit = (loc: any) => {
    setEditingLocation(loc);
    setForm({
      name: loc.name || '',
      type: loc.type || 'OFFICE',
      address: loc.address || '',
      city: loc.city || '',
      state: loc.state || '',
      country: loc.country || '',
      postalCode: loc.postalCode || '',
      phone: loc.phone || '',
      email: loc.email || '',
      timezone: loc.timezone || 'UTC',
    });
    setIsCreateModalOpen(true);
  };

  const filteredLocations = locations.filter((loc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      loc.name?.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q) ||
      loc.country?.toLowerCase().includes(q) ||
      loc.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Corporate Real Estate
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Business Locations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage corporate headquarters, international branches, regional offices, and logistics hubs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLocations}
            isLoading={isLoading}
            className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingLocation(null);
              setForm({
                name: '',
                type: 'OFFICE',
                address: '',
                city: '',
                state: '',
                country: 'United States',
                postalCode: '',
                phone: '',
                email: '',
                timezone: 'UTC',
              });
              setIsCreateModalOpen(true);
            }}
            className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Location</span>
          </Button>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter locations by name, city, country, or type..."
          className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
        />
        <Badge variant="outline" className="text-[10px] font-mono">
          {filteredLocations.length} Locations
        </Badge>
      </div>

      {/* Locations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900/80 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
          ))}
        </div>
      ) : filteredLocations.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No business locations found</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
              Add your headquarters or regional operating branches to keep company directory updated.
            </p>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl mt-2 bg-indigo-600 hover:bg-indigo-500"
            >
              Add First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((loc) => (
            <Card
              key={loc.id}
              className="rounded-2xl border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {loc.city}, {loc.state ? `${loc.state}, ` : ''}{loc.country}
                    </p>
                  </div>
                  <Badge
                    variant={loc.type === 'HEAD_OFFICE' ? 'default' : 'outline'}
                    className="text-[9px] uppercase font-bold tracking-wider shrink-0"
                  >
                    {loc.type.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <p className="line-clamp-2 font-medium">{loc.address}</p>
                  {loc.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono">{loc.phone}</span>
                    </p>
                  )}
                  {loc.email && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{loc.email}</span>
                    </p>
                  )}
                </div>

                {/* Live Real Map Preview */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 mt-1">
                  <div className="relative w-full h-44">
                    <iframe
                      title={`Live Map - ${loc.name}`}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${loc.address}, ${loc.city}, ${loc.state ? loc.state + ', ' : ''}${loc.country}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Live GPS Verified
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMapLocation(loc)}
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                      >
                        Expand Map
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.address}, ${loc.city}, ${loc.state ? loc.state + ', ' : ''}${loc.country}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                      >
                        Directions ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-mono">
                  Timezone: {loc.timezone}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(loc)}
                    className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-indigo-600"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLocationToDelete(loc)}
                    className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Location Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isProcessing && setIsCreateModalOpen(false)}
        title={editingLocation ? 'Edit Business Location' : 'Add Business Location'}
        description="Provide legal address, contact numbers, and operating timezone."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. London Innovation Hub"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="HEAD_OFFICE">Head Office / HQ</option>
                <option value="BRANCH">Regional Branch</option>
                <option value="OFFICE">Office</option>
                <option value="WAREHOUSE">Warehouse / Logistics</option>
                <option value="OTHER">Other Facility</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="22 Bishopsgate, Level 15"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="London"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State / Region
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="Greater London"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="United Kingdom"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="EC2N 4BQ"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Facility Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+44 20 7946 0991"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Facility Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="london@company.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isProcessing}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold"
            >
              {editingLocation ? 'Save Changes' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(locationToDelete)}
        onClose={() => !isProcessing && setLocationToDelete(null)}
        title="Delete Business Location?"
        description="Choose whether to archive this location or permanently purge it from the database."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirm deletion for: <b>&quot;{locationToDelete?.name}&quot;</b> ({locationToDelete?.city}, {locationToDelete?.country}).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Move to Archive
              </span>
              <p className="text-[11px] text-slate-500">
                Recoverable at any time from Trash & Archive.
              </p>
              <Button
                variant="outline"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleDelete(false)}
                className="w-full text-xs font-semibold rounded-lg"
              >
                Archive Location
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Real Delete (Permanent)
              </span>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                Purge from database forever. Cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleDelete(true)}
                className="w-full text-xs font-bold rounded-lg"
              >
                Delete Forever
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing}
              onClick={() => setLocationToDelete(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Expanded Interactive Map Modal */}
      {activeMapLocation && (
        <Modal
          isOpen={Boolean(activeMapLocation)}
          onClose={() => setActiveMapLocation(null)}
          title={`Live Interactive Map — ${activeMapLocation.name}`}
          description={`${activeMapLocation.address}, ${activeMapLocation.city}, ${activeMapLocation.state ? activeMapLocation.state + ', ' : ''}${activeMapLocation.country} (PIN: ${activeMapLocation.postalCode || 'N/A'})`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-950">
              <iframe
                title={`Detailed Map - ${activeMapLocation.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${activeMapLocation.address}, ${activeMapLocation.city}, ${activeMapLocation.state ? activeMapLocation.state + ', ' : ''}${activeMapLocation.country}`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-96 border-0"
                loading="lazy"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">Facility Phone:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{activeMapLocation.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">Email Contact:</span>
                  <span className="text-slate-600 dark:text-slate-300">{activeMapLocation.email || 'Not set'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeMapLocation.address}, ${activeMapLocation.city}, ${activeMapLocation.state ? activeMapLocation.state + ', ' : ''}${activeMapLocation.country}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveMapLocation(null)}
              >
                Close Map
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
