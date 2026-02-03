'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  File,
  FileCode,
  FileText,
  Video,
  Image,
  Music,
  Box,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProjectsStore } from '@/stores/projects-store';

// File type configurations
const FILE_TYPES = {
  // Code
  'application/zip': { icon: FileCode, label: 'ZIP Archive', maxSize: 100 },
  'application/x-zip-compressed': { icon: FileCode, label: 'ZIP Archive', maxSize: 100 },
  'text/javascript': { icon: FileCode, label: 'JavaScript', maxSize: 10 },
  'application/javascript': { icon: FileCode, label: 'JavaScript', maxSize: 10 },
  'text/typescript': { icon: FileCode, label: 'TypeScript', maxSize: 10 },
  'text/x-python': { icon: FileCode, label: 'Python', maxSize: 10 },
  'text/plain': { icon: FileText, label: 'Text File', maxSize: 10 },

  // Documents
  'application/pdf': { icon: FileText, label: 'PDF', maxSize: 50 },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    icon: FileText,
    label: 'PowerPoint',
    maxSize: 50,
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: FileText,
    label: 'Word Document',
    maxSize: 50,
  },
  'text/markdown': { icon: FileText, label: 'Markdown', maxSize: 10 },

  // Video
  'video/mp4': { icon: Video, label: 'MP4 Video', maxSize: 500 },
  'video/quicktime': { icon: Video, label: 'QuickTime', maxSize: 500 },
  'video/webm': { icon: Video, label: 'WebM Video', maxSize: 500 },

  // Images
  'image/png': { icon: Image, label: 'PNG Image', maxSize: 20 },
  'image/jpeg': { icon: Image, label: 'JPEG Image', maxSize: 20 },
  'image/webp': { icon: Image, label: 'WebP Image', maxSize: 20 },
  'image/svg+xml': { icon: Image, label: 'SVG Image', maxSize: 5 },

  // Audio
  'audio/mpeg': { icon: Music, label: 'MP3 Audio', maxSize: 50 },
  'audio/wav': { icon: Music, label: 'WAV Audio', maxSize: 100 },

  // 3D
  'model/stl': { icon: Box, label: 'STL Model', maxSize: 200 },
  'application/octet-stream': { icon: File, label: 'Binary File', maxSize: 200 },
};

const ACCEPTED_TYPES = Object.keys(FILE_TYPES).join(',');

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface ArtifactUploaderProps {
  projectId: string;
  onUploadComplete?: () => void;
  className?: string;
}

export function ArtifactUploader({
  projectId,
  onUploadComplete,
  className,
}: ArtifactUploaderProps) {
  const { setUploadProgress, addArtifact } = useProjectsStore();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const config = FILE_TYPES[file.type as keyof typeof FILE_TYPES];
    if (!config) {
      return `Unsupported file type: ${file.type || 'unknown'}`;
    }
    if (file.size > config.maxSize * 1024 * 1024) {
      return `File too large. Maximum size is ${config.maxSize}MB`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const uploads: FileUpload[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      progress: 0,
      status: 'pending',
    }));

    // Validate files
    uploads.forEach((upload) => {
      const error = validateFile(upload.file);
      if (error) {
        upload.status = 'error';
        upload.error = error;
      }
    });

    setFiles((prev) => [...prev, ...uploads]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const uploadFile = async (upload: FileUpload) => {
    try {
      // Update status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === upload.id ? { ...f, status: 'uploading' as const } : f
        )
      );

      // Get signed URL
      const signedUrlRes = await fetch('/api/projects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          fileName: upload.file.name,
          fileType: upload.file.type,
          fileSize: upload.file.size,
        }),
      });

      if (!signedUrlRes.ok) {
        const error = await signedUrlRes.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, filePath, bucket } = await signedUrlRes.json();

      // Upload file with progress
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f) => (f.id === upload.id ? { ...f, progress } : f))
          );
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', upload.file.type);
        xhr.send(upload.file);
      });

      // Create artifact record
      const artifactRes = await fetch(`/api/projects/${projectId}/artifacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: upload.file.name,
          file_path: filePath,
          file_type: upload.file.name.split('.').pop() || 'unknown',
          file_size: upload.file.size,
          mime_type: upload.file.type,
          storage_bucket: bucket,
        }),
      });

      if (!artifactRes.ok) {
        throw new Error('Failed to create artifact record');
      }

      const { artifact } = await artifactRes.json();
      addArtifact(artifact);

      // Update status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === upload.id
            ? { ...f, status: 'completed' as const, progress: 100 }
            : f
        )
      );
    } catch (error) {
      console.error('Upload error:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === upload.id
            ? {
                ...f,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    await Promise.all(pendingFiles.map(uploadFile));
    onUploadComplete?.();
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const completedCount = files.filter((f) => f.status === 'completed').length;

  const getFileIcon = (file: File) => {
    const config = FILE_TYPES[file.type as keyof typeof FILE_TYPES];
    return config?.icon || File;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
            : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--background-tertiary)]'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--primary-muted)] flex items-center justify-center">
            <Upload className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <p className="font-medium">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-[var(--foreground-muted)]">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            Supports code, documents, videos, images, and 3D models
          </p>
        </div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((upload) => {
              const FileIcon = getFileIcon(upload.file);
              return (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg',
                    'bg-[var(--background-secondary)] border border-[var(--border)]'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      upload.status === 'error'
                        ? 'bg-[var(--danger-muted)]'
                        : upload.status === 'completed'
                        ? 'bg-[var(--success-muted)]'
                        : 'bg-[var(--primary-muted)]'
                    )}
                  >
                    <FileIcon
                      className={cn(
                        'w-5 h-5',
                        upload.status === 'error'
                          ? 'text-[var(--danger)]'
                          : upload.status === 'completed'
                          ? 'text-[var(--success)]'
                          : 'text-[var(--primary)]'
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{upload.file.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className="h-1 mt-1" />
                    )}
                    {upload.status === 'error' && upload.error && (
                      <p className="text-xs text-[var(--danger)] mt-1">
                        {upload.error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {upload.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
                    )}
                    {upload.status === 'completed' && (
                      <Check className="w-5 h-5 text-[var(--success)]" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
                    )}
                    {(upload.status === 'pending' || upload.status === 'error') && (
                      <button
                        onClick={() => removeFile(upload.id)}
                        className="p-1 rounded hover:bg-[var(--background-tertiary)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--foreground-muted)]">
            {completedCount} of {files.length} uploaded
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setFiles([])}
              disabled={uploadingCount > 0}
            >
              Clear all
            </Button>
            <Button
              onClick={uploadAll}
              disabled={pendingCount === 0 || uploadingCount > 0}
            >
              {uploadingCount > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
