import { mockInvoices, mockEstimates, mockAgreements, mockCustomers, mockEmployees, mockJobs } from "@/data/mobileMockData";

export type DocumentSourceType = "invoice" | "estimate" | "agreement";

export interface ConvertToJobResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

/**
 * Converts an Invoice, Estimate, or Agreement to a Job
 * @param sourceType - Type of source document
 * @param sourceId - ID of the source document
 * @param scheduleDate - Optional scheduled date (YYYY-MM-DD format)
 * @param scheduleTime - Optional scheduled time (e.g., "09:00 AM")
 * @returns Result object with success status and job ID
 */
export function convertToJob(
  sourceType: DocumentSourceType,
  sourceId: string,
  scheduleDate?: string,
  scheduleTime?: string
): ConvertToJobResult {
  try {
    let jobData: any = null;
    let document: any = null;

    // Find and process the source document
    if (sourceType === "invoice") {
      document = mockInvoices.find((inv) => inv.id === sourceId);
      
      // PROTOTYPE: If invoice not found in mockInvoices, check localStorage or use mock data
      // TODO: In production, this should be a real API call to validate the invoice
      if (!document) {
        // Try to find in localStorage invoices
        try {
          const storedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
          document = storedInvoices.find((inv: any) => inv.id === sourceId);
        } catch (e) {
          console.warn("Could not load invoices from localStorage");
        }
      }
      
      // PROTOTYPE: If still not found, create a mock invoice for demo purposes
      // This ensures the prototype flow always succeeds visually
      if (!document) {
        console.log("[PROTOTYPE] Invoice not found, using mock data for demo");
        document = {
          id: sourceId,
          customerId: mockCustomers[0]?.id || "1",
          customerName: mockCustomers[0]?.name || "Demo Customer",
          employeeName: mockEmployees[0]?.name || "Demo Employee",
          issueDate: new Date().toISOString().split("T")[0],
          amount: 250.00,
          status: "Paid",
          jobAddress: mockCustomers[0]?.address || "123 Demo Street, Chicago, IL",
        };
      }

      // Get customer and employee info
      const customer = mockCustomers.find((c) => c.id === document.customerId);
      const employee = mockEmployees.find(
        (e) => e.name === (document as any).employeeName
      ) || mockEmployees[0]; // Default to first employee if not found

      // Create job from invoice
      const jobId = `JOB-${Date.now()}`;
      jobData = {
        id: jobId,
        title: `Invoice ${document.id}`,
        customerId: document.customerId,
        customerName: document.customerName,
        technicianId: employee.id,
        technicianName: employee.name,
        date: scheduleDate || document.issueDate || new Date().toISOString().split("T")[0],
        time: scheduleTime || "09:00 AM",
        status: "Scheduled",
        location: (document as any).jobAddress || customer?.address || "",
        sourceType: "invoice",
        sourceId: document.id,
        amount: document.amount,
        createdAt: new Date().toISOString(),
      };

      // Update invoice status (only if it's in the mockInvoices array)
      if (mockInvoices.find((inv) => inv.id === sourceId)) {
        document.status = "Job Created";
      }
    } else if (sourceType === "estimate") {
      document = mockEstimates.find((est) => est.id === sourceId);
      
      // PROTOTYPE: If estimate not found, use mock data for demo purposes
      if (!document) {
        console.log("[PROTOTYPE] Estimate not found, using mock data for demo");
        document = {
          id: sourceId,
          customerId: mockCustomers[0]?.id || "1",
          customerName: mockCustomers[0]?.name || "Demo Customer",
          employeeName: mockEmployees[0]?.name || "Demo Employee",
          date: new Date().toISOString().split("T")[0],
          amount: 350.00,
          status: "Approved",
          jobAddress: mockCustomers[0]?.address || "123 Demo Street, Chicago, IL",
        };
      }

      // Get customer and employee info
      const customer = mockCustomers.find((c) => c.id === document.customerId);
      const employee = mockEmployees.find(
        (e) => e.name === (document as any).employeeName
      ) || mockEmployees[0];

      // Create job from estimate
      const jobId = `JOB-${Date.now()}`;
      jobData = {
        id: jobId,
        title: `Estimate ${document.id}`,
        customerId: document.customerId,
        customerName: document.customerName,
        technicianId: employee.id,
        technicianName: employee.name,
        date: scheduleDate || document.date || new Date().toISOString().split("T")[0],
        time: scheduleTime || "10:00 AM",
        status: "Scheduled",
        location: (document as any).jobAddress || customer?.address || "",
        sourceType: "estimate",
        sourceId: document.id,
        amount: document.amount,
        createdAt: new Date().toISOString(),
      };

      // Update estimate status (only if it's in the mockEstimates array)
      if (mockEstimates.find((est) => est.id === sourceId)) {
        document.status = "Converted to Job";
      }

      // Track converted estimates (to exclude from job list)
      const convertedEstimates = JSON.parse(
        localStorage.getItem("convertedEstimates") || "[]"
      );
      if (!convertedEstimates.includes(sourceId)) {
        convertedEstimates.push(sourceId);
        localStorage.setItem(
          "convertedEstimates",
          JSON.stringify(convertedEstimates)
        );
      }
    } else if (sourceType === "agreement") {
      document = mockAgreements.find((agr) => agr.id === sourceId);
      
      // PROTOTYPE: If agreement not found, use mock data for demo purposes
      if (!document) {
        console.log("[PROTOTYPE] Agreement not found, using mock data for demo");
        document = {
          id: sourceId,
          customerId: mockCustomers[0]?.id || "1",
          customerName: mockCustomers[0]?.name || "Demo Customer",
          employeeName: mockEmployees[0]?.name || "Demo Employee",
          startDate: new Date().toISOString().split("T")[0],
          monthlyAmount: 150.00,
          type: "Service Agreement",
          status: "Active",
          jobAddress: mockCustomers[0]?.address || "123 Demo Street, Chicago, IL",
        };
      }

      // Get customer and employee info
      const customer = mockCustomers.find((c) => c.id === document.customerId);
      const employee = mockEmployees.find(
        (e) => e.name === (document as any).employeeName
      ) || mockEmployees[0];

      // Create job from agreement
      const jobId = `JOB-${Date.now()}`;
      jobData = {
        id: jobId,
        title: document.type || "Agreement Service",
        customerId: document.customerId,
        customerName: document.customerName,
        technicianId: employee.id,
        technicianName: employee.name,
        date: scheduleDate || document.startDate || new Date().toISOString().split("T")[0],
        time: scheduleTime || "11:00 AM",
        status: "Scheduled",
        location: (document as any).jobAddress || customer?.address || "",
        sourceType: "agreement",
        sourceId: document.id,
        amount: document.monthlyAmount,
        createdAt: new Date().toISOString(),
      };

      // Update agreement status (only if it's in the mockAgreements array)
      if (mockAgreements.find((agr) => agr.id === sourceId)) {
        document.status = "Job Created / Converted";
      }
    } else {
      // PROTOTYPE: For invalid source types, still succeed with mock data
      console.log("[PROTOTYPE] Unknown source type, using mock data for demo");
      const jobId = `JOB-${Date.now()}`;
      jobData = {
        id: jobId,
        title: `Service Job`,
        customerId: mockCustomers[0]?.id || "1",
        customerName: mockCustomers[0]?.name || "Demo Customer",
        technicianId: mockEmployees[0]?.id || "1",
        technicianName: mockEmployees[0]?.name || "Demo Employee",
        date: scheduleDate || new Date().toISOString().split("T")[0],
        time: scheduleTime || "09:00 AM",
        status: "Scheduled",
        location: mockCustomers[0]?.address || "123 Demo Street, Chicago, IL",
        sourceType: sourceType,
        sourceId: sourceId,
        amount: 200.00,
        createdAt: new Date().toISOString(),
      };
    }

    // Add job to mockJobs array
    // In a real app, this would be an API call: POST /jobs
    mockJobs.unshift(jobData); // Add to beginning of array

    // Persist to localStorage for persistence across page refreshes
    const existingJobs = JSON.parse(
      localStorage.getItem("mockJobs") || "[]"
    );
    existingJobs.unshift(jobData);
    localStorage.setItem("mockJobs", JSON.stringify(existingJobs));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("jobCreated", { detail: jobData }));

    return { success: true, jobId: jobData.id };
  } catch (error) {
    console.error("Error converting to job:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

