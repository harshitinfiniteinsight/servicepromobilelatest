import { mockJobs } from "@/data/mobileMockData";

/**
 * Finds the job ID associated with a given document (invoice, estimate, or agreement)
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

  const job = jobs.find(
    (j: { sourceId: string; sourceType: string }) =>
      j.sourceId === documentId && j.sourceType === documentType
  );

  return job?.id;
};

/**
 * Creates a lookup map of document IDs to job IDs for efficient bulk lookups
 * @param documentType - The type of documents: "invoice" | "estimate" | "agreement"
 * @returns Map of document IDs to job IDs
 */
export const createJobLookupMap = (
  documentType: "invoice" | "estimate" | "agreement"
): Map<string, string> => {
  const storedJobs = localStorage.getItem("mockJobs");
  const jobs = storedJobs ? JSON.parse(storedJobs) : mockJobs;

  const lookupMap = new Map<string, string>();

  jobs.forEach((job: { id: string; sourceId: string; sourceType: string }) => {
    if (job.sourceType === documentType) {
      lookupMap.set(job.sourceId, job.id);
    }
  });

  return lookupMap;
};
