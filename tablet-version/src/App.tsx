import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import TabletLayout from "./components/layout/TabletLayout";
import { CartProvider } from "@/contexts/CartContext";

// Import pages (will be created)
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Index from "./pages/Index";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import AddCustomer from "./pages/AddCustomer";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import Invoices from "./pages/Invoices";
import AddInvoice from "./pages/AddInvoice";
import InvoiceDueAlert from "./pages/InvoiceDueAlert";
import InvoiceDetails from "./pages/InvoiceDetails";
import Estimates from "./pages/Estimates";
import AddEstimate from "./pages/AddEstimate";
import EstimateDetails from "./pages/EstimateDetails";
import Agreements from "./pages/Agreements";
import AddAgreement from "./pages/AddAgreement";
import AgreementDetails from "./pages/AgreementDetails";
import MinimumDepositPercentage from "./pages/MinimumDepositPercentage";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import AddEmployee from "./pages/AddEmployee";
import EmployeeSchedule from "./pages/EmployeeSchedule";
import EmployeeTracking from "./pages/EmployeeTracking";
import EmployeeJobRoute from "./pages/EmployeeJobRoute";
import JobDetails from "./pages/JobDetails";
import Inventory from "./pages/Inventory";
import InventoryItemDetails from "./pages/InventoryItemDetails";
import AddInventoryItem from "./pages/AddInventoryItem";
import EditInventoryItem from "./pages/EditInventoryItem";
import AddDiscount from "./pages/AddDiscount";
import InventoryStockInOut from "./pages/InventoryStockInOut";
import InventoryRefund from "./pages/InventoryRefund";
import Discounts from "./pages/Discounts";
import LowInventoryAlertSettings from "./pages/LowInventoryAlertSettings";
import ManageAppointments from "./pages/ManageAppointments";
import AddAppointment from "./pages/AddAppointment";
import Reports from "./pages/Reports";
import InvoiceReport from "./pages/InvoiceReport";
import EstimateReport from "./pages/EstimateReport";
import MonthlyReportAlert from "./pages/MonthlyReportAlert";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import PermissionSettings from "./pages/PermissionSettings";
import FeedbackSettings from "./pages/settings/FeedbackSettings";
import ChangeLanguage from "./pages/ChangeLanguage";
import Help from "./pages/Help";
import AppBenefits from "./pages/AppBenefits";
import TermsConditions from "./pages/TermsConditions";
import ReturnPolicy from "./pages/ReturnPolicy";
import BusinessPolicies from "./pages/BusinessPolicies";
import PaymentMethods from "./pages/PaymentMethods";
import ConfigureCardReader from "./pages/ConfigureCardReader";
import ScanForDevices from "./pages/ScanForDevices";
import MyCardReaders from "./pages/MyCardReaders";
import Walkthrough from "./pages/Walkthrough";
import NotFound from "./pages/NotFound";
import CustomerSelection from "./pages/CustomerSelection";
import CheckoutSummary from "./pages/CheckoutSummary";
import CheckoutPayment from "./pages/CheckoutPayment";
import OrderConfirmation from "./pages/OrderConfirmation";
import SellProduct from "./pages/SellProduct";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/signin', '/signup', '/walkthrough', '/forgot-password'].includes(location.pathname);

  return (
    <div className="h-full w-full overflow-hidden">
      {isAuthPage ? (
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/walkthrough" element={<Walkthrough />} />
        </Routes>
      ) : (
        <TabletLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<AddCustomer />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<AddJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/appointments/manage" element={<ManageAppointments />} />
            <Route path="/appointments/add" element={<AddAppointment mode="create" />} />
            <Route path="/appointments/new" element={<AddAppointment mode="create" />} />
            <Route path="/appointments/:id/edit" element={<AddAppointment mode="edit" />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id/edit" element={<AddInvoice />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />
            <Route path="/invoices/new" element={<AddInvoice />} />
            <Route path="/invoices/due-alert" element={<InvoiceDueAlert />} />
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/estimates/:id" element={<EstimateDetails />} />
            <Route path="/estimates/new" element={<AddEstimate />} />
            <Route path="/estimates/:id/edit" element={<AddEstimate />} />
            <Route path="/agreements" element={<Agreements />} />
            <Route path="/agreements/:id/edit" element={<AddAgreement />} />
            <Route path="/agreements/:id" element={<AgreementDetails />} />
            <Route path="/agreements/new" element={<AddAgreement />} />
            <Route path="/agreements/minimum-deposit" element={<MinimumDepositPercentage />} />
            <Route path="/checkout/customer" element={<CustomerSelection />} />
            <Route path="/checkout/summary" element={<CheckoutSummary />} />
            <Route path="/checkout/payment" element={<CheckoutPayment />} />
            <Route path="/checkout/confirmation" element={<OrderConfirmation />} />
            <Route path="/sales/sell-product" element={<SellProduct />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/new" element={<AddEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/employees/schedule" element={<EmployeeSchedule />} />
            <Route path="/employees/job-route" element={<EmployeeJobRoute />} />
            <Route path="/employees/tracking" element={<EmployeeTracking />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/new" element={<AddInventoryItem />} />
            <Route path="/inventory/:id/edit" element={<EditInventoryItem />} />
            <Route path="/inventory/:id" element={<InventoryItemDetails />} />
            <Route path="/inventory/alert-settings" element={<LowInventoryAlertSettings />} />
            <Route path="/inventory/stock-in-out" element={<InventoryStockInOut />} />
            <Route path="/inventory/refunds" element={<InventoryRefund />} />
            <Route path="/inventory/discounts" element={<Discounts />} />
            <Route path="/inventory/discounts/new" element={<AddDiscount />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/invoice" element={<InvoiceReport />} />
            <Route path="/reports/estimate" element={<EstimateReport />} />
            <Route path="/reports/monthly-alert" element={<MonthlyReportAlert />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/profile" element={<Profile />} />
            <Route path="/settings/change-password" element={<ChangePassword />} />
            <Route path="/settings/permissions" element={<PermissionSettings />} />
            <Route path="/settings/feedback" element={<FeedbackSettings />} />
            <Route path="/settings/terms" element={<TermsConditions />} />
            <Route path="/settings/return-policy" element={<ReturnPolicy />} />
            <Route path="/settings/business-policies" element={<BusinessPolicies />} />
            <Route path="/settings/payment-methods" element={<PaymentMethods />} />
            <Route path="/settings/configure-card-reader" element={<ConfigureCardReader />} />
            <Route path="/settings/configure-card-reader/scan" element={<ScanForDevices />} />
            <Route path="/settings/card-readers" element={<MyCardReaders />} />
            <Route path="/settings/language" element={<ChangeLanguage />} />
            <Route path="/settings/help" element={<Help />} />
            <Route path="/settings/help/app-benefits" element={<AppBenefits />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TabletLayout>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppContent />
      </BrowserRouter>
    <style>{`
      @keyframes slideDownFadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .success-toast-custom,
      [data-sonner-toast][data-type="success"],
      [data-sonner-toast][data-type="success"].success-toast-custom {
        background: #E7F8EF !important;
        border: 1px solid #34C759 !important;
        color: #0F5132 !important;
        border-radius: 12px !important;
        padding: 12px 14px !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        animation: slideDownFadeIn 0.3s ease-out !important;
      }
      [data-sonner-toast][data-type="success"] [data-icon],
      [data-sonner-toast][data-type="success"] svg {
        color: #34C759 !important;
      }
      [data-sonner-toast][data-type="success"] [data-content] {
        color: #0F5132 !important;
      }
      [data-sonner-toast][data-type="error"] {
        background: #FEF2F2 !important;
        border: 1px solid #EF4444 !important;
        color: #991B1B !important;
        border-radius: 12px !important;
        padding: 12px 14px !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        animation: slideDownFadeIn 0.3s ease-out !important;
      }
      [data-sonner-toast][data-type="error"] [data-icon],
      [data-sonner-toast][data-type="error"] svg {
        color: #EF4444 !important;
      }
      [data-sonner-toast][data-type="error"] [data-content] {
        color: #991B1B !important;
      }
    `}</style>
    </CartProvider>
  </QueryClientProvider>
);

export default App;


