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
 * @returns Result object with success status and job ID
 */
export function convertToJob(
  sourceType: DocumentSourceType,
  sourceId: string
): ConvertToJobResult {
  try {
    let jobData: any = null;
    let document: any = null;

    // Find and process the source document
    if (sourceType === "invoice") {
      document = mockInvoices.find((inv) => inv.id === sourceId);
      if (!document) {
        return { success: false, error: "Invoice not found" };
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
        date: document.issueDate || new Date().toISOString().split("T")[0],
        time: "09:00 AM", // Default time
        status: "Scheduled",
        location: (document as any).jobAddress || customer?.address || "",
        sourceType: "invoice",
        sourceId: document.id,
        amount: document.amount,
      };

      // Update invoice status
      document.status = "Job Created";
    } else if (sourceType === "estimate") {
      document = mockEstimates.find((est) => est.id === sourceId);
      if (!document) {
        return { success: false, error: "Estimate not found" };
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
        date: document.date || new Date().toISOString().split("T")[0],
        time: "10:00 AM",
        status: "Scheduled",
        location: (document as any).jobAddress || customer?.address || "",
        sourceType: "estimate",
        sourceId: document.id,
        amount: document.amount,
      };

      // Update estimate status
      document.status = "Converted to Job";

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
      if (!document) {
        return { success: false, error: "Agreement not found" };
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
        date: document.startDate || new Date().toISOString().split("T")[0],
        time: "11:00 AM",
        status: "Scheduled",
        location: (document as any).jobAddress || customer?.address || "",
        sourceType: "agreement",
        sourceId: document.id,
        amount: document.monthlyAmount,
      };

      // Update agreement status
      document.status = "Job Created / Converted";
    } else {
      return { success: false, error: "Invalid source type" };
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

