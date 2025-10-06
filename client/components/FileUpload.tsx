import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image as ImageIcon, Video, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import CloudinaryService, { CloudinaryUploadResult, CloudinaryUploadOptions } from '@/lib/cloudinary';
import { CloudinaryUtils } from '@/lib/cloudinary';

interface FileUploadProps {
  onUploadComplete: (result: CloudinaryUploadResult) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  maxFileSize?: number; // in MB
  folder?: string;
  tags?: string[];
  className?: string;
  disabled?: boolean;
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  uploadProgress?: number;
  uploadResult?: CloudinaryUploadResult;
  uploadError?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  uploadProgress,
  uploadResult,
  uploadError
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const getStatusIcon = () => {
    if (uploadError) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (uploadResult) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (uploadProgress !== undefined) return <Upload className="w-4 h-4 text-blue-500" />;
    return null;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={file.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {getFileIcon()}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              {getStatusIcon()}
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {CloudinaryUtils.formatFileSize(file.size)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
              </Badge>
            </div>

            {uploadProgress !== undefined && (
              <div className="mt-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {uploadError && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {uploadError}
                </AlertDescription>
              </Alert>
            )}

            {uploadResult && (
              <div className="mt-2">
                <Badge variant="default" className="text-xs">
                  Upload Complete
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  Public ID: {uploadResult.public_id}
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = "image/*,video/*",
  maxFileSize = 10,
  folder = "narayanganj-traveller",
  tags = [],
  className = "",
  disabled = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadResults, setUploadResults] = useState<{ [key: string]: CloudinaryUploadResult }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      // Validate file type
      if (!CloudinaryUtils.validateFileType(file, accept.split(',').map(type => type.trim()))) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      // Validate file size
      if (!CloudinaryUtils.validateFileSize(file, maxFileSize)) {
        errors.push(`${file.name}: File too large (max ${maxFileSize}MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      if (multiple) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        setFiles(validFiles);
      }
    }
  }, [accept, maxFileSize, multiple]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    const fileName = files[index]?.name;
    if (fileName) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
      setUploadResults(prev => {
        const newResults = { ...prev };
        delete newResults[fileName];
        return newResults;
      });
      setUploadErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fileName];
        return newErrors;
      });
    }
  }, [files]);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadOptions: CloudinaryUploadOptions = {
      folder,
      tags,
      quality: 'auto',
      format: 'auto'
    };

    try {
      if (multiple) {
        // Upload multiple files
        const results = await CloudinaryService.uploadMultipleFiles(files, uploadOptions);
        
        results.forEach((result, index) => {
          const fileName = files[index].name;
          setUploadResults(prev => ({ ...prev, [fileName]: result }));
          onUploadComplete(result);
        });

        toast.success(`${results.length} files uploaded successfully!`);
      } else {
        // Upload single file
        const file = files[0];
        const result = await CloudinaryService.uploadFile(file, uploadOptions);
        
        setUploadResults(prev => ({ ...prev, [file.name]: result }));
        onUploadComplete(result);
        
        toast.success('File uploaded successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      files.forEach(file => {
        setUploadErrors(prev => ({ ...prev, [file.name]: errorMessage }));
      });
      onUploadError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [files, folder, tags, multiple, onUploadComplete, onUploadError]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setUploadProgress({});
    setUploadResults({});
    setUploadErrors({});
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {multiple ? 'Upload Files' : 'Upload File'}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop your files here, or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="outline">Max {maxFileSize}MB</Badge>
            <Badge variant="outline">
              {accept.includes('image') ? 'Images' : ''}
              {accept.includes('image') && accept.includes('video') ? ', ' : ''}
              {accept.includes('video') ? 'Videos' : ''}
            </Badge>
          </div>
          <Button
            variant="outline"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFiles}
                disabled={uploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.length === 0}
                className="min-w-[100px]"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
                uploadProgress={uploadProgress[file.name]}
                uploadResult={uploadResults[file.name]}
                uploadError={uploadErrors[file.name]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
