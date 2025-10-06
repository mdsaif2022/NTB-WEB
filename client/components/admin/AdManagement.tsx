import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { RTDBService, Ad } from '@/lib/rtdb';
import { toast } from 'sonner';

export default function AdManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'hero-top' as Ad['position'],
    priority: 1,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setIsLoading(true);
      const allAds = await RTDBService.getAllAds();
      setAds(allAds);
    } catch (error) {
      console.error('Error loading ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adData = {
        ...formData,
        createdBy: 'admin', // In real app, get from auth context
        priority: Number(formData.priority),
      };

      if (editingAd) {
        await RTDBService.updateAd(editingAd.id, adData);
        toast.success('Ad updated successfully');
      } else {
        await RTDBService.createAd(adData);
        toast.success('Ad created successfully');
      }

      setIsDialogOpen(false);
      setEditingAd(null);
      resetForm();
      loadAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('Failed to save ad');
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      position: ad.position,
      priority: ad.priority,
      isActive: ad.isActive,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      await RTDBService.deleteAd(adId);
      toast.success('Ad deleted successfully');
      loadAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const handleToggleStatus = async (adId: string) => {
    try {
      await RTDBService.toggleAdStatus(adId);
      toast.success('Ad status updated');
      loadAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      toast.error('Failed to update ad status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'hero-top',
      priority: 1,
      isActive: true,
      startDate: '',
      endDate: '',
    });
  };

  const handleNewAd = () => {
    setEditingAd(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ad Management</h2>
          <p className="text-gray-600">Manage advertisements displayed on your website</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewAd} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Edit Ad' : 'Create New Ad'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Ad Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value as Ad['position'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero-top">Hero Section Top</SelectItem>
                      <SelectItem value="hero-bottom">Hero Section Bottom</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="linkUrl">Click URL</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold">{ads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Ads</p>
                <p className="text-2xl font-bold">{ads.filter(ad => ad.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <EyeOff className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Inactive Ads</p>
                <p className="text-2xl font-bold">{ads.filter(ad => !ad.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Hero Top Ads</p>
                <p className="text-2xl font-bold">{ads.filter(ad => ad.position === 'hero-top').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${ad.isActive ? 'border-green-200' : 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ad.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(ad.id)}
                    >
                      {ad.isActive ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{ad.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                      {ad.position}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
                      Priority: {ad.priority}
                    </span>
                  </div>
                  {ad.linkUrl && (
                    <div className="flex items-center text-sm text-blue-600">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                        View Link
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ads yet</h3>
          <p className="text-gray-600 mb-4">Create your first advertisement to get started</p>
          <Button onClick={handleNewAd} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Ad
          </Button>
        </div>
      )}
    </div>
  );
}
