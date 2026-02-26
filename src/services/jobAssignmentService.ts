import { mockJobs } from "@/data/mobileMockData";

export type DocumentType = "estimate" | "invoice" | "agreement";

export interface LinkedDocument {
  type: DocumentType;
  id: string;
  linkedAt: string;
}

export interface AssignToJobResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

/**
 * Get all jobs from localStorage merged with mock data
 */
export function getAllJobs(): any[] {
  const storedJobs = localStorage.getItem("mockJobs");
  const localJobs = storedJobs ? JSON.parse(storedJobs) : [];
  
  // Merge with mock jobs, avoiding duplicates
  const mergedJobs = [...localJobs];
  mockJobs.forEach((mockJob) => {
    if (!mergedJobs.some((j: any) => j.id === mockJob.id)) {
      mergedJobs.push(mockJob);
    }
  });
  
  return mergedJobs;
}

/**
 * Check if a document is already assigned to any job
 */
export function getJobForDocument(documentType: DocumentType, documentId: string): string | null {
  const jobs = getAllJobs();
  
  for (const job of jobs) {
    // Check primary source
    if (job.sourceType === documentType && job.sourceId === documentId) {
      return job.id;
    }
    
    // Check linked documents
    if (job.linkedDocuments && Array.isArray(job.linkedDocuments)) {
      const found = job.linkedDocuments.find(
        (doc: LinkedDocument) => doc.type === documentType && doc.id === documentId
      );
      if (found) {
        return job.id;
      }
    }
  }
  
  return null;
}

/**
 * Check if a document is already assigned to a specific job
 */
export function isDocumentAssignedToJob(
  documentType: DocumentType,
  documentId: string,
  jobId: string
): boolean {
  const jobs = getAllJobs();
  const job = jobs.find((j: any) => j.id === jobId);
  
  if (!job) return false;
  
  // Check primary source
  if (job.sourceType === documentType && job.sourceId === documentId) {
    return true;
  }
  
  // Check linked documents
  if (job.linkedDocuments && Array.isArray(job.linkedDocuments)) {
    return job.linkedDocuments.some(
      (doc: LinkedDocument) => doc.type === documentType && doc.id === documentId
    );
  }
  
  return false;
}

/**
 * Assign a document (estimate, invoice, or agreement) to an existing job
 * @param documentType - Type of document to assign
 * @param documentId - ID of the document
 * @param jobId - ID of the job to assign to
 * @returns Result object with success status
 */
export function assignToJob(
  documentType: DocumentType,
  documentId: string,
  jobId: string
): AssignToJobResult {
  try {
    // Validate inputs
    if (!documentType || !documentId || !jobId) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Get all jobs
    const jobs = getAllJobs();
    const jobIndex = jobs.findIndex((j: any) => j.id === jobId);

    if (jobIndex === -1) {
      return {
        success: false,
        error: "Job not found",
      };
    }

    const job = jobs[jobIndex];

    // Check if already assigned to this job (idempotency)
    if (isDocumentAssignedToJob(documentType, documentId, jobId)) {
      // Already assigned - return success (idempotent)
      return {
        success: true,
        jobId: jobId,
      };
    }

    // Check if already assigned to another job
    const existingJobId = getJobForDocument(documentType, documentId);
    if (existingJobId && existingJobId !== jobId) {
      return {
        success: false,
        error: `Document is already assigned to ${existingJobId}`,
      };
    }

    // Initialize linkedDocuments array if it doesn't exist
    if (!job.linkedDocuments) {
      job.linkedDocuments = [];
    }

    // Add the document to linked documents
    const linkedDoc: LinkedDocument = {
      type: documentType,
      id: documentId,
      linkedAt: new Date().toISOString(),
    };

    job.linkedDocuments.push(linkedDoc);

    // Update the job in the array
    jobs[jobIndex] = job;

    // Save to localStorage
    localStorage.setItem("mockJobs", JSON.stringify(jobs));

    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent("documentAssignedToJob", {
        detail: {
          jobId,
          documentType,
          documentId,
          linkedDocument: linkedDoc,
        },
      })
    );

    // Track analytics event
    window.dispatchEvent(
      new CustomEvent("analytics", {
        detail: {
          event: "assign_to_job_success",
          documentType,
          documentId,
          jobId,
        },
      })
    );

    return {
      success: true,
      jobId: jobId,
    };
  } catch (error) {
    console.error("Error assigning to job:", error);

    // Track analytics event for failure
    window.dispatchEvent(
      new CustomEvent("analytics", {
        detail: {
          event: "assign_to_job_failed",
          documentType,
          documentId,
          jobId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all documents linked to a job
 */
export function getLinkedDocuments(jobId: string): LinkedDocument[] {
  const jobs = getAllJobs();
  const job = jobs.find((j: any) => j.id === jobId);

  if (!job) return [];

  const documents: LinkedDocument[] = [];

  // Add primary source document if exists
  if (job.sourceType && job.sourceType !== "none" && job.sourceId) {
    documents.push({
      type: job.sourceType as DocumentType,
      id: job.sourceId,
      linkedAt: job.createdAt || new Date().toISOString(),
    });
  }

  // Add linked documents
  if (job.linkedDocuments && Array.isArray(job.linkedDocuments)) {
    documents.push(...job.linkedDocuments);
  }

  return documents;
}

/**
 * Unassign a document from a job
 */
export function unassignFromJob(
  documentType: DocumentType,
  documentId: string,
  jobId: string
): AssignToJobResult {
  try {
    const jobs = getAllJobs();
    const jobIndex = jobs.findIndex((j: any) => j.id === jobId);

    if (jobIndex === -1) {
      return {
        success: false,
        error: "Job not found",
      };
    }

    const job = jobs[jobIndex];

    // Cannot unassign primary source document
    if (job.sourceType === documentType && job.sourceId === documentId) {
      return {
        success: false,
        error: "Cannot unassign primary source document",
      };
    }

    // Remove from linked documents
    if (job.linkedDocuments && Array.isArray(job.linkedDocuments)) {
      job.linkedDocuments = job.linkedDocuments.filter(
        (doc: LinkedDocument) => !(doc.type === documentType && doc.id === documentId)
      );
    }

    jobs[jobIndex] = job;
    localStorage.setItem("mockJobs", JSON.stringify(jobs));

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("documentUnassignedFromJob", {
        detail: { jobId, documentType, documentId },
      })
    );

    return {
      success: true,
      jobId: jobId,
    };
  } catch (error) {
    console.error("Error unassigning from job:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
