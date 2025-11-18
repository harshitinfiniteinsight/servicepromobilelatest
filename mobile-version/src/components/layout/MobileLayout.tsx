import BottomNav from "./BottomNav";
import FloatingCartButton from "./FloatingCartButton";

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <main className="flex-1 overflow-hidden pb-16">
        {children}
      </main>
      <BottomNav />
      <FloatingCartButton />
    </div>
  );
};

export default MobileLayout;


