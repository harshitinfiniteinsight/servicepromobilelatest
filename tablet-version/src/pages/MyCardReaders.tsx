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
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <MobileHeader 
        title="My Card Readers" 
        showBack={true}
      />
      
      <div className="flex-1 overflow-y-auto scrollable">
        {/* Constrained Content Container */}
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 pt-16 pb-6 sm:pb-8">
          
          {/* Action Button - Top Right */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={handlePairNewReader}
              className="h-10 px-6 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Pair new Card Reader
            </Button>
          </div>

          {/* Empty State */}
          {savedReaders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 mb-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Radio className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 text-center mb-1">
                No card readers saved
              </p>
            </div>
          )}

          {/* Saved Readers List */}
          {savedReaders.length > 0 && (
            <div className="space-y-3">
              {savedReaders.map((reader) => (
                <div
                  key={reader.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-4"
                >
                  <div className="flex items-center justify-between gap-4">
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
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Status Pill */}
                      {getReaderStatus(reader) === "online" ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ backgroundColor: "#E9F7F1", color: "#32BA7C" }}>
                          Online
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-gray-100 text-gray-600">
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
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Reader</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this saved reader?
            </DialogDescription>
          </DialogHeader>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCancelRemove}
              className="h-10 px-6 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              className="h-10 px-6 text-sm font-semibold bg-primary text-white hover:bg-primary/90"
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Modal */}
      <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Reader?</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this device?
            </DialogDescription>
          </DialogHeader>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCancelDisconnect}
              className="h-10 px-6 text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDisconnect}
              className="h-10 px-6 text-sm font-semibold bg-primary text-white hover:bg-primary/90"
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

