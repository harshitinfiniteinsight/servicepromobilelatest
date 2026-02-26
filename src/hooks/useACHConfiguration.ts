import { useState, useEffect } from "react";

/**
 * Hook to check and manage ACH (Automated Clearing House) configuration status
 * 
 * This hook determines whether ACH is already set up for the account by checking:
 * 1. localStorage for persisted ACH setup status
 * 2. Backend state (when integrated)
 * 
 * Flow A: ACH is already configured
 * - Clicking ACH Payment card opens the payment flow directly
 * 
 * Flow B: ACH is NOT configured
 * - ACH Payment card shows "Setup ACH first" helper text
 * - Card is not directly actionable, redirects to ACH setup
 */
export const useACHConfiguration = () => {
  const [achConfigured, setAchConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if ACH is configured
    // Currently uses localStorage; can be updated to use API
    const checkACHConfiguration = () => {
      try {
        const storedAchStatus = localStorage.getItem("achConfigured");
        
        // If explicitly set in localStorage, use that value
        if (storedAchStatus !== null) {
          setAchConfigured(storedAchStatus === "true");
        } else {
          // Default to false (ACH not configured)
          setAchConfigured(false);
        }
      } catch (error) {
        console.error("Error checking ACH configuration:", error);
        setAchConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkACHConfiguration();
  }, []);

  /**
   * Set ACH configuration status
   * Used when user completes ACH setup
   */
  const setACHConfigured = (configured: boolean) => {
    localStorage.setItem("achConfigured", String(configured));
    setAchConfigured(configured);
  };

  return {
    achConfigured,
    isLoading,
    setACHConfigured,
  };
};
