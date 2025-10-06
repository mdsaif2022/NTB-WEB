import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, Video, Search, Settings } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';
import MediaGallery from '@/components/MediaGallery';
import { useFileUpload, useMediaGallery, useImageOptimization, useVideoManagement } from '@/hooks/useCloudinary';
import CloudinaryService from '@/lib/cloudinary';

const CloudinaryExample: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upload');
  
  const { uploadResults, clearResults } = useFileUpload();
  const { mediaItems, refresh } = useMediaGallery({
    folder: 'narayanganj-traveller',
    resourceType: 'all'
  });
  const { getOptimizedImageUrl, getResponsiveImageUrls, getThumbnailUrl } = useImageOptimization();
  const { getVideoUrl, getVideoThumbnail } = useVideoManagement();

  const handleUploadComplete = (result: any) => {
    console.log('Upload completed:', result);
    toast.success('File uploaded successfully!');
    refresh(); // Refresh the gallery
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    toast.error(`Upload failed: ${error}`);
  };

  const handleMediaSelect = (item: any) => {
    setSelectedMedia(item);
    console.log('Media selected:', item);
  };

  const handleMediaDelete = (publicId: string) => {
    console.log('Media deleted:', publicId);
    refresh(); // Refresh the gallery
  };

  const generateOptimizedUrls = (publicId: string) => {
    if (!publicId) return null;

    const optimized = getOptimizedImageUrl(publicId, {
      width: 800,
      height: 600,
      quality: 'auto',
      crop: 'fill'
    });

    const responsive = getResponsiveImageUrls(publicId);
    const thumbnail = getThumbnailUrl(publicId, 200);

    return { optimized, responsive, thumbnail };
  };

  const generateVideoUrls = (publicId: string) => {
    if (!publicId) return null;

    const videoUrl = getVideoUrl(publicId, {
      width: 800,
      height: 600,
      quality: 'auto'
    });

    const thumbnail = getVideoThumbnail(publicId, 2);

    return { videoUrl, thumbnail };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="w-6 h-6" />
            <span>Cloudinary Media Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg mb-2">
                {mediaItems.length}
              </Badge>
              <p className="text-sm text-gray-600">Total Media Items</p>
            </div>
            <div className="text-center">
              <Badge variant="default" className="text-lg mb-2">
                {uploadResults.length}
              </Badge>
              <p className="text-sm text-gray-600">Recent Uploads</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-lg mb-2">
                {mediaItems.filter(item => item.resource_type === 'image').length}
              </Badge>
              <p className="text-sm text-gray-600">Images</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Optimization</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Examples</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Media Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                multiple={true}
                accept="image/*,video/*"
                maxFileSize={50}
                folder="narayanganj-traveller"
                tags={['example', 'demo']}
              />
            </CardContent>
          </Card>

          {uploadResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Uploads</CardTitle>
                  <Button variant="outline" size="sm" onClick={clearResults}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadResults.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <img
                          src={result.resource_type === 'image' 
                            ? getThumbnailUrl(result.public_id, 150)
                            : getVideoThumbnail(result.public_id)
                          }
                          alt={result.public_id}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <div className="space-y-2">
                          <p className="text-sm font-medium truncate">
                            {result.public_id.split('/').pop()}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {result.resource_type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.format}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {result.width} × {result.height}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <MediaGallery
            onSelect={handleMediaSelect}
            onDelete={handleMediaDelete}
            folder="narayanganj-traveller"
            resourceType="all"
          />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Optimization Examples</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMedia && selectedMedia.resource_type === 'image' ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Original Image</h4>
                    <img
                      src={selectedMedia.secure_url}
                      alt="Original"
                      className="max-w-full h-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Size: {selectedMedia.width} × {selectedMedia.height} | 
                      Format: {selectedMedia.format}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Optimized (800×600, Auto Quality)</h4>
                    <img
                      src={getOptimizedImageUrl(selectedMedia.public_id, {
                        width: 800,
                        height: 600,
                        quality: 'auto',
                        crop: 'fill'
                      })}
                      alt="Optimized"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Thumbnail (200×200)</h4>
                    <img
                      src={getThumbnailUrl(selectedMedia.public_id, 200)}
                      alt="Thumbnail"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Responsive URLs</h4>
                    <div className="space-y-2">
                      {Object.entries(getResponsiveImageUrls(selectedMedia.public_id)).map(([size, url]) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Badge variant="outline" className="w-20">
                            {size}
                          </Badge>
                          <code className="text-xs bg-gray-100 p-1 rounded flex-1 truncate">
                            {url}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : selectedMedia && selectedMedia.resource_type === 'video' ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Original Video</h4>
                    <video
                      src={selectedMedia.secure_url}
                      controls
                      className="max-w-full h-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Format: {selectedMedia.format}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Optimized Video (800×600)</h4>
                    <video
                      src={getVideoUrl(selectedMedia.public_id, {
                        width: 800,
                        height: 600,
                        quality: 'auto'
                      })}
                      controls
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Video Thumbnail</h4>
                    <img
                      src={getVideoThumbnail(selectedMedia.public_id, 3)}
                      alt="Video Thumbnail"
                      className="w-64 h-36 object-cover rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Media Selected</h3>
                  <p className="text-gray-500">
                    Select a media item from the gallery to see optimization examples
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">1. Basic File Upload</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import FileUpload from '@/components/FileUpload';

<FileUpload
  onUploadComplete={(result) => {
    console.log('Upload completed:', result);
  }}
  multiple={true}
  accept="image/*,video/*"
  maxFileSize={10}
  folder="my-folder"
  tags={['tag1', 'tag2']}
/>`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Media Gallery</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import MediaGallery from '@/components/MediaGallery';

<MediaGallery
  onSelect={(item) => {
    console.log('Selected:', item);
  }}
  onDelete={(publicId) => {
    console.log('Deleted:', publicId);
  }}
  folder="my-folder"
  resourceType="image"
/>`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">3. Image Optimization</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { useImageOptimization } from '@/hooks/useCloudinary';

const { getOptimizedImageUrl, getThumbnailUrl } = useImageOptimization();

// Get optimized image
const optimizedUrl = getOptimizedImageUrl('public-id', {
  width: 800,
  height: 600,
  quality: 'auto',
  crop: 'fill'
});

// Get thumbnail
const thumbnailUrl = getThumbnailUrl('public-id', 200);`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">4. Video Management</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { useVideoManagement } from '@/hooks/useCloudinary';

const { getVideoUrl, getVideoThumbnail } = useVideoManagement();

// Get optimized video
const videoUrl = getVideoUrl('public-id', {
  width: 800,
  height: 600,
  quality: 'auto'
});

// Get video thumbnail
const thumbnailUrl = getVideoThumbnail('public-id', 2);`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudinaryExample;
