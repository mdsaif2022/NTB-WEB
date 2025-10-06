import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTours } from "@/contexts/TourContext";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Bus,
} from "lucide-react";
import { Helmet } from 'react-helmet-async';

export default function NewTour() {
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const { addTour } = useTours();
  const [isSaving, setIsSaving] = useState(false);
  const [tourData, setTourData] = useState({
    name: "",
    location: "",
    destination: "",
    duration: "",
    maxParticipants: "",
    price: "",
    status: "active",
    description: "",
    highlights: [] as string[],
    includes: [] as string[],
    image: null as File | null,
    hasBusSeatSelection: false,
    busSeatCapacity: "",
  });

  const [currentHighlight, setCurrentHighlight] = useState("");
  const [currentInclude, setCurrentInclude] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const locations = [
    "Dhaka Division",
    "Chittagong Division",
    "Sylhet Division",
    "Khulna Division",
    "Rajshahi Division",
    "Barisal Division",
    "Rangpur Division",
    "Mymensingh Division",
  ];

  const destinations = [
    "Dhaka",
    "Chittagong",
    "Cox's Bazar",
    "Sylhet",
    "Srimangal",
    "Khulna",
    "Sundarbans",
    "Rangamati",
    "Bandarban",
    "Kuakata",
    "Saint Martin's Island",
    "Paharpur",
  ];

  useEffect(() => {
    if (!isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, navigate]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only image files (JPG, PNG, GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setTourData((prev) => ({ ...prev, image: file }));
    }
  };

  const addHighlight = () => {
    if (
      currentHighlight.trim() &&
      !tourData.highlights.includes(currentHighlight.trim())
    ) {
      setTourData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, currentHighlight.trim()],
      }));
      setCurrentHighlight("");
    }
  };

  const removeHighlight = (highlight: string) => {
    setTourData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((h) => h !== highlight),
    }));
  };

  const addInclude = () => {
    if (
      currentInclude.trim() &&
      !tourData.includes.includes(currentInclude.trim())
    ) {
      setTourData((prev) => ({
        ...prev,
        includes: [...prev.includes, currentInclude.trim()],
      }));
      setCurrentInclude("");
    }
  };

  const removeInclude = (include: string) => {
    setTourData((prev) => ({
      ...prev,
      includes: prev.includes.filter((i) => i !== include),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!tourData.name.trim()) newErrors.name = "Tour name is required";
    if (!tourData.location) newErrors.location = "Location is required";
    if (!tourData.destination)
      newErrors.destination = "Destination is required";
    if (!tourData.duration.trim()) newErrors.duration = "Duration is required";
    if (!tourData.maxParticipants || parseInt(tourData.maxParticipants) <= 0) {
      newErrors.maxParticipants = "Valid max participants is required";
    }
    if (!tourData.price || parseInt(tourData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (
      !tourData.description.trim() ||
      tourData.description.trim().length < 50
    ) {
      newErrors.description = "Description must be at least 50 characters";
    }
    if (tourData.highlights.length === 0) {
      newErrors.highlights = "At least one highlight is required";
    }
    if (tourData.includes.length === 0) {
      newErrors.includes = "At least one include item is required";
    }

    if (tourData.hasBusSeatSelection && (!tourData.busSeatCapacity || parseInt(tourData.busSeatCapacity) <= 0)) {
      newErrors.busSeatCapacity = "Valid bus seat capacity is required when bus seat selection is enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add the tour to the context
      const newTour = addTour({
        name: tourData.name,
        location: tourData.location,
        destination: tourData.destination,
        duration: tourData.duration,
        maxParticipants: parseInt(tourData.maxParticipants),
        price: parseInt(tourData.price),
        status: tourData.status as "active" | "draft" | "inactive",
        image: "📍", // Default icon for now
        description: tourData.description,
        highlights: tourData.highlights,
        includes: tourData.includes,
        hasBusSeatSelection: tourData.hasBusSeatSelection,
        busSeatCapacity: tourData.hasBusSeatSelection ? parseInt(tourData.busSeatCapacity) : undefined,
      });

      console.log("New tour created:", newTour);

      // Show success message
      alert(`Tour "${newTour.name}" has been successfully created! It will now appear on the user site.`);

      // Navigate back to tours management
      navigate("/admin/tours");
    } catch (error) {
      alert("Failed to create tour. Please try again.");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Add New Tour | Admin | Explore Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin panel for adding new tours on Explore Bangladesh." />
        <meta property="og:title" content="Add New Tour | Admin | Explore Bangladesh" />
        <meta property="og:description" content="Admin panel for adding new tours on Explore Bangladesh." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/admin/tours/new" />
        <meta property="og:image" content="https://yourdomain.com/og-admin.jpg" />
      </Helmet>
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/tours">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tours
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Tour Package
              </h1>
              <p className="text-gray-600 mt-2">
                Add a new tour package to your collection
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Tour Name *</Label>
                  <Input
                    id="name"
                    value={tourData.name}
                    onChange={(e) =>
                      setTourData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Sundarbans Adventure"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location/Division *</Label>
                    <Select
                      value={tourData.location}
                      onValueChange={(value) =>
                        setTourData((prev) => ({ ...prev, location: value }))
                      }
                    >
                      <SelectTrigger
                        className={errors.location ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="destination">Main Destination *</Label>
                      <Input
                        id="destination"
                      value={tourData.destination}
                        onChange={(e) =>
                          setTourData((prev) => ({ ...prev, destination: e.target.value }))
                      }
                        placeholder="Type main destination"
                        className={errors.destination ? "border-red-500" : ""}
                      />
                    {errors.destination && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.destination}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Input
                      id="duration"
                      value={tourData.duration}
                      onChange={(e) =>
                        setTourData((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="e.g., 3 Days"
                      className={errors.duration ? "border-red-500" : ""}
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.duration}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants">Max Participants *</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={tourData.maxParticipants}
                      onChange={(e) =>
                        setTourData((prev) => ({
                          ...prev,
                          maxParticipants: e.target.value,
                        }))
                      }
                      placeholder="20"
                      className={errors.maxParticipants ? "border-red-500" : ""}
                    />
                    {errors.maxParticipants && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.maxParticipants}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="price">Price (৳) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={tourData.price}
                      onChange={(e) =>
                        setTourData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="15000"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={tourData.status}
                    onValueChange={(value) =>
                      setTourData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bus Seat Selection Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="hasBusSeatSelection"
                      checked={tourData.hasBusSeatSelection}
                      onChange={(e) =>
                        setTourData((prev) => ({
                          ...prev,
                          hasBusSeatSelection: e.target.checked,
                          busSeatCapacity: e.target.checked ? prev.busSeatCapacity : "",
                        }))
                      }
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <Label htmlFor="hasBusSeatSelection" className="flex items-center cursor-pointer">
                      <Bus className="w-4 h-4 mr-2" />
                      Enable Bus Seat Selection
                    </Label>
                  </div>
                  
                  {tourData.hasBusSeatSelection && (
                    <div>
                      <Label htmlFor="busSeatCapacity">Bus Seat Capacity *</Label>
                      <Input
                        id="busSeatCapacity"
                        type="number"
                        value={tourData.busSeatCapacity}
                        onChange={(e) =>
                          setTourData((prev) => ({
                            ...prev,
                            busSeatCapacity: e.target.value,
                          }))
                        }
                        placeholder="e.g., 40"
                        className={errors.busSeatCapacity ? "border-red-500" : ""}
                      />
                      {errors.busSeatCapacity && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.busSeatCapacity}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Number of seats available for selection on the bus
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Tour Description *</Label>
                  <Textarea
                    id="description"
                    value={tourData.description}
                    onChange={(e) =>
                      setTourData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the tour experience, activities, and what makes it special..."
                    rows={6}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-red-500 text-sm">
                        {errors.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm text-right">
                      {tourData.description.length} characters (minimum 50)
                    </p>
                  </div>
                </div>

                {/* Tour Image */}
                <div>
                  <Label htmlFor="image">Tour Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {tourData.image ? (
                      <div>
                        <p className="text-sm text-green-600 font-medium mb-2">
                          ✓ {tourData.image.name}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("image")?.click()
                            }
                          >
                            Change Image
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setTourData((prev) => ({ ...prev, image: null }))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Upload a tour image
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Supports JPG, PNG, GIF (max 5MB)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("image")?.click()
                          }
                        >
                          Choose Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Highlights & Includes */}
            <Card>
              <CardHeader>
                <CardTitle>Tour Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Highlights */}
                <div>
                  <Label htmlFor="highlights">Tour Highlights *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentHighlight}
                      onChange={(e) => setCurrentHighlight(e.target.value)}
                      placeholder="e.g., Royal Bengal Tiger"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addHighlight();
                        }
                      }}
                      className={errors.highlights ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addHighlight}
                    >
                      Add
                    </Button>
                  </div>
                  {errors.highlights && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.highlights}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {tourData.highlights.map((highlight) => (
                      <Badge
                        key={highlight}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {highlight}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeHighlight(highlight)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* What's Included */}
                <div>
                  <Label htmlFor="includes">What's Included *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentInclude}
                      onChange={(e) => setCurrentInclude(e.target.value)}
                      placeholder="e.g., Accommodation"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInclude();
                        }
                      }}
                      className={errors.includes ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addInclude}
                    >
                      Add
                    </Button>
                  </div>
                  {errors.includes && (
                    <p className="text-red-500 text-sm mb-2">
                      {errors.includes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {tourData.includes.map((include) => (
                      <Badge
                        key={include}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {include}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeInclude(include)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tour Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-4xl">
                  📍
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    {tourData.name || "Tour Name"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tourData.location || "Location"}
                  </p>
                </div>

                {(tourData.duration ||
                  tourData.maxParticipants ||
                  tourData.price ||
                  tourData.hasBusSeatSelection) && (
                  <div className="space-y-2 text-sm">
                    {tourData.duration && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Duration:
                        </span>
                        <span>{tourData.duration}</span>
                      </div>
                    )}
                    {tourData.maxParticipants && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Max:
                        </span>
                        <span>{tourData.maxParticipants} people</span>
                      </div>
                    )}
                    {tourData.price && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Price:
                        </span>
                        <span className="font-semibold">
                          ৳{parseInt(tourData.price).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {tourData.hasBusSeatSelection && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Bus className="w-4 h-4 mr-1" />
                          Bus Seats:
                        </span>
                        <span className="text-emerald-600 font-medium">
                          {tourData.busSeatCapacity || "N/A"} seats
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Tour...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Tour Package
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
    </>
  );
}
