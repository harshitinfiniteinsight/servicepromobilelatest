import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const TermsConditions = () => {
  const termsContent = `
TERMS AND CONDITIONS

Last updated: January 2024

1. ACCEPTANCE OF TERMS
By accessing and using ServicePro, you accept and agree to be bound by the terms and provision of this agreement.

2. USE LICENSE
Permission is granted to temporarily use ServicePro for personal, non-commercial transitory viewing only.

3. USER ACCOUNT
You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

4. PAYMENT TERMS
All invoices are due according to the terms specified. Late payments may incur additional fees as outlined in your service agreement.

5. SERVICE AGREEMENTS
Service agreements are binding contracts. Cancellation policies apply as specified in individual agreements.

6. DATA PRIVACY
We respect your privacy and handle your data according to our Privacy Policy. Your information is secure and will not be shared without consent.

7. LIMITATION OF LIABILITY
ServicePro shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

8. MODIFICATIONS
We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.

9. CONTACT INFORMATION
For questions about these Terms, please contact us at support@servicepro.com.

10. GOVERNING LAW
These terms shall be governed by and construed in accordance with applicable laws.
  `.trim();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Terms & Conditions" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14">
        <div className="px-4 py-4">
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Terms & Conditions</h3>
                <p className="text-sm text-muted-foreground">
                  Please read these terms carefully before using our service.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
              {termsContent}
            </pre>
          </div>

          <div className="mt-4">
            <Button className="w-full" size="lg">
              I Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
