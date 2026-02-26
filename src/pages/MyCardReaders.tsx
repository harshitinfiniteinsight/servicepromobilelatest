import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import KebabMenu, { KebabMenuItem } from "@/components/common/KebabMenu";
import { Bluetooth, Radio, RefreshCw, Trash2, X, Plus, WifiOff } from "lucide-react";
import { showSuccessToast } from "@/utils/toast";

interface SavedReader {
  id: string;
  name: string;
  readerId: string;
}

const MyCardReaders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedReaders, setSavedReaders] = useState<SavedReader[]>([
    {
      id: "reader-1",
      name: "PrimeReader 4231",
      readerId: "PR-4F21D",
    },
    {
      id: "reader-2",
      name: "PrimeReader 5120",
      readerId: "PR-5A20E",
    },
  ]);
  // Initialize with PrimeReader 4231 (PR-4F21D) as connected for demo
  const getInitialConnectedId = () => {
    const stored = localStorage.getItem("currentConnectedReaderId");
    if (stored) return stored;
    // Set PrimeReader 4231 (PR-4F21D) as connected for demo purposes
    const connectedReaderId = "PR-4F21D";
    localStorage.setItem("currentConnectedReaderId", connectedReaderId);
    return connectedReaderId;
  };

  const [currentConnectedReaderId, setCurrentConnectedReaderId] = useState<string | null>(getInitialConnectedId());
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [readerToRemove, setReaderToRemove] = useState<SavedReader | null>(null);
  const [readerToDisconnect, setReaderToDisconnect] = useState<SavedReader | null>(null);

  // Refresh connected reader ID when navigating to this screen
  useEffect(() => {
    const connectedId = localStorage.getItem("currentConnectedReaderId");
    setCurrentConnectedReaderId(connectedId);
  }, [location.pathname]);

  // Determine reader status based on currentConnectedReaderId
  // Compare using readerId (e.g., "PR-4F21D") not the internal id
  const getReaderStatus = (reader: SavedReader): "online" | "offline" => {
    return currentConnectedReaderId === reader.readerId ? "online" : "offline";
  };

  const handleReconnect = (reader: SavedReader) => {
    // Navigate to scan screen for reconnection
    navigate("/settings/configure-card-reader/scan", {
      state: { reconnectReader: reader },
    });
  };

  const handleDisconnectClick = (reader: SavedReader) => {
    setReaderToDisconnect(reader);
    setDisconnectModalOpen(true);
  };

  const handleConfirmDisconnect = () => {
    if (readerToDisconnect) {
      // Clear connected reader ID
      localStorage.removeItem("currentConnectedReaderId");
      setCurrentConnectedReaderId(null);
      showSuccessToast("Reader disconnected successfully");
      setDisconnectModalOpen(false);
      setReaderToDisconnect(null);
    }
  };

  const handleCancelDisconnect = () => {
    setDisconnectModalOpen(false);
    setReaderToDisconnect(null);
  };

  const handleRemoveClick = (reader: SavedReader) => {
    setReaderToRemove(reader);
    setRemoveModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (readerToRemove) {
      setSavedReaders(prev => prev.filter(r => r.id !== readerToRemove.id));
      // If the removed reader was currently connected, clear the connected ID
      // Compare using readerId (e.g., "PR-4F21D")
      if (currentConnectedReaderId === readerToRemove.readerId) {
        localStorage.removeItem("currentConnectedReaderId");
        setCurrentConnectedReaderId(null);
      }
      showSuccessToast("Reader removed successfully");
      setRemoveModalOpen(false);
      setReaderToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setRemoveModalOpen(false);
    setReaderToRemove(null);
  };

  const handlePairNewReader = () => {
    // Navigate to scan screen to pair a new reader
    navigate("/settings/configure-card-reader/scan");
  };

  const buildMenuItems = (reader: SavedReader): KebabMenuItem[] => {
    const status = getReaderStatus(reader);
    const items: KebabMenuItem[] = [];

    if (status === "online") {
      // Online: Disconnect, Remove
      items.push({
        label: "Disconnect",
        icon: WifiOff,
        action: () => handleDisconnectClick(reader),
      });
      items.push({
        label: "Remove",
        icon: Trash2,
        action: () => handleRemoveClick(reader),
        separator: true,
        variant: "destructive",
      });
    } else {
      // Offline: Re-connect, Remove
      items.push({
        label: "Re-connect",
        icon: RefreshCw,
        action: () => handleReconnect(reader),
      });
      items.push({
        label: "Remove",
        icon: Trash2,
        action: () => handleRemoveClick(reader),
        separator: true,
        variant: "destructive",
      });
    }

    return items;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FDF4EF" }}>
      <MobileHeader 
        title="My Card Readers" 
        showBack={true}
      />
      
      <div className="flex-1 overflow-y-auto scrollable pt-12 pb-4">
        <div className="px-4 py-4">
          {/* No Reader Connected Message */}
          {savedReaders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Radio className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 text-center">
                No card reader connected
              </p>
            </div>
          )}

          {/* Section Title */}
          <h2 className="text-sm font-bold text-gray-700 mb-3">My Card Readers</h2>

          {/* Saved Readers List */}
          {savedReaders.length > 0 ? (
            <div className="space-y-3 mb-4">
              {savedReaders.map((reader) => (
                <div
                  key={reader.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between">
                    {/* Left: Icon and Device Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bluetooth className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {reader.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {reader.readerId}
                        </p>
                      </div>
                    </div>

                    {/* Right: Status and Menu */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Status Pill */}
                      {getReaderStatus(reader) === "online" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#E9F7F1", color: "#32BA7C" }}>
                          Online
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#d1d1d1", color: "#555" }}>
                          Offline
                        </span>
                      )}
                      
                      {/* 3-Dot Menu */}
                      <KebabMenu
                        items={buildMenuItems(reader)}
                        align="end"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-500 text-center py-4">
                No saved readers yet
              </p>
            </div>
          )}

          {/* Pair New Reader Button */}
          <Button
            onClick={handlePairNewReader}
            className="w-full h-11 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Pair new Card Reader
          </Button>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
        <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Remove Reader</DialogTitle>
          <DialogDescription className="sr-only">
            Confirmation modal for removing saved reader
          </DialogDescription>
          
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
            <DialogTitle className="text-lg font-semibold text-gray-800">Remove Reader</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
              onClick={handleCancelRemove}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </DialogHeader>

          {/* Content */}
          <div className="space-y-4 mt-3">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              Are you sure you want to remove this saved reader?
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelRemove}
              className="flex-1 h-11 text-sm font-semibold rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              className="flex-1 h-11 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Modal */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="w-[90%] max-w-sm mx-auto p-5 rounded-2xl shadow-lg bg-white [&>button]:hidden max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Disconnect Reader</DialogTitle>
          <DialogDescription className="sr-only">
            Confirmation modal for disconnecting reader
          </DialogDescription>
          
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
            <DialogTitle className="text-lg font-semibold text-gray-800">Disconnect Reader?</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
              onClick={handleCancelDisconnect}
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </DialogHeader>

          {/* Content */}
          <div className="space-y-4 mt-3">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              Are you sure you want to disconnect this device?
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelDisconnect}
              className="flex-1 h-11 text-sm font-semibold rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDisconnect}
              className="flex-1 h-11 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              Disconnect
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCardReaders;

