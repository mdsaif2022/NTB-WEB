import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Grid, 
  List, 
  Download, 
  Trash2, 
  Eye, 
  Image as ImageIcon, 
  Video,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import CloudinaryService, { CloudinaryUploadResult } from '@/lib/cloudinary';
import { CloudinaryUtils } from '@/lib/cloudinary';

interface MediaItem {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: 'image' | 'video' | 'raw';
  folder?: string;
  tags?: string[];
}

interface MediaGalleryProps {
  onSelect?: (item: MediaItem) => void;
  onDelete?: (publicId: string) => void;
  folder?: string;
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'all';
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  onSelect,
  onDelete,
  folder,
  tags,
  resourceType = 'all',
  className = ""
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [sortBy, setSortBy] = useState<'created_at' | 'bytes' | 'width'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load media items
  const loadMediaItems = async () => {
    setLoading(true);
    try {
      const searchOptions: any = {
        max_results: 50,
        sort_by: [{ [sortBy]: sortOrder }]
      };

      if (folder) {
        searchOptions.folder = folder;
      }

      if (tags && tags.length > 0) {
        searchOptions.tags = tags;
      }

      if (resourceType !== 'all') {
        searchOptions.resource_type = resourceType;
      }

      const result = await CloudinaryService.searchFiles(searchOptions);
      setMediaItems(result.resources || []);
    } catch (error) {
      console.error('Error loading media items:', error);
      toast.error('Failed to load media items');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort items
  useEffect(() => {
    let filtered = mediaItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.public_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'bytes':
          aValue = a.bytes;
          bValue = b.bytes;
          break;
        case 'width':
          aValue = a.width;
          bValue = b.width;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredItems(filtered);
  }, [mediaItems, searchTerm, sortBy, sortOrder]);

  // Load items on component mount
  useEffect(() => {
    loadMediaItems();
  }, [folder, tags, resourceType, sortBy, sortOrder]);

  const handleDelete = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const item = mediaItems.find(item => item.public_id === publicId);
      if (!item) return;

      await CloudinaryService.deleteFile(publicId, item.resource_type);
      setMediaItems(prev => prev.filter(item => item.public_id !== publicId));
      onDelete?.(publicId);
      toast.success('Media item deleted successfully');
    } catch (error) {
      console.error('Error deleting media item:', error);
      toast.error('Failed to delete media item');
    }
  };

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.secure_url;
    link.download = `${item.public_id}.${item.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getThumbnailUrl = (item: MediaItem) => {
    if (item.resource_type === 'image') {
      return CloudinaryService.getThumbnailUrl(item.public_id, 200);
    } else if (item.resource_type === 'video') {
      return CloudinaryService.getVideoThumbnail(item.public_id);
    }
    return item.secure_url;
  };

  const MediaItemCard: React.FC<{ item: MediaItem }> = ({ item }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={getThumbnailUrl(item)}
            alt={item.public_id}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedItem(item)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownload(item)}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(item.public_id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {item.resource_type.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {CloudinaryUtils.formatFileSize(item.bytes)}
            </Badge>
          </div>
          
          <p className="text-sm font-medium text-gray-900 truncate mb-1">
            {item.public_id.split('/').pop()}
          </p>
          
          <p className="text-xs text-gray-500">
            {item.width} × {item.height}
          </p>
          
          {onSelect && (
            <Button
              size="sm"
              className="w-full mt-2"
              onClick={() => onSelect(item)}
            >
              Select
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const MediaItemList: React.FC<{ item: MediaItem }> = ({ item }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src={getThumbnailUrl(item)}
              alt={item.public_id}
              className="w-16 h-16 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.public_id.split('/').pop()}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {item.resource_type.toUpperCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {CloudinaryUtils.formatFileSize(item.bytes)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.width} × {item.height}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedItem(item)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownload(item)}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(item.public_id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {onSelect && (
              <Button
                size="sm"
                onClick={() => onSelect(item)}
              >
                Select
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Media Gallery</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMediaItems}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="bytes">Size</SelectItem>
                <SelectItem value="width">Dimensions</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Mode */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Items */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading media...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload some media to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-2'
        }>
          {filteredItems.map((item) => (
            viewMode === 'grid' ? (
              <MediaItemCard key={item.public_id} item={item} />
            ) : (
              <MediaItemList key={item.public_id} item={item} />
            )
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.public_id}</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex justify-center">
                {selectedItem.resource_type === 'image' ? (
                  <img
                    src={selectedItem.secure_url}
                    alt={selectedItem.public_id}
                    className="max-w-full max-h-96 object-contain rounded-lg"
                  />
                ) : selectedItem.resource_type === 'video' ? (
                  <video
                    src={selectedItem.secure_url}
                    controls
                    className="max-w-full max-h-96 rounded-lg"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedItem.resource_type}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {selectedItem.format}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {CloudinaryUtils.formatFileSize(selectedItem.bytes)}
                </div>
                <div>
                  <span className="font-medium">Dimensions:</span> {selectedItem.width} × {selectedItem.height}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(selectedItem.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Public ID:</span> {selectedItem.public_id}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedItem)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {onSelect && (
                  <Button onClick={() => onSelect(selectedItem)}>
                    Select Media
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaGallery;
