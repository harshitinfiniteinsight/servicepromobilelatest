// Customer service for managing customer data and pictures

export interface CustomerPicture {
  id: string;
  customerId: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  uploadedBy?: string;
}

const STORAGE_KEY = "servicepro_customer_pictures";

// Mock storage for customer pictures (in real app, this would be API calls)
const getStoredPictures = (): Record<string, CustomerPicture[]> => {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const savePictures = (pictures: Record<string, CustomerPicture[]>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pictures));
};

/**
 * Check if a URL is a valid blob URL (blob URLs become invalid after page refresh)
 * @param url - The URL to check
 * @returns true if URL is a blob URL
 */
const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Load all pictures for a specific customer
 * @param customerId - The customer ID
 * @returns Array of customer pictures sorted by createdAt DESC
 */
export const loadCustomerPictures = async (customerId: string): Promise<CustomerPicture[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const allPictures = getStoredPictures();
  let customerPictures = allPictures[customerId] || [];
  
  // Filter out pictures with invalid blob URLs (they won't work after page refresh)
  // In a real app, these would be server URLs, not blob URLs
  customerPictures = customerPictures.filter(pic => {
    // Keep data URLs (base64) and regular URLs, but remove blob URLs
    // Blob URLs are only valid in the session they were created
    if (isBlobUrl(pic.url) || (pic.thumbnailUrl && isBlobUrl(pic.thumbnailUrl))) {
      // Silently remove invalid blob URLs
      return false;
    }
    return true;
  });
  
  // Update storage to remove invalid entries
  if (customerPictures.length !== (allPictures[customerId] || []).length) {
    allPictures[customerId] = customerPictures;
    savePictures(allPictures);
  }
  
  // Sort by createdAt DESC (most recent first)
  return customerPictures.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
};

/**
 * Upload a picture for a customer
 * @param customerId - The customer ID
 * @param file - The image file to upload
 * @returns The created CustomerPicture object
 */
export const uploadCustomerPicture = async (
  customerId: string,
  file: File
): Promise<CustomerPicture> => {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File size must be less than 10MB");
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Convert file to base64 data URL (persists across page refreshes)
  // In real app, upload to server and get URL
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const thumbnailUrl = url; // In real app, generate thumbnail on server

  const newPicture: CustomerPicture = {
    id: `pic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    url,
    thumbnailUrl,
    createdAt: new Date().toISOString(),
    uploadedBy: "Current User", // Replace with actual user from context/auth
  };

  // Save to storage
  const allPictures = getStoredPictures();
  if (!allPictures[customerId]) {
    allPictures[customerId] = [];
  }
  allPictures[customerId].push(newPicture);
  savePictures(allPictures);

  return newPicture;
};

/**
 * Delete a customer picture
 * @param customerId - The customer ID
 * @param pictureId - The picture ID to delete
 */
export const deleteCustomerPicture = async (
  customerId: string,
  pictureId: string
): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const allPictures = getStoredPictures();
  if (allPictures[customerId]) {
    allPictures[customerId] = allPictures[customerId].filter(pic => pic.id !== pictureId);
    savePictures(allPictures);
  }
};

/**
 * Service Picture interface for Before/After service images
 */
export interface CustomerServicePicture {
  jobId: string;
  orderId?: string;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  createdAt: string;
  customerId: string;
}

/**
 * Load all service pictures (Before/After) for a specific customer
 * @param customerId - The customer ID
 * @param jobs - Array of jobs to match against (optional, will use mockJobs if not provided)
 * @returns Array of service pictures grouped by job/order
 */
export const loadCustomerServicePictures = async (
  customerId: string,
  jobs?: Array<{ id: string; customerId: string; [key: string]: any }>
): Promise<CustomerServicePicture[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (typeof window === "undefined") return [];

  // Get job pictures from localStorage (same storage used by Jobs page)
  const jobPicturesStorage = localStorage.getItem("jobPictures");
  if (!jobPicturesStorage) return [];

  const jobPictures: Record<string, { beforeImage: string | null; afterImage: string | null }> = 
    JSON.parse(jobPicturesStorage);

  // If jobs not provided, try to get from localStorage or use empty array
  // In a real app, this would be an API call
  let jobsList: Array<{ id: string; customerId: string; [key: string]: any }> = [];
  
  if (jobs) {
    jobsList = jobs;
  } else {
    // Try to get from localStorage if stored
    const jobsStorage = localStorage.getItem("servicepro_jobs");
    if (jobsStorage) {
      try {
        jobsList = JSON.parse(jobsStorage);
      } catch (e) {
        console.warn("Failed to parse jobs from localStorage", e);
      }
    }
  }

  const servicePictures: CustomerServicePicture[] = [];

  // Create a map of jobId -> job for quick lookup
  const jobsMap = new Map<string, { customerId: string; [key: string]: any }>();
  jobsList.forEach(job => {
    jobsMap.set(job.id, job);
  });

  // Iterate through all job pictures and match with customer
  for (const [jobId, pictures] of Object.entries(jobPictures)) {
    // Filter out invalid blob URLs
    let beforeImage = pictures.beforeImage;
    let afterImage = pictures.afterImage;
    
    if (beforeImage && isBlobUrl(beforeImage)) {
      // Silently remove invalid blob URLs
      beforeImage = null;
    }
    if (afterImage && isBlobUrl(afterImage)) {
      // Silently remove invalid blob URLs
      afterImage = null;
    }
    
    // Only include if there's at least one valid image
    if (!beforeImage && !afterImage) continue;

    // Get job info to verify customerId
    const job = jobsMap.get(jobId);
    
    // Only include if job exists and matches customer
    // In production, we should always have job data
    if (job && job.customerId === customerId) {
      // Try to get orderId from job if available
      const orderId = job?.orderId || job?.id || undefined;

      servicePictures.push({
        jobId,
        orderId,
        beforeImageUrl: beforeImage,
        afterImageUrl: afterImage,
        createdAt: job?.createdAt || job?.scheduledDate || job?.date || new Date().toISOString(),
        customerId: job.customerId,
      });
    }
  }

  // Sort by createdAt DESC (most recent first)
  return servicePictures.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
};

