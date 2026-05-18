import { Bell } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NotificationOnboardingModalProps {
  open: boolean;
  onEnableNotifications: () => void;
  onMaybeLater: () => void;
}

const NotificationOnboardingModal = ({
  open,
  onEnableNotifications,
  onMaybeLater,
}: NotificationOnboardingModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onMaybeLater()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl border-0 bg-white p-0 shadow-2xl sm:rounded-3xl [&>button]:hidden">
        <DialogTitle className="sr-only">Stay Connected with Service Pro911</DialogTitle>
        <DialogDescription className="sr-only">Enable notifications to receive real-time updates while using Service Pro911.</DialogDescription>

        <div className="px-6 py-7 sm:px-7 sm:py-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
            <Bell className="h-7 w-7 text-orange-600" />
          </div>

          <h2 className="text-xl font-semibold leading-tight text-gray-900">
            Stay Connected with Service Pro911
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Enable notifications to receive real-time updates for new jobs, inventory, appointment reminders, customer activity, payments, and important account updates.
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Notifications help you stay informed and never miss important service activity while using Service Pro911.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onMaybeLater}
              className="h-11 rounded-xl border-gray-300 px-5 text-gray-700"
            >
              Maybe Later
            </Button>
            <Button
              type="button"
              onClick={onEnableNotifications}
              className="h-11 rounded-xl bg-orange-500 px-5 text-white hover:bg-orange-600"
            >
              Enable Notifications
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationOnboardingModal;
