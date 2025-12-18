import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TabletHeader from "@/components/layout/TabletHeader";
import { Button } from "@/components/ui/button";
import { Bluetooth, Radio, X } from "lucide-react";
import { showSuccessToast } from "@/utils/toast";

interface ConnectedDevice {
  id: string;
  name: string;
  readerId: string;
  connectedOn: string;
}

const ConfigureCardReader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock state - in real app, this would come from API/context
  // Start with no devices connected
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);

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

  const handleScanForDevices = () => {
    // Navigate to scan screen
    navigate("/settings/configure-card-reader/scan");
  };

  const handleDisconnect = (deviceId: string) => {
    // Find the device to get its readerId before removing
    const deviceToDisconnect = connectedDevices.find(d => d.id === deviceId);
    setConnectedDevices(prev => prev.filter(device => device.id !== deviceId));
    // Clear connected reader ID from localStorage (only if this was the connected device)
    if (deviceToDisconnect) {
      const currentConnectedId = localStorage.getItem("currentConnectedReaderId");
      if (currentConnectedId === deviceToDisconnect.readerId) {
        localStorage.removeItem("currentConnectedReaderId");
      }
    }
    showSuccessToast("Device disconnected successfully");
  };

  const handleAddAnotherReader = () => {
    // Navigate to My Card Readers screen
    navigate("/settings/card-readers");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <TabletHeader 
        title="Configure Card Reader" 
        showBack={true}
      />
      
      <div className="flex-1 overflow-y-auto scrollable pb-4">
        <div className="px-4 py-4">
          {/* Scan for Devices Button - Right Aligned */}
          <div className="flex justify-end mb-3">
            <Button
              size="sm"
              onClick={handleScanForDevices}
              className="h-8 px-3 text-xs font-semibold rounded-full bg-primary text-white hover:bg-primary/90"
            >
              <Bluetooth className="h-3.5 w-3.5 mr-1.5" />
              Scan for Devices
            </Button>
          </div>

          {/* Section Title */}
          <h2 className="text-sm font-bold text-gray-700 mb-3">Connected Devices</h2>

          {connectedDevices.length > 0 ? (
            <div className="space-y-4">
              {/* Connected Device Card */}
              {connectedDevices.map((device) => (
                <div
                  key={device.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Device Info */}
                  <div className="p-4 space-y-3">
                    {/* Device Name */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-shrink-0">
                        <p className="text-xs font-medium text-gray-600">Device Name</p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold text-gray-900">{device.name}</p>
                      </div>
                    </div>

                    {/* Reader ID */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-shrink-0">
                        <p className="text-xs font-medium text-gray-600">Reader ID</p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold text-gray-900">{device.readerId}</p>
                      </div>
                    </div>

                    {/* Connected On */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-shrink-0">
                        <p className="text-xs font-medium text-gray-600">Connected On</p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold text-gray-900">{device.connectedOn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Disconnect Button */}
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

              {/* Add Another Reader Button */}
              <Button
                variant="outline"
                onClick={handleAddAnotherReader}
                className="w-full h-11 text-sm font-semibold border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
              >
                Add Another Reader
              </Button>
            </div>
          ) : (
            /* No Device Connected State */
            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Currently no device is connected.
              </p>
              <p className="text-sm text-gray-600">
                Scan and connect a device.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigureCardReader;

