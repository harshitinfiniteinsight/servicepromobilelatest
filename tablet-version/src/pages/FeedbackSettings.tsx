import { useState, useEffect } from "react";
import TabletHeader from "@/components/layout/TabletHeader";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { showSuccessToast } from "@/utils/toast";

const FeedbackSettings = () => {
  const [autoSendFeedback, setAutoSendFeedback] = useState(false);

  // Load saved feedback setting from localStorage
  useEffect(() => {
    const savedSetting = localStorage.getItem("autoSendFeedback");
    if (savedSetting !== null) {
      setAutoSendFeedback(savedSetting === "true");
    }
  }, []);

  const handleSave = () => {
    // Save setting (in real app, this would be an API call)
    // Store in localStorage for persistence
    localStorage.setItem("autoSendFeedback", String(autoSendFeedback));
    showSuccessToast("Feedback settings saved successfully");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      <TabletHeader 
        title="Feedback Settings"
        breadcrumbs={[
          { label: "Settings", path: "/settings" },
          { label: "Feedback Settings" }
        ]}
      />
      
      <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Settings Card */}
          <Card className="border-2 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Automatic Feedback Collection</h2>
                  <p className="text-muted-foreground">
                    Configure how feedback forms are sent to customers
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Toggle Setting */}
                <div className="flex items-center justify-between p-6 rounded-xl border-2 bg-card hover:bg-accent/5 transition-colors">
                  <div className="flex-1 pr-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Send Feedback Form Automatically
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically email a feedback form to customers when their job status 
                      changes to Completed. Customers will receive a link to provide ratings 
                      and comments about their service experience.
                    </p>
                  </div>
                  <Switch
                    checked={autoSendFeedback}
                    onCheckedChange={setAutoSendFeedback}
                    className="scale-125"
                  />
                </div>

                {/* Current Status */}
                <div className={`p-4 rounded-lg border-2 ${
                  autoSendFeedback 
                    ? 'bg-success/5 border-success/30' 
                    : 'bg-muted border-border'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      autoSendFeedback ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                    }`} />
                    <p className="font-medium">
                      Status: {autoSendFeedback ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-6">
                    {autoSendFeedback 
                      ? 'Feedback forms will be sent automatically when jobs are completed.'
                      : 'Feedback forms will not be sent automatically. You can still send them manually.'}
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    size="lg"
                    className="min-w-[200px] shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="border bg-card/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">How It Works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">1.</span>
                  <span>Job status is changed to "Completed" by employee or admin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">2.</span>
                  <span>System automatically generates a unique feedback form link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">3.</span>
                  <span>Email with feedback form link is sent to customer's registered email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">4.</span>
                  <span>Customer submits feedback, which is stored in the system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">5.</span>
                  <span>You can view all feedback in the job details or customer profile</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FeedbackSettings;
