import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import FloatingCartButton from "./FloatingCartButton";
import NotificationOnboardingModal from "@/components/modals/NotificationOnboardingModal";
import { toast } from "sonner";

interface MobileLayoutProps {
  children: React.ReactNode;
}

const FIRST_LOGIN_MODAL_KEY = "sp911_show_notification_onboarding";
const ONBOARDING_DISMISSED_KEY = "sp911_notification_onboarding_dismissed";
const REMIND_AT_KEY = "sp911_notification_onboarding_remind_at";

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const [showNotificationOnboarding, setShowNotificationOnboarding] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const shouldShowOnboarding = localStorage.getItem(FIRST_LOGIN_MODAL_KEY) === "true";
    const isDismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "true";
    const remindAt = Number(localStorage.getItem(REMIND_AT_KEY) || "0");
    const isReminderDue = !remindAt || Date.now() >= remindAt;

    if (isAuthenticated && shouldShowOnboarding && !isDismissed && isReminderDue) {
      setShowNotificationOnboarding(true);
    }
  }, []);

  const handleMaybeLater = () => {
    localStorage.setItem(REMIND_AT_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    setShowNotificationOnboarding(false);
  };

  const handleEnableNotifications = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          toast.success("Notifications enabled successfully.");
        } else {
          toast.info("Notifications were not enabled. You can allow them anytime from browser settings.");
        }
      } else {
        toast.info("Notification permissions are not supported on this device.");
      }
    } catch {
      toast.error("Unable to request notification permissions right now.");
    } finally {
      localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
      localStorage.setItem(FIRST_LOGIN_MODAL_KEY, "false");
      localStorage.removeItem(REMIND_AT_KEY);
      setShowNotificationOnboarding(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <main className="flex-1 overflow-hidden pb-16">
        {children}
      </main>
      <BottomNav />
      <FloatingCartButton />
      <NotificationOnboardingModal
        open={showNotificationOnboarding}
        onEnableNotifications={handleEnableNotifications}
        onMaybeLater={handleMaybeLater}
      />
    </div>
  );
};

export default MobileLayout;


