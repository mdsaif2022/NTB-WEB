import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ToggleLeft, 
  ToggleRight, 
  CheckSquare, 
  Square, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Power,
  PowerOff,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useTours } from '@/hooks/useRTDB';

interface BulkTourManagementProps {
  className?: string;
}

const BulkTourManagement: React.FC<BulkTourManagementProps> = ({ className = '' }) => {
  const { tours, updateTour, loading } = useTours();
  const [selectedTours, setSelectedTours] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'enable' | 'disable' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle individual tour selection
  const handleTourSelect = (tourId: string, checked: boolean) => {
    if (checked) {
      setSelectedTours(prev => [...prev, tourId]);
    } else {
      setSelectedTours(prev => prev.filter(id => id !== tourId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTours(tours.map(tour => tour.id));
    } else {
      setSelectedTours([]);
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action: 'enable' | 'disable') => {
    if (selectedTours.length === 0) {
      toast.error('Please select at least one tour');
      return;
    }

    setBulkAction(action);
    setShowConfirmation(true);
  };

  // Confirm and execute bulk action
  const confirmBulkAction = async () => {
    if (!bulkAction || selectedTours.length === 0) return;

    setIsProcessing(true);
    const newStatus = bulkAction === 'enable';

    try {
      // Update all selected tours
      const updatePromises = selectedTours.map(tourId => 
        updateTour(tourId, { isActive: newStatus })
      );

      await Promise.all(updatePromises);

      toast.success(
        `Successfully ${bulkAction === 'enable' ? 'enabled' : 'disabled'} ${selectedTours.length} tour(s)`
      );

      // Reset state
      setSelectedTours([]);
      setBulkAction(null);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to update tours. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel bulk action
  const cancelBulkAction = () => {
    setBulkAction(null);
    setShowConfirmation(false);
  };

  // Quick toggle for individual tour
  const handleQuickToggle = async (tourId: string, currentStatus: boolean) => {
    try {
      await updateTour(tourId, { isActive: !currentStatus });
      toast.success(`Tour ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update tour status');
    }
  };

  // Get stats
  const activeTours = tours.filter(tour => tour.isActive).length;
  const inactiveTours = tours.filter(tour => !tour.isActive).length;
  const selectedActiveTours = selectedTours.filter(id => 
    tours.find(tour => tour.id === id)?.isActive
  ).length;
  const selectedInactiveTours = selectedTours.length - selectedActiveTours;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2">Loading tours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Bulk Actions Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Bulk Tour Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeTours}</div>
              <div className="text-sm text-green-700">Active Tours</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{inactiveTours}</div>
              <div className="text-sm text-red-700">Inactive Tours</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedTours.length}</div>
              <div className="text-sm text-blue-700">Selected</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{tours.length}</div>
              <div className="text-sm text-gray-700">Total Tours</div>
            </div>
          </div>

          {/* Bulk Action Controls */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedTours.length === tours.length && tours.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({tours.length})
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Selected:</span>
              <Badge variant="outline">{selectedTours.length}</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedTours([])}
                disabled={selectedTours.length === 0}
              >
                Clear Selection
              </Button>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleBulkAction('enable')}
                disabled={selectedTours.length === 0 || isProcessing}
              >
                <Power className="w-4 h-4 mr-2" />
                Enable Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('disable')}
                disabled={selectedTours.length === 0 || isProcessing}
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Disable Selected
              </Button>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedTours.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedTours.length}</strong> tour(s) selected
                {selectedActiveTours > 0 && (
                  <span className="ml-2">
                    • <span className="text-green-600">{selectedActiveTours} active</span>
                  </span>
                )}
                {selectedInactiveTours > 0 && (
                  <span className="ml-2">
                    • <span className="text-red-600">{selectedInactiveTours} inactive</span>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tours List with Bulk Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Tours List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  selectedTours.includes(tour.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    id={`tour-${tour.id}`}
                    checked={selectedTours.includes(tour.id)}
                    onCheckedChange={(checked) => 
                      handleTourSelect(tour.id, checked as boolean)
                    }
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{tour.title}</h3>
                      <Badge 
                        variant={tour.isActive ? "default" : "secondary"}
                        className={tour.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {tour.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>📍 {tour.location}</span>
                      <span>⏱️ {tour.duration}</span>
                      <span>💰 ৳{tour.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {tour.isActive ? 'ON' : 'OFF'}
                    </span>
                    <Switch
                      checked={tour.isActive}
                      onCheckedChange={() => handleQuickToggle(tour.id, tour.isActive)}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            ))}

            {tours.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tours found. Create your first tour to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {bulkAction === 'enable' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>Confirm Bulk Action</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Are you sure you want to {bulkAction === 'enable' ? 'enable' : 'disable'} {' '}
                <strong>{selectedTours.length}</strong> tour(s)?
              </p>
              
              {bulkAction === 'enable' && selectedInactiveTours > 0 && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will activate {selectedInactiveTours} currently inactive tour(s).
                  </AlertDescription>
                </Alert>
              )}

              {bulkAction === 'disable' && selectedActiveTours > 0 && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This will deactivate {selectedActiveTours} currently active tour(s).
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelBulkAction}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmBulkAction}
                  disabled={isProcessing}
                  className={`flex-1 ${
                    bulkAction === 'enable' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `${bulkAction === 'enable' ? 'Enable' : 'Disable'} Tours`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BulkTourManagement;
