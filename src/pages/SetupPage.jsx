// File: ogs-client/depot/src/pages/SetupPage.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Cloud, Loader2, Rocket, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SetupPage = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    shopName: "Orion Orbit",
    shopAddress: "",
    shopPhone: "",
    shopEmail: "",
    SUPABASE_URL: "",
    SUPABASE_KEY: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!config.shopName) {
        toast.error("Shop name is required");
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!config.SUPABASE_URL || !config.SUPABASE_KEY) {
      toast.error("Cloud credentials are required for sync");
      return;
    }

    setLoading(true);
    try {
      const success = await window.electron.saveConfig(config);
      if (success) {
        toast.success("Setup completed successfully!");
        onComplete();
      } else {
        toast.error("Failed to save configuration");
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast.error("An error occurred during setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">System Setup</h1>
          <p className="text-muted-foreground mt-2">Configure Orion Orbit for first use</p>
        </div>

        <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="h-1 bg-slate-100 dark:bg-zinc-800">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out" 
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
          
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              {step === 1 ? <Store className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
              <span className="text-xs font-bold uppercase tracking-wider">
                Step {step} of 2: {step === 1 ? "Shop Details" : "Cloud Sync"}
              </span>
            </div>
            <CardTitle className="text-xl">
              {step === 1 ? "Tell us about your shop" : "Connect to the Cloud"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "This information will appear on your receipts." 
                : "Enter your Supabase credentials to enable cloud backup."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {step === 1 ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input 
                    id="shopName" 
                    name="shopName"
                    placeholder="e.g. Orion Orbit" 
                    value={config.shopName}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Address</Label>
                  <Input 
                    id="shopAddress" 
                    name="shopAddress"
                    placeholder="Shop #, Market Area..." 
                    value={config.shopAddress}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">Phone</Label>
                    <Input 
                      id="shopPhone" 
                      name="shopPhone"
                      placeholder="+92..." 
                      value={config.shopPhone}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopEmail">Email</Label>
                    <Input 
                      id="shopEmail" 
                      name="shopEmail"
                      placeholder="info@..." 
                      type="email"
                      value={config.shopEmail}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="SUPABASE_URL">Supabase URL</Label>
                  <Input 
                    id="SUPABASE_URL" 
                    name="SUPABASE_URL"
                    placeholder="https://xyz.supabase.co" 
                    value={config.SUPABASE_URL}
                    onChange={handleChange}
                    className="h-11 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="SUPABASE_KEY">Supabase Anon Key</Label>
                  <Input 
                    id="SUPABASE_KEY" 
                    name="SUPABASE_KEY"
                    placeholder="eyJh..." 
                    type="password"
                    value={config.SUPABASE_KEY}
                    onChange={handleChange}
                    className="h-11 font-mono text-sm"
                  />
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    Cloud sync ensures your sales data is backed up and accessible from multiple devices.
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-6 border-t dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
            {step === 2 ? (
              <Button variant="ghost" onClick={handleBack} disabled={loading}>
                Back
              </Button>
            ) : (
              <div />
            )}
            
            {step === 1 ? (
              <Button onClick={handleNext} className="min-w-32 h-11 bg-blue-600 hover:bg-blue-700">
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="min-w-32 h-11 bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Orion Orbit. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SetupPage;
