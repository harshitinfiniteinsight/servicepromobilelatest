import { mockJobs } from "@/data/mobileMockData";

interface LinkedDocument {
  type: "invoice" | "estimate" | "agreement";
  id: string;
  linkedAt: string;
}

/**
 * Finds the job ID associated with a given document (invoice, estimate, or agreement)
 * Checks both source documents (from "Convert to Job") and linked documents (from "Assign to Job")
 * @param documentId - The ID of the document (e.g., "INV-001", "EST-001", "AGR-001")
 * @param documentType - The type of document: "invoice" | "estimate" | "agreement"
 * @returns The job ID if found, undefined otherwise
 */
export const findJobIdForDocument = (
  documentId: string,
  documentType: "invoice" | "estimate" | "agreement"
): string | undefined => {
  // First try localStorage for the most up-to-date data
  const storedJobs = localStorage.getItem("mockJobs");
  const jobs = storedJobs ? JSON.parse(storedJobs) : mockJobs;

  // Check source document (from "Convert to Job")
  const jobFromSource = jobs.find(
    (j: { sourceId: string; sourceType: string }) =>
      j.sourceId === documentId && j.sourceType === documentType
  );

  if (jobFromSource) {
    return jobFromSource.id;
  }

  // Check linked documents (from "Assign to Job")
  const jobFromLinked = jobs.find((j: { id: string; linkedDocuments?: LinkedDocument[] }) => {
    if (j.linkedDocuments && Array.isArray(j.linkedDocuments)) {
      return j.linkedDocuments.some(
        (doc: LinkedDocument) => doc.type === documentType && doc.id === documentId
      );
    }
    return false;
  });

  return jobFromLinked?.id;
};

/**
 * Creates a lookup map of document IDs to job IDs for efficient bulk lookups
 * Includes both source documents (from "Convert to Job") and linked documents (from "Assign to Job")
 * @param documentType - The type of documents: "invoice" | "estimate" | "agreement"
 * @returns Map of document IDs to job IDs
 */
export const createJobLookupMap = (
  documentType: "invoice" | "estimate" | "agreement"
): Map<string, string> => {
  const storedJobs = localStorage.getItem("mockJobs");
  const jobs = storedJobs ? JSON.parse(storedJobs) : mockJobs;

  const lookupMap = new Map<string, string>();

  jobs.forEach((job: { id: string; sourceId: string; sourceType: string; linkedDocuments?: LinkedDocument[] }) => {
    // Add source documents (from "Convert to Job")
    if (job.sourceType === documentType && job.sourceId) {
      lookupMap.set(job.sourceId, job.id);
    }

    // Add linked documents (from "Assign to Job")
    if (job.linkedDocuments && Array.isArray(job.linkedDocuments)) {
      job.linkedDocuments.forEach((doc: LinkedDocument) => {
        if (doc.type === documentType) {
          lookupMap.set(doc.id, job.id);
        }
      });
    }
  });

  return lookupMap;
};
