import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  contactEmail: string;
  supportEmail: string;
  phone: string;
  address: string;
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  enableBlogSubmissions: boolean;
  autoApprovePosts: boolean;
  maxFileSize: string;
  allowedFileTypes: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  contentGuidelines: string;
  bkashNumber: string;
  bkashMerchantNumber: string;
  bkashAgentNumber: string;
  bkashPersonalNumber: string;
  paymentInstructions: string;
  enablePaymentFee: boolean;
  paymentFeeAmount: string;
  paymentFeeType: "percentage" | "fixed";
  enableNagadPayment: boolean;
  nagadNumber: string;
  enableRocketPayment: boolean;
  rocketNumber: string;
  enableBankTransfer: boolean;
  bankAccountDetails: string;
  paymentMethodsPriority: string[];
  smsApiKey: string;
  defaultUserRole: string;
  passwordMinLength: string;
  systemTimezone: string;
  dateFormat: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: SiteSettings = {
  siteName: "Explore BD",
  siteDescription: "Discover the Beauty of Bangladesh",
  siteLogo: "https://via.placeholder.com/150x50/059669/ffffff?text=Explore+BD",
  contactEmail: "info@explorebd.com",
  supportEmail: "support@explorebd.com",
  phone: "+880 1700-000000",
  address: "123 Gulshan Avenue, Dhaka 1212, Bangladesh",
  enableRegistration: true,
  requireEmailVerification: true,
  enableBlogSubmissions: true,
  autoApprovePosts: false,
  maxFileSize: "10",
  allowedFileTypes: "jpg,jpeg,png,pdf",
  emailNotifications: true,
  smsNotifications: true,
  maintenanceMode: false,
  contentGuidelines:
    "Please ensure your content is family-friendly and relevant to Bangladesh tourism. Include high-quality images and provide accurate information about destinations.",
  bkashNumber: "+880 1700-000000",
  bkashMerchantNumber: "+880 1700-000001",
  bkashAgentNumber: "+880 1700-000002",
  bkashPersonalNumber: "+880 1700-000000",
  paymentInstructions:
    "1. Send money to our bKash number\n2. Use 'Send Money' option\n3. Save transaction ID\n4. Upload payment screenshot or enter transaction ID\n5. Booking will be confirmed after payment verification",
  enablePaymentFee: false,
  paymentFeeAmount: "2.5",
  paymentFeeType: "percentage",
  enableNagadPayment: true,
  nagadNumber: "+880 1700-000003",
  enableRocketPayment: true,
  rocketNumber: "+880 1700-000004",
  enableBankTransfer: false,
  bankAccountDetails:
    "Bank: Dutch-Bangla Bank\nAccount Name: Your Company Name\nAccount Number: 1234567890\nBranch: Gulshan Branch, Dhaka",
  paymentMethodsPriority: ["bkash", "nagad", "rocket", "bank"],
  smsApiKey: "",
  defaultUserRole: "user",
  passwordMinLength: "8",
  systemTimezone: "asia-dhaka",
  dateFormat: "dd-mm-yyyy",
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("siteSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Error loading settings from localStorage:", error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setIsLoading(true);
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Save to localStorage
    localStorage.setItem("siteSettings", JSON.stringify(updatedSettings));

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
