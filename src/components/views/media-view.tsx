'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Folder,
  Check,
  UploadCloud,
  X,
  FileText,
  AlertCircle,
  HardDrive,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  Download,
  Info,
  Layers,
  Sparkles,
  MoveRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

interface MediaAsset {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  publicId?: string | null;
  resourceType?: string;
  format?: string | null;
  duration?: number | null;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  folder: string;
  tagsJson?: string | null;
  createdAt: string;
}

interface StorageStats {
  totalCount: number;
  totalBytes: number;
  imageCount: number;
  videoCount: number;
  cloudinary: {
    configured: boolean;
    cloudName: string | null;
    provider: string;
    status: string;
  };
}

const PRESET_FOLDERS = [
  'Root',
  'SocialFlow',
  'Campaigns',
  'Posts',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'TikTok',
  'Other',
];

export default function MediaView() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<string[]>(PRESET_FOLDERS);
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StorageStats | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [targetFolder, setTargetFolder] = useState<string>('Root');
  const [customFolder, setCustomFolder] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Details Modal State
  const [inspectAsset, setInspectAsset] = useState<MediaAsset | null>(null);
  const [isMovingFolder, setIsMovingFolder] = useState<boolean>(false);
  const [newFolderSelect, setNewFolderSelect] = useState<string>('');

  // Delete Confirmation Modal State
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'permanent'>('soft');

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFolder !== 'ALL') params.set('folder', selectedFolder);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/media?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        if (data.folders) {
          const combined = Array.from(new Set([...PRESET_FOLDERS, ...data.folders]));
          setFolders(combined);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        showToast('Failed to load media assets', 'error');
      }
    } catch {
      showToast('Network error loading media library', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder]);

  // Clean up object URL previews to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    setSelectedFile(file);

    // Sanitize and set default display name
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setDisplayName(nameWithoutExt);

    // Create instant local preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please choose a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadError(null);

    // Simulated smooth progress while network executes
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 300);

    try {
      const finalFolder = targetFolder === 'CUSTOM' ? customFolder.trim() || 'Root' : targetFolder;

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', displayName.trim() || selectedFile.name);
      formData.append('folder', finalFolder);
      if (tagsInput.trim()) {
        formData.append('tags', tagsInput.trim());
      }

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const json = await res.json();

      if (res.ok) {
        showToast('Asset uploaded to Cloudinary successfully!', 'success');
        setIsUploadOpen(false);
        resetUploadState();
        fetchMedia();
      } else {
        setUploadError(json.error || 'Upload failed');
        showToast(json.error || 'Upload failed', 'error');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadError(err.message || 'Network error during upload');
      showToast('Network error during upload', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setDisplayName('');
    setTargetFolder('Root');
    setCustomFolder('');
    setTagsInput('');
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Cloudinary Secure URL copied to clipboard!', 'info');
  };

  const handleMoveFolder = async () => {
    if (!inspectAsset || !newFolderSelect) return;
    try {
      const res = await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inspectAsset.id,
          folder: newFolderSelect,
        }),
      });
      if (res.ok) {
        showToast(`Asset moved to "${newFolderSelect}"`, 'success');
        setInspectAsset((prev) => (prev ? { ...prev, folder: newFolderSelect } : null));
        setIsMovingFolder(false);
        fetchMedia();
      } else {
        showToast('Failed to move asset', 'error');
      }
    } catch {
      showToast('Network error moving asset', 'error');
    }
  };

  const executeDelete = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    try {
      const isPermanent = deleteMode === 'permanent';
      const res = await fetch(`/api/media?id=${assetToDelete.id}&permanent=${isPermanent}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || 'Asset deleted successfully', 'success');
        setAssetToDelete(null);
        if (inspectAsset?.id === assetToDelete.id) setInspectAsset(null);
        fetchMedia();
      } else {
        showToast(json.error || 'Failed to delete asset', 'error');
      }
    } catch {
      showToast('Network error deleting asset', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Cloudinary Status Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Media Hub
            </Badge>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloudinary CDN Active ({stats?.cloudinary.cloudName || 'dme6gzoic'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Media Asset Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Production Cloudinary-backed digital asset depot for high-res images, videos, and multi-network campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMedia}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>
          <Button
            onClick={() => {
              resetUploadState();
              setIsUploadOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl text-xs h-9 shadow-md shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Media Asset</span>
          </Button>
        </div>
      </div>

      {/* Storage Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Assets</span>
            <HardDrive className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.totalCount ?? assets.length}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CDN Storage</span>
            <CloudinaryIcon className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatBytes(stats?.totalBytes ?? 0)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Photos</span>
            <ImageIcon className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.imageCount ?? assets.filter((a) => a.resourceType !== 'video').length}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Videos</span>
            <Video className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {stats?.videoCount ?? assets.filter((a) => a.resourceType === 'video').length}
          </p>
        </div>
      </div>

      {/* Folders & Filters Control Bar */}
      <div className="space-y-3 bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Folders pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedFolder('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedFolder === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All Folders</span>
            </button>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedFolder === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Folder className="h-3.5 w-3.5 text-indigo-400" />
                <span>{f}</span>
              </button>
            ))}
          </div>

          {/* Search & View toggles */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search assets by title, tag, format..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="List View"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Display */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200/50 dark:border-slate-800/50"
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/30 text-center py-16 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No media assets found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              {searchQuery
                ? `No assets matching "${searchQuery}" in folder ${selectedFolder}.`
                : `Upload high-resolution photos and videos directly to Cloudinary CDN for instant multi-network publishing.`}
            </p>
            <Button
              size="sm"
              onClick={() => {
                resetUploadState();
                setIsUploadOpen(true);
              }}
              className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              Upload Asset Now
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => {
            const isVideo = asset.resourceType === 'video' || asset.mimeType?.startsWith('video/');

            return (
              <div
                key={asset.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden flex flex-col justify-between hover:border-indigo-500/50 dark:hover:border-indigo-500/40 hover:shadow-lg transition-all duration-200"
              >
                {/* Media Preview Container */}
                <div
                  className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={() => setInspectAsset(asset)}
                >
                  {isVideo ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg">
                          <Video className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  )}

                  {/* Folder badge */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] text-white font-mono flex items-center gap-1">
                    <Folder className="w-3 h-3 text-indigo-400" />
                    {asset.folder}
                  </span>

                  {/* Format tag */}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] text-slate-300 font-mono uppercase font-bold">
                    {asset.format || (isVideo ? 'MP4' : 'IMG')}
                  </span>
                </div>

                {/* Info & Metadata */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-500"
                      title={asset.originalName}
                      onClick={() => setInspectAsset(asset)}
                    >
                      {asset.originalName}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                      <span>{formatBytes(asset.sizeBytes)}</span>
                      <span>
                        {asset.width && asset.height ? `${asset.width}×${asset.height}` : new Date(asset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(asset.url)}
                      className="h-7 text-[11px] flex-1 rounded-lg cursor-pointer"
                      title="Copy CDN URL"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy URL
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectAsset(asset)}
                      className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Inspect Details"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setAssetToDelete(asset);
                        setDeleteMode('soft');
                      }}
                      className="h-7 w-7 p-0 rounded-lg cursor-pointer"
                      title="Move to Trash"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Asset</th>
                  <th className="p-3 font-semibold">Folder</th>
                  <th className="p-3 font-semibold">Format</th>
                  <th className="p-3 font-semibold">Dimensions</th>
                  <th className="p-3 font-semibold">Size</th>
                  <th className="p-3 font-semibold">Uploaded</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assets.map((asset) => {
                  const isVideo = asset.resourceType === 'video' || asset.mimeType?.startsWith('video/');
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer"
                            onClick={() => setInspectAsset(asset)}
                          >
                            {isVideo ? (
                              <Video className="w-4 h-4 text-purple-400" />
                            ) : (
                              <img src={asset.url} alt={asset.originalName} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p
                              className="font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-500"
                              onClick={() => setInspectAsset(asset)}
                            >
                              {asset.originalName}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">
                              {asset.publicId || asset.filename}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">
                          {asset.folder}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono uppercase text-slate-600 dark:text-slate-400">
                        {asset.format || (isVideo ? 'mp4' : 'img')}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {asset.width && asset.height ? `${asset.width} × ${asset.height}` : '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {formatBytes(asset.sizeBytes)}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(asset.url)}
                            className="h-7 w-7 p-0"
                            title="Copy URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectAsset(asset)}
                            className="h-7 w-7 p-0"
                            title="Inspect"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setAssetToDelete(asset);
                              setDeleteMode('soft');
                            }}
                            className="h-7 w-7 p-0"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REAL CLOUDINARY UPLOAD MODAL */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          if (!isUploading) {
            setIsUploadOpen(false);
            resetUploadState();
          }
        }}
        title="Upload Media Asset to Cloudinary"
        description="Select images or videos from your workstation. Stored permanently on Cloudinary CDN."
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
          {/* Drag & Drop Box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-400'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept="image/*,video/*"
              className="hidden"
            />

            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Drag and drop your media file here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                    >
                      browse workstation
                    </button>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP, GIF, SVG (up to 20MB) & MP4, MOV, WEBM (up to 60MB)
                  </p>
                </div>
              </div>
            ) : (
              /* Pre-upload File Preview */
              <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                <div className="w-24 h-24 rounded-xl bg-black overflow-hidden shrink-0 border border-slate-700/60 flex items-center justify-center">
                  {selectedFile.type.startsWith('video/') ? (
                    <video src={previewUrl || ''} className="w-full h-full object-cover" />
                  ) : (
                    <img src={previewUrl || ''} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {formatBytes(selectedFile.size)}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedFile.type || 'application/octet-stream'}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Ready for Cloudinary upload
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetUploadState}
                  disabled={isUploading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Uploading to Cloudinary CDN...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error notice */}
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Asset Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Q4 Campaign Banner"
                disabled={isUploading}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Folder
                </label>
                <select
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {folders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="CUSTOM">+ New Folder</option>
                </select>
              </div>

              {targetFolder === 'CUSTOM' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={customFolder}
                    onChange={(e) => setCustomFolder(e.target.value)}
                    placeholder="e.g. Seasonal 2026"
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="marketing, promo, q4"
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              disabled={isUploading}
              onClick={() => {
                setIsUploadOpen(false);
                resetUploadState();
              }}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isUploading}
              disabled={!selectedFile || isUploading}
              className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" />
              <span>Upload to Cloudinary</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* INSPECT ASSET DETAILS MODAL */}
      <Modal
        isOpen={Boolean(inspectAsset)}
        onClose={() => {
          setInspectAsset(null);
          setIsMovingFolder(false);
        }}
        title={inspectAsset?.originalName || 'Asset Specifications'}
        description="Cloudinary CDN metadata, delivery coordinates, and management actions."
        maxWidth="lg"
      >
        {inspectAsset && (
          <div className="space-y-4 pt-2 text-xs">
            {/* Full View */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[55vh]">
              {inspectAsset.resourceType === 'video' || inspectAsset.mimeType?.startsWith('video/') ? (
                <video src={inspectAsset.url} controls className="max-h-[55vh] w-full" />
              ) : (
                <img src={inspectAsset.url} alt={inspectAsset.originalName} className="max-h-[55vh] object-contain" />
              )}
            </div>

            {/* Technical Specifications Grid */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Cloudinary Secure URL:</span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={inspectAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:underline truncate max-w-[200px]"
                  >
                    {inspectAsset.url}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyLink(inspectAsset.url)}
                    className="h-6 w-6 p-0"
                    title="Copy URL"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Public ID:</span>
                <span className="font-mono text-slate-900 dark:text-white">{inspectAsset.publicId || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Current Folder:</span>
                {!isMovingFolder ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{inspectAsset.folder}</Badge>
                    <button
                      onClick={() => {
                        setIsMovingFolder(true);
                        setNewFolderSelect(inspectAsset.folder);
                      }}
                      className="text-indigo-500 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={newFolderSelect}
                      onChange={(e) => setNewFolderSelect(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      {folders.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={handleMoveFolder} className="h-6 text-[10px] px-2">
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsMovingFolder(false)} className="h-6 text-[10px] px-2">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Resolution:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {inspectAsset.width && inspectAsset.height ? `${inspectAsset.width} × ${inspectAsset.height}` : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">File Size:</span>
                <span className="font-mono text-slate-900 dark:text-white">{formatBytes(inspectAsset.sizeBytes)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Uploaded At:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date(inspectAsset.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <a
                  href={inspectAsset.url}
                  download={inspectAsset.originalName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink(inspectAsset.url)}
                  className="rounded-xl text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy CDN URL</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setAssetToDelete(inspectAsset);
                    setDeleteMode('soft');
                  }}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Move to Trash</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE / TRASH CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(assetToDelete)}
        onClose={() => setAssetToDelete(null)}
        title={deleteMode === 'soft' ? 'Move Media Asset to Trash?' : 'Permanently Purge Media Asset?'}
        description={
          deleteMode === 'soft'
            ? `Asset "${assetToDelete?.originalName}" will be safely placed in Central Trash. You can restore it at any time.`
            : `CRITICAL ACTION: This will permanently delete "${assetToDelete?.originalName}" from Cloudinary CDN and purge database records forever.`
        }
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {/* Radio toggle for delete mode */}
          <div className="space-y-2">
            <div
              onClick={() => setDeleteMode('soft')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                deleteMode === 'soft'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <input
                type="radio"
                checked={deleteMode === 'soft'}
                onChange={() => setDeleteMode('soft')}
                className="mt-0.5"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Move to Trash (Soft Delete)</p>
                <p className="text-[11px] text-slate-500">
                  Safely retained in Central Trash. Can be restored anytime with 1 click.
                </p>
              </div>
            </div>

            <div
              onClick={() => setDeleteMode('permanent')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                deleteMode === 'permanent'
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <input
                type="radio"
                checked={deleteMode === 'permanent'}
                onChange={() => setDeleteMode('permanent')}
                className="mt-0.5"
              />
              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Permanently Delete (Cloudinary & Database)</p>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                  Permanently removes this asset from Cloudinary storage CDN and database records.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setAssetToDelete(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant={deleteMode === 'permanent' ? 'destructive' : 'default'}
              size="sm"
              isLoading={isDeleting}
              onClick={executeDelete}
              className={`rounded-xl ${deleteMode === 'soft' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
            >
              {deleteMode === 'soft' ? 'Move to Trash' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CloudinaryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
    </svg>
  );
}
