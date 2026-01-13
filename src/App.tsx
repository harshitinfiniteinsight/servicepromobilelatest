import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Jobs from "./pages/Jobs";
import Invoices from "./pages/Invoices";
import InvoiceDueAlert from "./pages/InvoiceDueAlert";
import AddInvoice from "./pages/AddInvoice";
import Estimates from "./pages/Estimates";
import AddEstimate from "./pages/AddEstimate";
import Agreements from "./pages/Agreements";
import AddAgreement from "./pages/AddAgreement";
import MinimumDepositPercentage from "./pages/MinimumDepositPercentage";
import Employees from "./pages/Employees";
import EmployeeSchedule from "./pages/EmployeeSchedule";
import EmployeeTracking from "./pages/EmployeeTracking";
import Inventory from "../../tablet-version/src/pages/Inventory";
import LowInventoryAlertSettings from "./pages/LowInventoryAlertSettings";
import InventoryStockInOut from "./pages/InventoryStockInOut";
import InventoryRefund from "./pages/InventoryRefund";
import Discounts from "./pages/Discounts";
import ManageAppointments from "./pages/ManageAppointments";
import AddAppointment from "./pages/AddAppointment";
import Reports from "./pages/Reports";
import InvoiceReport from "./pages/InvoiceReport";
import EstimateReport from "./pages/EstimateReport";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import PermissionSettings from "./pages/PermissionSettings";
import ChangeLanguage from "./pages/ChangeLanguage";
import Help from "./pages/Help";
import TermsConditions from "./pages/TermsConditions";
import ReturnPolicy from "./pages/ReturnPolicy";
import BusinessPolicies from "./pages/BusinessPolicies";
import PaymentMethods from "./pages/PaymentMethods";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Walkthrough from "./pages/Walkthrough";
import NotFound from "./pages/NotFound";
import { AIChatWidget } from "./components/AIChatWidget";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/signin', '/signup', '/walkthrough'].includes(location.pathname);

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {!isAuthPage && <AppSidebar />}
      <div className="flex-1 min-w-0 overflow-hidden">
        {!isAuthPage && <AIChatWidget />}
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/walkthrough" element={<Walkthrough />} />
          <Route path="/" element={<Index />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/appointments/manage" element={<ManageAppointments />} />
          <Route path="/appointments/add" element={<AddAppointment />} />
          <Route path="/add-appointment" element={<AddAppointment />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<AddInvoice />} />
          <Route path="/invoices/:id/edit" element={<AddInvoice />} />
          <Route path="/invoices/due-alert" element={<InvoiceDueAlert />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/estimates/new" element={<AddEstimate />} />
          <Route path="/estimates/:id/edit" element={<AddEstimate />} />
          <Route path="/agreements" element={<Agreements />} />
          <Route path="/agreements/new" element={<AddAgreement />} />
          <Route path="/agreements/:id/edit" element={<AddAgreement />} />
          <Route path="/agreements/minimum-deposit" element={<MinimumDepositPercentage />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/schedule" element={<EmployeeSchedule />} />
          <Route path="/employees/tracking" element={<EmployeeTracking />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/alert-settings" element={<LowInventoryAlertSettings />} />
          <Route path="/inventory/stock-in-out" element={<InventoryStockInOut />} />
          <Route path="/inventory/refunds" element={<InventoryRefund />} />
          <Route path="/inventory/discounts" element={<Discounts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/invoice" element={<InvoiceReport />} />
          <Route path="/reports/estimate" element={<EstimateReport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/change-password" element={<ChangePassword />} />
          <Route path="/settings/permissions" element={<PermissionSettings />} />
          <Route path="/settings/terms" element={<TermsConditions />} />
          <Route path="/settings/return-policy" element={<ReturnPolicy />} />
          <Route path="/settings/business-policies" element={<BusinessPolicies />} />
          <Route path="/settings/payment-methods" element={<PaymentMethods />} />
          <Route path="/settings/language" element={<ChangeLanguage />} />
          <Route path="/settings/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <SidebarProvider defaultOpen>
          <AppContent />
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
