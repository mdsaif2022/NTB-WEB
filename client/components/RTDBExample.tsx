import React, { useState } from 'react';
import { useRTDB, useTours, useCurrentUser, useNotifications } from '@/hooks/useRTDB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const RTDBExample: React.FC = () => {
  const { 
    tours, 
    activeTours, 
    loading, 
    createTour, 
    updateTour, 
    deleteTour 
  } = useTours();
  
  const { 
    currentUser, 
    setCurrentUser 
  } = useCurrentUser();
  
  const { 
    notifications, 
    unreadNotifications, 
    createGlobalNotification 
  } = useNotifications();

  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourDescription, setNewTourDescription] = useState('');
  const [newTourPrice, setNewTourPrice] = useState('');

  const handleCreateTour = async () => {
    if (!newTourTitle || !newTourDescription || !newTourPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createTour({
        title: newTourTitle,
        description: newTourDescription,
        price: parseFloat(newTourPrice),
        duration: '1 day',
        location: 'Narayanganj',
        images: [],
        isActive: true,
        createdBy: currentUser?.id || 'admin'
      });

      // Create a notification
      await createGlobalNotification(
        'New Tour Created',
        `Tour "${newTourTitle}" has been added successfully!`,
        'success'
      );

      toast.success('Tour created successfully!');
      setNewTourTitle('');
      setNewTourDescription('');
      setNewTourPrice('');
    } catch (error) {
      toast.error('Failed to create tour');
      console.error('Error creating tour:', error);
    }
  };

  const handleToggleTourStatus = async (tourId: string, isActive: boolean) => {
    try {
      await updateTour(tourId, { isActive: !isActive });
      toast.success(`Tour ${!isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      toast.error('Failed to update tour status');
      console.error('Error updating tour:', error);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
      await deleteTour(tourId);
      toast.success('Tour deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete tour');
      console.error('Error deleting tour:', error);
    }
  };

  if (loading.tours) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading tours...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firebase RTDB Integration Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Total Tours</h3>
              <Badge variant="secondary" className="text-lg">
                {tours.length}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Active Tours</h3>
              <Badge variant="default" className="text-lg">
                {activeTours.length}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Unread Notifications</h3>
              <Badge variant="destructive" className="text-lg">
                {unreadNotifications.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Tour */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Tour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Tour Title"
              value={newTourTitle}
              onChange={(e) => setNewTourTitle(e.target.value)}
            />
            <Input
              placeholder="Price"
              type="number"
              value={newTourPrice}
              onChange={(e) => setNewTourPrice(e.target.value)}
            />
          </div>
          <Input
            placeholder="Tour Description"
            value={newTourDescription}
            onChange={(e) => setNewTourDescription(e.target.value)}
          />
          <Button onClick={handleCreateTour} className="w-full">
            Create Tour
          </Button>
        </CardContent>
      </Card>

      {/* Tours List */}
      <Card>
        <CardHeader>
          <CardTitle>Tours ({tours.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tours found. Create your first tour above!</p>
          ) : (
            <div className="space-y-4">
              {tours.map((tour) => (
                <Card key={tour.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{tour.title}</h3>
                        <p className="text-gray-600 mt-1">{tour.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={tour.isActive ? "default" : "secondary"}>
                            {tour.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Price: ${tour.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            Location: {tour.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleTourStatus(tour.id, tour.isActive)}
                        >
                          {tour.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteTour(tour.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RTDBExample;
