import MobileHeader from "@/components/layout/MobileHeader";
import { Check } from "lucide-react";

const Help = () => {
  const benefits = [
    "Works seamlessly.",
    "Assign customer appointments and dispatch employees, track employee progress.",
    "Send estimates and agreements via SMS/Email to your customer, receive payment via remotely.",
    "Create and manage your service agreements, invoices and estimates.",
    "Manage employee's work flow.",
    "Track employee.",
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <MobileHeader title="Help" showBack={true} />
      
      <div className="flex-1 overflow-y-auto scrollable pt-14 pb-6 px-4">
        <div className="max-w-md mx-auto h-full flex flex-col">
          {/* Heading - Centered at top */}
          <h1 className="text-lg font-bold uppercase text-center text-gray-900 mb-8 mt-4 tracking-tight">
            APP BENEFITS
          </h1>

          {/* Benefits List */}
          <div className="flex-1 space-y-4 px-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                {/* Orange Checkmark Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="h-5 w-5 text-[#FF8A3C]" strokeWidth={2.5} />
                </div>
                {/* Benefit Text */}
                <p className="text-sm text-gray-900 leading-relaxed flex-1 text-left">
                  {benefit}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-2.5 mt-auto mb-8 pt-8">
            {/* First dot - filled in primary accent color */}
            <div className="h-2.5 w-2.5 rounded-full bg-[#FF8A3C]" />
            {/* Remaining dots - light neutral gray */}
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="h-2.5 w-2.5 rounded-full bg-gray-300"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
