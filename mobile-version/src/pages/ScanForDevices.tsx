import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bluetooth, Radio, Loader2, X, CheckCircle2 } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

interface DiscoveredDevice {
  id: string;
  name: string;
  readerId: string;
  signalStrength?: number;
}

interface ConnectedDevice {
  id: string;
  name: string;
  readerId: string;
  connectedOn: string;
}

const ScanForDevices = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceConnectingName, setDeviceConnectingName] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDeviceToConnect, setSelectedDeviceToConnect] = useState<DiscoveredDevice | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successDeviceName, setSuccessDeviceName] = useState<string>("");
  const [connectedDeviceInfo, setConnectedDeviceInfo] = useState<DiscoveredDevice | null>(null);
  const connectionAbortedRef = useRef(false);

  // Mock device discovery - in real app, this would be Bluetooth/device scanning
  useEffect(() => {
    const scanDevices = async () => {
      setIsScanning(true);
      
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock discovered devices
      const mockDevices: DiscoveredDevice[] = [
        {
          id: "device-1",
          name: "PrimeReader 4231",
          readerId: "PR-4F21D",
          signalStrength: 85,
        },
        {
          id: "device-2",
          name: "PrimeReader 5120",
          readerId: "PR-5A20E",
          signalStrength: 72,
        },
        {
          id: "device-3",
          name: "PrimeReader 3890",
          readerId: "PR-3B90F",
          signalStrength: 45,
        },
      ];
      
      setDiscoveredDevices(mockDevices);
      setIsScanning(false);
    };

    scanDevices();
  }, []);

  const handleConnectClick = (device: DiscoveredDevice) => {
    // Open confirmation modal instead of connecting directly
    setSelectedDeviceToConnect(device);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmConnect = async () => {
    if (!selectedDeviceToConnect) return;

    // Close confirmation modal and open connecting modal
    setIsConfirmModalOpen(false);
    setDeviceConnectingName(selectedDeviceToConnect.name);
    setIsConnecting(true);
    connectionAbortedRef.current = false;
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if connection was aborted
      if (connectionAbortedRef.current) {
        return;
      }
      
      // In real app, this would:
      // 1. Disconnect previous reader if required
      // 2. Connect to the selected reader
      
      // Close connecting modal and open success modal
      setIsConnecting(false);
      setSuccessDeviceName(selectedDeviceToConnect.name);
      setDeviceConnectingName("");
      // Store device info for navigation
      setConnectedDeviceInfo(selectedDeviceToConnect);
      setIsSuccessModalOpen(true);
    } catch (error) {
      // Check if connection was aborted
      if (connectionAbortedRef.current) {
        return;
      }
      
      // Close connecting modal
      setIsConnecting(false);
      setDeviceConnectingName("");
      showErrorToast("Failed to connect. Please try again.");
    } finally {
      setSelectedDeviceToConnect(null);
    }
  };

  const handleCancelConnecting = () => {
    // Abort the connection
    connectionAbortedRef.current = true;
    setIsConnecting(false);
    setDeviceConnectingName("");
    setSelectedDeviceToConnect(null);
  };

  const handleContinueSuccess = () => {
    if (!connectedDeviceInfo) return;

    // Format current date/time for "Connected On"
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const connectedOn = `${formattedDate}, ${formattedTime}`;

    // Create connected device object with all required fields
    const connectedDevice: ConnectedDevice = {
      id: connectedDeviceInfo.id,
      name: connectedDeviceInfo.name,
      readerId: connectedDeviceInfo.readerId,
      connectedOn: connectedOn,
    };

    // Clean up all modal states
    setIsSuccessModalOpen(false);
    setIsConnecting(false);
    setSuccessDeviceName("");
    setDeviceConnectingName("");
    setConnectedDeviceInfo(null);
    setSelectedDeviceToConnect(null);
    connectionAbortedRef.current = false;
    
    // Navigate back to Configure Card Reader screen with connected device data
    // Use replace: true to avoid back button issues
    navigate("/settings/configure-card-reader", {
      state: { connectedDevice },
      replace: true,
    });
  };

  const handleCancelConnect = () => {
    setIsConfirmModalOpen(false);
    setSelectedDeviceToConnect(null);
  };

  const handleTroubleshoot = () => {
    // Navigate to troubleshooting/support screen
    // For now, just show a placeholder message
    showSuccessToast("Troubleshooting guide coming soon");
    // In real app: navigate("/settings/configure-card-reader/troubleshoot");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader 
        title="Scan for Devices" 
        showBack={true}
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-4">
        <div className="px-4 py-4">
          {/* Center Content - Searching Animation */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-8 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2 text-center">
                Searching…
              </h3>
              <div className="text-center space-y-1 max-w-xs">
                <p className="text-sm text-gray-600">
                  Don't see your card reader below?
                </p>
                <p className="text-sm text-gray-600">
                  Press and hold the power button until the light starts blinking.
                </p>
              </div>
            </div>
          )}

          {/* Section Title - Only show when scanning is complete */}
          {!isScanning && (
            <h2 className="text-sm font-bold text-gray-700 mb-3">Select Card Reader</h2>
          )}

          {/* Device List */}
          {!isScanning && discoveredDevices.length > 0 ? (
            <div className="space-y-3">
              {discoveredDevices.map((device) => (
                <div
                  key={device.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between">
                    {/* Device Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {device.name}
                      </p>
                      {device.readerId && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {device.readerId}
                        </p>
                      )}
                    </div>

                    {/* Connect Button */}
                    <div className="flex-shrink-0 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleConnectClick(device)}
                        disabled={isConnecting}
                        className="h-9 px-4 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !isScanning && discoveredDevices.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Radio className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No card readers found
                </h3>
                <p className="text-sm text-gray-600 max-w-xs">
                  Try moving closer or press the power button again.
                </p>
              </div>
            </div>
          ) : null}

          {/* Troubleshooting Link */}
          {!isScanning && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600">
                Having issues?{" "}
                <button
                  onClick={handleTroubleshoot}
                  className="text-primary font-medium hover:underline"
                >
                  Troubleshoot
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
          <DialogDescription className="sr-only">
            Confirmation modal for connecting device
          </DialogDescription>
          
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
            <DialogTitle className="text-lg font-semibold text-gray-800">Confirmation</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
              onClick={handleCancelConnect}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </DialogHeader>

          {/* Content */}
          <div className="space-y-4 mt-3">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              Are you sure you want to connect this device?
              <br />
              Doing so will remove the previously connected reader.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelConnect}
              className="flex-1 h-11 text-sm font-semibold rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmConnect}
              className="flex-1 h-11 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connecting Modal */}
      <Dialog open={isConnecting} onOpenChange={() => {}}>
        <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
          <DialogDescription className="sr-only">
            Connecting to device modal
          </DialogDescription>
          
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Connecting to: {deviceConnectingName}…
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="space-y-4 mt-3">
            {/* Loading Spinner */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                Please wait while we establish a secure link.
              </p>
            </div>
          </div>

          {/* Footer Button */}
          <div className="flex justify-center pt-2 border-t border-gray-100 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelConnecting}
              className="h-11 px-6 text-sm font-semibold rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connection Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={() => {}}>
        <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Connection Successful</DialogTitle>
          <DialogDescription className="sr-only">
            Connection successful modal
          </DialogDescription>
          
          {/* Content */}
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={2.5} />
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900">
              Connection Successful!
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {successDeviceName} is now connected.
            </p>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center pt-4 mt-4">
            <Button
              onClick={handleContinueSuccess}
              className="w-full h-11 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary/90"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanForDevices;

