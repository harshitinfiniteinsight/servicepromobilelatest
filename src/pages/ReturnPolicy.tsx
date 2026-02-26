import MobileHeader from "@/components/layout/MobileHeader";
import { FileText, AlertCircle } from "lucide-react";

const ReturnPolicy = () => {
  const policyContent = `
RETURN POLICY

Last updated: January 2024

RETURNS AND REFUNDS

1. RETURN ELIGIBILITY
Items may be returned within 30 days of purchase, provided they are in original condition and packaging.

2. REFUND PROCESS
Refunds will be processed within 5-7 business days after we receive and inspect the returned item.

3. NON-RETURNABLE ITEMS
The following items cannot be returned:
- Custom or personalized items
- Items damaged by customer misuse
- Items without original receipt
- Services already rendered

4. RETURN SHIPPING
Customers are responsible for return shipping costs unless the return is due to our error.

5. EXCHANGES
We offer exchanges for items of equal or greater value. Price differences will be charged accordingly.

6. WARRANTY ITEMS
Items under warranty should be returned directly to the manufacturer according to warranty terms.

7. DAMAGED ITEMS
If you receive a damaged item, contact us within 48 hours with photos for immediate replacement.

8. CANCELLATION POLICY
Service appointments can be cancelled up to 24 hours in advance without penalty.

CONTACT
For return inquiries, contact support@servicepro.com or call (555) 123-4567.
  `.trim();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MobileHeader title="Return Policy" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14">
        <div className="px-4 py-4">
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Return Policy</h3>
                <p className="text-sm text-muted-foreground">
                  Important information about returns and refunds.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card">
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
              {policyContent}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
