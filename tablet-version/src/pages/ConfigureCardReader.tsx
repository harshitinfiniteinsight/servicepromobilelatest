import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bluetooth, Radio, X, Loader2, CheckCircle2 } from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

interface ConnectedDevice {
  id: string;
  name: string;
  readerId: string;
  connectedOn: string;
}

interface DiscoveredDevice {
  id: string;
  name: string;
  readerId: string;
  signalStrength?: number;
}

const ConfigureCardReader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock state - in real app, this would come from API/context
  // Start with no devices connected
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  
  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceConnectingName, setDeviceConnectingName] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDeviceToConnect, setSelectedDeviceToConnect] = useState<DiscoveredDevice | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successDeviceName, setSuccessDeviceName] = useState<string>("");
  const [connectedDeviceInfo, setConnectedDeviceInfo] = useState<DiscoveredDevice | null>(null);
  const connectionAbortedRef = useRef(false);

  // Check if we're returning from scan screen with a newly connected device
  useEffect(() => {
    const state = location.state as { connectedDevice?: ConnectedDevice } | null;
    if (state?.connectedDevice) {
      // Add the newly connected device (replace any existing device)
      setConnectedDevices([state.connectedDevice]);
      // Store connected reader ID (readerId, not internal id) in localStorage for status tracking
      localStorage.setItem("currentConnectedReaderId", state.connectedDevice.readerId);
      // Clear the state to prevent re-adding on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state, location.pathname]);

  const handleScanForDevices = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    
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

  const handleConnectClick = (device: DiscoveredDevice) => {
    setSelectedDeviceToConnect(device);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmConnect = async () => {
    if (!selectedDeviceToConnect) return;

    setIsConfirmModalOpen(false);
    setDeviceConnectingName(selectedDeviceToConnect.name);
    setIsConnecting(true);
    connectionAbortedRef.current = false;
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (connectionAbortedRef.current) {
        return;
      }
      
      setIsConnecting(false);
      setSuccessDeviceName(selectedDeviceToConnect.name);
      setDeviceConnectingName("");
      setConnectedDeviceInfo(selectedDeviceToConnect);
      setIsSuccessModalOpen(true);
    } catch (error) {
      if (connectionAbortedRef.current) {
        return;
      }
      
      setIsConnecting(false);
      setDeviceConnectingName("");
      showErrorToast("Failed to connect. Please try again.");
    } finally {
      setSelectedDeviceToConnect(null);
    }
  };

  const handleCancelConnecting = () => {
    connectionAbortedRef.current = true;
    setIsConnecting(false);
    setDeviceConnectingName("");
    setSelectedDeviceToConnect(null);
  };

  const handleContinueSuccess = () => {
    if (!connectedDeviceInfo) return;

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

    const connectedDevice: ConnectedDevice = {
      id: connectedDeviceInfo.id,
      name: connectedDeviceInfo.name,
      readerId: connectedDeviceInfo.readerId,
      connectedOn: connectedOn,
    };

    // Update connected devices and clear modal states
    setConnectedDevices([connectedDevice]);
    localStorage.setItem("currentConnectedReaderId", connectedDevice.readerId);
    
    setIsSuccessModalOpen(false);
    setIsConnecting(false);
    setSuccessDeviceName("");
    setDeviceConnectingName("");
    setConnectedDeviceInfo(null);
    setSelectedDeviceToConnect(null);
    connectionAbortedRef.current = false;
    setIsScanning(false);
    setDiscoveredDevices([]);
    
    showSuccessToast("Device connected successfully");
  };

  const handleCancelConnect = () => {
    setIsConfirmModalOpen(false);
    setSelectedDeviceToConnect(null);
  };

  const handleDisconnect = (deviceId: string) => {
    const deviceToDisconnect = connectedDevices.find(d => d.id === deviceId);
    setConnectedDevices(prev => prev.filter(device => device.id !== deviceId));
    if (deviceToDisconnect) {
      const currentConnectedId = localStorage.getItem("currentConnectedReaderId");
      if (currentConnectedId === deviceToDisconnect.readerId) {
        localStorage.removeItem("currentConnectedReaderId");
      }
    }
    showSuccessToast("Device disconnected successfully");
  };

  const handleAddAnotherReader = () => {
    navigate("/settings/card-readers");
  };

  const handleClearScan = () => {
    setIsScanning(false);
    setDiscoveredDevices([]);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <TabletHeader 
        title="Configure Card Reader" 
        showBack={true}
      />
      
      {/* Two-Column Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full gap-6 px-6 py-4">
          
          {/* LEFT SECTION: Scan & Setup */}
          <div className="w-1/2 min-w-0 flex flex-col overflow-hidden bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Scan for Devices</h2>
            
            <div className="flex-1 overflow-y-auto scrollable">
              {!isScanning && discoveredDevices.length === 0 ? (
                // Initial state - button to start scan
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Bluetooth className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Ready to scan?
                    </p>
                    <p className="text-xs text-gray-600 mb-6">
                      Click the button below to start scanning for nearby card readers.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleScanForDevices}
                      className="h-10 px-4 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary/90"
                    >
                      <Bluetooth className="h-4 w-4 mr-2" />
                      Start Scanning
                    </Button>
                  </div>
                </div>
              ) : isScanning ? (
                // Scanning state
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-2 text-center">
                    Searching…
                  </h3>
                  <div className="text-center space-y-1 max-w-xs mb-6">
                    <p className="text-sm text-gray-600">
                      Don't see your card reader?
                    </p>
                    <p className="text-sm text-gray-600">
                      Press and hold the power button until the light starts blinking.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearScan}
                    className="h-9 px-4 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              ) : discoveredDevices.length > 0 ? (
                // Devices found state
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-600 mb-3">
                    Select Card Reader
                  </p>
                  {discoveredDevices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {device.name}
                          </p>
                          {device.readerId && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {device.readerId}
                            </p>
                          )}
                          {device.signalStrength !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              Signal: {device.signalStrength}%
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConnectClick(device)}
                          disabled={isConnecting}
                          className="flex-shrink-0 ml-2 h-8 px-3 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                          Connect
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScanForDevices}
                    className="w-full h-9 text-xs font-semibold"
                  >
                    Scan Again
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT SECTION: Connected Devices */}
          <div className="w-1/2 min-w-0 flex flex-col overflow-hidden bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Connected Devices</h2>
            
            <div className="flex-1 overflow-y-auto scrollable">
              {connectedDevices.length > 0 ? (
                <div className="space-y-4">
                  {connectedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-shrink-0">
                            <p className="text-xs font-medium text-gray-600">Device Name</p>
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-semibold text-gray-900">{device.name}</p>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-shrink-0">
                            <p className="text-xs font-medium text-gray-600">Reader ID</p>
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-semibold text-gray-900">{device.readerId}</p>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-shrink-0">
                            <p className="text-xs font-medium text-gray-600">Connected On</p>
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-semibold text-gray-900">{device.connectedOn}</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnect(device.id)}
                            className="h-9 px-4 text-xs font-semibold border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={handleAddAnotherReader}
                    className="w-full h-11 text-sm font-semibold border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
                  >
                    Add Another Reader
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Radio className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    No Devices Connected
                  </p>
                  <p className="text-sm text-gray-600">
                    Scan and connect a device to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Confirm Connection</DialogTitle>
            <DialogDescription className="text-sm">
              Connect to {selectedDeviceToConnect?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Note:</span> Connecting to a new reader will disconnect the current one (if any).
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelConnect}
                className="h-10 px-6 text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmConnect}
                className="h-10 px-6 text-sm font-semibold bg-primary text-white hover:bg-primary/90"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connecting Modal */}
      <Dialog open={isConnecting} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-base">Connecting to Device</DialogTitle>
            <DialogDescription className="text-sm">
              Please wait while we establish the connection to {deviceConnectingName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-900 text-center">
              Connecting to {deviceConnectingName}…
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancelConnecting}
              className="flex-1 sm:flex-initial h-10 px-6 text-sm font-semibold border-red-300 text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-base">Device Connected</DialogTitle>
            <DialogDescription className="text-sm">
              Your card reader has been successfully paired and is ready to use
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 text-center">
              {successDeviceName} is now connected
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleContinueSuccess}
              className="h-10 px-6 text-sm font-semibold bg-primary text-white hover:bg-primary/90"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigureCardReader;

