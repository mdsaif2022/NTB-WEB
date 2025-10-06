import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Globe,
  Shield,
  Mail,
  Bell,
  Upload,
  Save,
  RefreshCw,
  Database,
  Server,
  Check,
  Download,
  DollarSign,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { useUser } from "@/contexts/UserContext";
import { Helmet } from 'react-helmet-async';

export default function AdminSettings() {
  const { settings, updateSettings, isLoading: contextLoading } = useSettings();
  const { isAdmin } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/auth");
    }
  }, [isAdmin, navigate]);

  const [siteLogo, setSiteLogo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment method toggles state
  const [paymentSettings, setPaymentSettings] = useState({ manualPayment: true, bkashPayment: false });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState("");

  // Fetch payment settings on mount
  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => setPaymentSettings(data));
  }, []);

  // Handle toggle change
  const handlePaymentToggle = (key: "manualPayment" | "bkashPayment") => {
    setPaymentSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Save payment settings
  const handleSavePaymentSettings = async () => {
    setPaymentLoading(true);
    setPaymentSaved("");
    try {
      const res = await fetch("/api/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentSettings),
      });
      if (res.ok) {
        setPaymentSaved("Payment settings saved!");
      } else {
        setPaymentSaved("Failed to save payment settings.");
      }
    } catch (e) {
      setPaymentSaved("Error saving payment settings.");
    } finally {
      setPaymentLoading(false);
      setTimeout(() => setPaymentSaved(""), 3000);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSiteLogo(file);
      // Create a URL for the uploaded file
      const logoUrl = URL.createObjectURL(file);
      // Save the logo URL to settings
      updateSettings({ siteLogo: logoUrl });
    }
  };

  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Saving settings:", settings);
      if (siteLogo) {
        console.log("Uploading logo:", siteLogo.name);
      }

      setSavedMessage("Settings saved successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSavedMessage("Error saving settings. Please try again.");
      setTimeout(() => setSavedMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSavedMessage("Cache cleared successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      setSavedMessage("Error clearing cache. Please try again.");
      setTimeout(() => setSavedMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const backupData = {
        timestamp: new Date().toISOString(),
        settings,
        users: [],
        tours: [],
        blogs: [],
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `explorebd-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSavedMessage("Database backup downloaded successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      setSavedMessage("Error creating backup. Please try again.");
      setTimeout(() => setSavedMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const exportData = {
        siteName: settings.siteName,
        tours: [],
        blogs: [],
        users: [],
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `explorebd-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSavedMessage("Data exported successfully!");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      setSavedMessage("Error exporting data. Please try again.");
      setTimeout(() => setSavedMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Settings | Explore Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Admin settings for Explore Bangladesh. Configure system preferences, policies, and more." />
        <meta property="og:title" content="Admin Settings | Explore Bangladesh" />
        <meta property="og:description" content="Admin settings for Explore Bangladesh. Configure system preferences, policies, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/admin/settings" />
        <meta property="og:image" content="https://yourdomain.com/og-admin.jpg" />
      </Helmet>
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure system settings, preferences, and policies
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Site Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Site Name
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) =>
                      handleSettingChange("siteName", e.target.value)
                    }
                    placeholder="Explore BD"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Site Description
                  </label>
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) =>
                      handleSettingChange("siteDescription", e.target.value)
                    }
                    placeholder="Discover the Beauty of Bangladesh"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Site Logo
                  </label>
                  
                  {/* Current Logo Preview */}
                  {settings.siteLogo && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                      <img 
                        src={settings.siteLogo} 
                        alt="Site Logo" 
                        className="max-h-16 max-w-48 object-contain"
                      />
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {siteLogo ? siteLogo.name : "Upload site logo"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleLogoButtonClick}
                      type="button"
                    >
                      {siteLogo ? "Change File" : "Choose File"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended size: 200x60px. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) =>
                      handleSettingChange("contactEmail", e.target.value)
                    }
                    placeholder="info@explorebd.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      handleSettingChange("supportEmail", e.target.value)
                    }
                    placeholder="support@explorebd.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    value={settings.phone}
                    onChange={(e) =>
                      handleSettingChange("phone", e.target.value)
                    }
                    placeholder="+880 1700-000000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Address
                  </label>
                  <Textarea
                    value={settings.address}
                    onChange={(e) =>
                      handleSettingChange("address", e.target.value)
                    }
                    placeholder="123 Gulshan Avenue, Dhaka 1212, Bangladesh"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Settings */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                User Management Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Enable User Registration
                  </h4>
                  <p className="text-sm text-gray-600">
                    Allow new users to register for accounts
                  </p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableRegistration", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Require Email Verification
                  </h4>
                  <p className="text-sm text-gray-600">
                    Users must verify their email before accessing features
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    handleSettingChange("requireEmailVerification", checked)
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Default User Role
                  </label>
                  <Select
                    value={settings.defaultUserRole}
                    onValueChange={(value) =>
                      handleSettingChange("defaultUserRole", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="blogger">Blogger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Password Minimum Length
                  </label>
                  <Select
                    value={settings.passwordMinLength}
                    onValueChange={(value) =>
                      handleSettingChange("passwordMinLength", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Enable Blog Submissions
                  </h4>
                  <p className="text-sm text-gray-600">
                    Allow verified users to submit blog posts
                  </p>
                </div>
                <Switch
                  checked={settings.enableBlogSubmissions}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableBlogSubmissions", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Auto-approve Blog Posts
                  </h4>
                  <p className="text-sm text-gray-600">
                    Automatically approve all blog submissions without review
                  </p>
                </div>
                <Switch
                  checked={settings.autoApprovePosts}
                  onCheckedChange={(checked) =>
                    handleSettingChange("autoApprovePosts", checked)
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Maximum File Size (MB)
                  </label>
                  <Input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) =>
                      handleSettingChange("maxFileSize", e.target.value)
                    }
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Allowed File Types
                  </label>
                  <Input
                    value={settings.allowedFileTypes}
                    onChange={(e) =>
                      handleSettingChange("allowedFileTypes", e.target.value)
                    }
                    placeholder="jpg,jpeg,png,pdf"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Content Guidelines
                </label>
                <Textarea
                  value={settings.contentGuidelines}
                  onChange={(e) =>
                    handleSettingChange("contentGuidelines", e.target.value)
                  }
                  placeholder="Enter content submission guidelines..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <p className="text-gray-500 text-sm">Enable or disable payment options for users. Manual Payment is always available. Enable bKash when ready.</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6 max-w-md">
                  <div className="flex items-center justify-between">
                    <span>Manual Payment</span>
                    <Switch checked={paymentSettings.manualPayment} onCheckedChange={() => handlePaymentToggle("manualPayment")}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>bKash Payment</span>
                    <Switch checked={paymentSettings.bkashPayment} onCheckedChange={() => handlePaymentToggle("bkashPayment")}/>
                  </div>
                  <Button onClick={handleSavePaymentSettings} disabled={paymentLoading} className="mt-4">
                    {paymentLoading ? "Saving..." : "Save Payment Settings"}
                  </Button>
                  {paymentSaved && <div className="text-green-600 mt-2">{paymentSaved}</div>}
                </div>
              </CardContent>
            </Card>

            {/* bKash Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  bKash Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      bKash Personal Number
                    </label>
                    <Input
                      value={settings.bkashPersonalNumber}
                      onChange={(e) =>
                        handleSettingChange(
                          "bkashPersonalNumber",
                          e.target.value,
                        )
                      }
                      placeholder="+880 1700-000000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      bKash Merchant Number
                    </label>
                    <Input
                      value={settings.bkashMerchantNumber}
                      onChange={(e) =>
                        handleSettingChange(
                          "bkashMerchantNumber",
                          e.target.value,
                        )
                      }
                      placeholder="+880 1700-000001"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      bKash Agent Number
                    </label>
                    <Input
                      value={settings.bkashAgentNumber}
                      onChange={(e) =>
                        handleSettingChange("bkashAgentNumber", e.target.value)
                      }
                      placeholder="+880 1700-000002"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                      Primary bKash Number (Used in Booking)
                    </label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={settings.bkashNumber}
                      onChange={(e) =>
                        handleSettingChange("bkashNumber", e.target.value)
                      }
                    >
                      <option value={settings.bkashPersonalNumber}>
                        Personal: {settings.bkashPersonalNumber}
                      </option>
                      <option value={settings.bkashMerchantNumber}>
                        Merchant: {settings.bkashMerchantNumber}
                      </option>
                      <option value={settings.bkashAgentNumber}>
                        Agent: {settings.bkashAgentNumber}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Payment Instructions for Customers
                  </label>
                  <Textarea
                    value={settings.paymentInstructions}
                    onChange={(e) =>
                      handleSettingChange("paymentInstructions", e.target.value)
                    }
                    placeholder="Enter step-by-step payment instructions..."
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    These instructions will be shown to customers during the
                    payment process.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Fees */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Fees & Charges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Enable Payment Fee
                    </h4>
                    <p className="text-sm text-gray-600">
                      Add extra charges for payment processing
                    </p>
                  </div>
                  <Switch
                    checked={settings.enablePaymentFee}
                    onCheckedChange={(checked) =>
                      handleSettingChange("enablePaymentFee", checked)
                    }
                  />
                </div>

                {settings.enablePaymentFee && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Fee Amount
                      </label>
                      <Input
                        value={settings.paymentFeeAmount}
                        onChange={(e) =>
                          handleSettingChange(
                            "paymentFeeAmount",
                            e.target.value,
                          )
                        }
                        placeholder="2.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Fee Type
                      </label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={settings.paymentFeeType}
                        onChange={(e) =>
                          handleSettingChange("paymentFeeType", e.target.value)
                        }
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (৳)</option>
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alternative Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Alternative Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nagad */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Nagad Payment
                      </h4>
                      <p className="text-sm text-gray-600">
                        Accept payments via Nagad
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableNagadPayment}
                      onCheckedChange={(checked) =>
                        handleSettingChange("enableNagadPayment", checked)
                      }
                    />
                  </div>
                  {settings.enableNagadPayment && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Nagad Number
                      </label>
                      <Input
                        value={settings.nagadNumber}
                        onChange={(e) =>
                          handleSettingChange("nagadNumber", e.target.value)
                        }
                        placeholder="+880 1700-000003"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Rocket */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Rocket Payment
                      </h4>
                      <p className="text-sm text-gray-600">
                        Accept payments via Rocket
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableRocketPayment}
                      onCheckedChange={(checked) =>
                        handleSettingChange("enableRocketPayment", checked)
                      }
                    />
                  </div>
                  {settings.enableRocketPayment && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Rocket Number
                      </label>
                      <Input
                        value={settings.rocketNumber}
                        onChange={(e) =>
                          handleSettingChange("rocketNumber", e.target.value)
                        }
                        placeholder="+880 1700-000004"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Bank Transfer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Bank Transfer
                      </h4>
                      <p className="text-sm text-gray-600">
                        Accept bank transfers
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableBankTransfer}
                      onCheckedChange={(checked) =>
                        handleSettingChange("enableBankTransfer", checked)
                      }
                    />
                  </div>
                  {settings.enableBankTransfer && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">
                        Bank Account Details
                      </label>
                      <Textarea
                        value={settings.bankAccountDetails}
                        onChange={(e) =>
                          handleSettingChange(
                            "bankAccountDetails",
                            e.target.value,
                          )
                        }
                        placeholder="Bank Name, Account Number, Branch Details..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-600">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("emailNotifications", checked)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    SMS Notifications
                  </h4>
                  <p className="text-sm text-gray-600">
                    Send booking confirmations via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("smsNotifications", checked)
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    bKash Personal Number
                  </label>
                  <Input
                    value={settings.bkashNumber}
                    onChange={(e) =>
                      handleSettingChange("bkashNumber", e.target.value)
                    }
                    placeholder="+880 1700-000000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    SMS Gateway API Key
                  </label>
                  <Input
                    type="password"
                    value={settings.smsApiKey}
                    onChange={(e) =>
                      handleSettingChange("smsApiKey", e.target.value)
                    }
                    placeholder="Enter API key"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Email Templates
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="booking">
                      Booking Confirmation
                    </SelectItem>
                    <SelectItem value="blog-approval">Blog Approval</SelectItem>
                    <SelectItem value="blog-rejection">
                      Blog Rejection
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Maintenance Mode
                    </h4>
                    <p className="text-sm text-gray-600">
                      Temporarily disable site access for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      handleSettingChange("maintenanceMode", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Server Status</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Database Status
                    </span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Storage Usage</span>
                    <span className="text-sm font-medium">2.3 GB / 10 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  System Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleClearCache}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Clear Cache
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleBackupDatabase}
                  disabled={isLoading}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportData}
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    System Timezone
                  </label>
                  <Select
                    value={settings.systemTimezone}
                    onValueChange={(value) =>
                      handleSettingChange("systemTimezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-dhaka">Asia/Dhaka</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="america-new-york">
                        America/New_York
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    Date Format
                  </label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) =>
                      handleSettingChange("dateFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-between items-center mt-8">
        {savedMessage && (
          <div
            className={`flex items-center ${savedMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}
          >
            <Check className="w-4 h-4 mr-2" />
            {savedMessage}
          </div>
        )}
        <div className="ml-auto">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
