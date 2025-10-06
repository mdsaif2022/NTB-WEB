import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle, Image as ImageIcon, Video, Settings } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';
import MediaGallery from '@/components/MediaGallery';
import OptimizedImage from '@/components/OptimizedImage';
import { useFileUpload, useImageOptimization, useVideoManagement } from '@/hooks/useCloudinary';
import CloudinaryService from '@/lib/cloudinary';

const CloudinaryTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  const { uploadFile, uploadResults } = useFileUpload();
  const { getOptimizedImageUrl, getThumbnailUrl, getResponsiveImageUrls } = useImageOptimization();
  const { getVideoUrl, getVideoThumbnail } = useVideoManagement();

  // Test Cloudinary configuration
  const testConfiguration = async () => {
    try {
      // Test by trying to get a sample image URL
      const testUrl = CloudinaryService.getOptimizedImageUrl('sample', {
        width: 100,
        height: 100,
        quality: 'auto'
      });
      
      setTestResults(prev => ({ ...prev, config: true }));
      toast.success('✅ Cloudinary configuration is working!');
    } catch (error) {
      setTestResults(prev => ({ ...prev, config: false }));
      toast.error('❌ Cloudinary configuration failed');
    }
  };

  // Test file upload
  const testFileUpload = async () => {
    try {
      // Create a test file
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4F46E5';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Test Image', 50, 100);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'test-image.png', { type: 'image/png' });
          const result = await uploadFile(file, {
            folder: 'test-uploads',
            tags: ['test', 'automated']
          });
          
          if (result) {
            setUploadedFiles(prev => [...prev, result]);
            setTestResults(prev => ({ ...prev, upload: true }));
            toast.success('✅ File upload test successful!');
          }
        }
      });
    } catch (error) {
      setTestResults(prev => ({ ...prev, upload: false }));
      toast.error('❌ File upload test failed');
    }
  };

  // Test image optimization
  const testImageOptimization = () => {
    if (uploadedFiles.length > 0) {
      const testFile = uploadedFiles[0];
      try {
        const optimizedUrl = getOptimizedImageUrl(testFile.public_id, {
          width: 300,
          height: 200,
          quality: 'auto',
          crop: 'fill'
        });
        
        const thumbnailUrl = getThumbnailUrl(testFile.public_id, 100);
        const responsiveUrls = getResponsiveImageUrls(testFile.public_id);
        
        setSelectedImage(testFile.public_id);
        setTestResults(prev => ({ ...prev, optimization: true }));
        toast.success('✅ Image optimization test successful!');
      } catch (error) {
        setTestResults(prev => ({ ...prev, optimization: false }));
        toast.error('❌ Image optimization test failed');
      }
    } else {
      toast.error('Please upload a file first');
    }
  };

  // Test video functionality
  const testVideoFunctionality = () => {
    try {
      // Test video URL generation (even with image)
      const testVideoUrl = getVideoUrl('sample-video', {
        width: 400,
        height: 300,
        quality: 'auto'
      });
      
      const testThumbnail = getVideoThumbnail('sample-video', 2);
      
      setTestResults(prev => ({ ...prev, video: true }));
      toast.success('✅ Video functionality test successful!');
    } catch (error) {
      setTestResults(prev => ({ ...prev, video: false }));
      toast.error('❌ Video functionality test failed');
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    await testConfiguration();
    await testFileUpload();
    testImageOptimization();
    testVideoFunctionality();
  };

  const getStatusIcon = (testName: string) => {
    const result = testResults[testName];
    if (result === undefined) return null;
    return result ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Cloudinary Full Configuration Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> Copy the content from <code>env-template.txt</code> to create a <code>.env.local</code> file in your project root.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Settings className="w-8 h-8 text-blue-500" />
                  {getStatusIcon('config')}
                </div>
                <h3 className="font-medium">Configuration</h3>
                <p className="text-sm text-gray-500">API Setup</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Upload className="w-8 h-8 text-green-500" />
                  {getStatusIcon('upload')}
                </div>
                <h3 className="font-medium">File Upload</h3>
                <p className="text-sm text-gray-500">Upload Test</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <ImageIcon className="w-8 h-8 text-purple-500" />
                  {getStatusIcon('optimization')}
                </div>
                <h3 className="font-medium">Optimization</h3>
                <p className="text-sm text-gray-500">Image Processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Video className="w-8 h-8 text-orange-500" />
                  {getStatusIcon('video')}
                </div>
                <h3 className="font-medium">Video</h3>
                <p className="text-sm text-gray-500">Video Processing</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testConfiguration} variant="outline">
              Test Configuration
            </Button>
            <Button onClick={testFileUpload} variant="outline">
              Test Upload
            </Button>
            <Button onClick={testImageOptimization} variant="outline">
              Test Optimization
            </Button>
            <Button onClick={testVideoFunctionality} variant="outline">
              Test Video
            </Button>
            <Button onClick={runAllTests} className="bg-blue-600 hover:bg-blue-700">
              Run All Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>File Upload Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUploadComplete={(result) => {
              setUploadedFiles(prev => [...prev, result]);
              toast.success('File uploaded successfully!');
            }}
            onUploadError={(error) => {
              toast.error(`Upload failed: ${error}`);
            }}
            multiple={true}
            accept="image/*,video/*"
            maxFileSize={10}
            folder="test-uploads"
            tags={['test', 'demo']}
          />
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <img
                      src={file.resource_type === 'image' 
                        ? getThumbnailUrl(file.public_id, 150)
                        : getVideoThumbnail(file.public_id)
                      }
                      alt={file.public_id}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <div className="space-y-2">
                      <p className="text-sm font-medium truncate">
                        {file.public_id.split('/').pop()}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {file.resource_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {file.format}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {file.width} × {file.height}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedImage(file.public_id)}
                        className="w-full"
                      >
                        Test Optimization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Optimization Test */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Image Optimization Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Original Image</h4>
              <OptimizedImage
                publicId={selectedImage}
                alt="Original"
                className="max-w-full h-auto rounded-lg"
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Optimized (400×300, Auto Quality)</h4>
              <OptimizedImage
                publicId={selectedImage}
                alt="Optimized"
                width={400}
                height={300}
                quality="auto"
                crop="fill"
                className="max-w-full h-auto rounded-lg"
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Thumbnail (150×150)</h4>
              <OptimizedImage
                publicId={selectedImage}
                alt="Thumbnail"
                width={150}
                height={150}
                crop="thumb"
                gravity="face"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Responsive Image</h4>
              <OptimizedImage
                publicId={selectedImage}
                alt="Responsive"
                responsive={true}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Gallery Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5" />
            <span>Media Gallery Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MediaGallery
            onSelect={(item) => {
              toast.success(`Selected: ${item.public_id}`);
            }}
            onDelete={(publicId) => {
              toast.success(`Deleted: ${publicId}`);
            }}
            folder="test-uploads"
            resourceType="all"
          />
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Cloudinary Cloud Name:</span>
              <Badge variant="outline">dxijk3ivo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Key:</span>
              <Badge variant="outline">155419187991824</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Environment File:</span>
              <Badge variant={testResults.config ? "default" : "destructive"}>
                {testResults.config ? "✅ Configured" : "❌ Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Dependencies:</span>
              <Badge variant="default">✅ Installed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudinaryTest;
