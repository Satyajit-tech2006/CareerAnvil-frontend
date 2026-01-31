import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface PaymentModalProps {
  plan: "premium" | null;
  billingCycle: "monthly" | "yearly"; // <--- NEW PROP
  isOpen: boolean;
  onClose: () => void;
}

// --- CONFIGURATION ---
const UPI_ID = "7656999488@ybl";
const QR_IMAGE_PATH = "/UPI_QR.jpeg"; 

export default function PaymentModal({ plan, billingCycle, isOpen, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<"loading" | "scan" | "utr" | "success">("loading");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  
  const queryClient = useQueryClient();

  // --- DYNAMIC AMOUNT CALCULATION ---
  const amount = billingCycle === "yearly" ? 999 : 99;

  // 1. Initiate Payment on Open
  const { mutate: initiate } = useMutation({
    mutationFn: async () => {
      // Send billingCycle to backend so it sets correct amount (99 or 999)
      const res = await apiClient.post("/payments/initiate", { plan, billingCycle });
      return res.data.data;
    },
    onSuccess: (data) => {
      setPaymentId(data._id);
      if (data.status === "pending_verification") {
        setStep("success");
      } else {
        setStep("scan");
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to initiate";
      if(err.response?.status === 409) {
          toast.error(msg);
          onClose();
      } else {
          toast.error(msg);
      }
    }
  });

  useEffect(() => {
    if (isOpen && plan) {
      setStep("loading");
      initiate();
    }
  }, [isOpen, plan, billingCycle]);

  // 2. Submit UTR
  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      await apiClient.post("/payments/submit-utr", { utr, paymentId });
    },
    onSuccess: () => {
      setStep("success");
      toast.success("UTR Submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ['activePayment'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to submit UTR")
  });

  // Deep link for mobile UPI apps
  const mobileDeepLink = `upi://pay?pa=${UPI_ID}&pn=CareerAnvil&am=${amount}&tn=${plan} ${billingCycle}&cu=INR`;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
             Upgrade to Premium ({billingCycle === 'yearly' ? 'Yearly' : 'Monthly'})
          </DialogDescription>
        </DialogHeader>

        {step === "loading" && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {step === "scan" && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border flex flex-col items-center justify-center shadow-sm">
              {/* LOCAL QR IMAGE */}
              <img 
                src={QR_IMAGE_PATH} 
                alt="Scan UPI QR" 
                className="w-56 h-auto object-contain"
                onError={(e) => {
                    // Fallback generator
                    (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mobileDeepLink)}`;
                }}
              />
              <p className="mt-2 text-xs text-muted-foreground">Scan with any UPI App</p>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold">₹{amount}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded select-all">
                    {UPI_ID}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" onClick={() => window.location.href = mobileDeepLink} className="w-full">
                 Open App
               </Button>
               <Button onClick={() => setStep("utr")} className="w-full">
                 Enter UTR <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
          </div>
        )}

        {step === "utr" && (
          <div className="space-y-5">
             <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-md flex gap-2 border border-amber-100">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                    <strong>Important:</strong> Check your banking app for the <strong>12-digit UTR</strong>.
                </p>
             </div>
             
             <div className="space-y-3">
                <label className="text-sm font-medium">Enter Transaction ID / UTR</label>
                <Input 
                   placeholder="e.g. 302848192039" 
                   value={utr} 
                   onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                   maxLength={22}
                   className="font-mono tracking-wide"
                />
                <p className="text-xs text-muted-foreground text-right">{utr.length}/12 characters</p>
             </div>

             <div className="flex flex-col gap-3 pt-2">
                <Button className="w-full" onClick={() => submit()} disabled={isSubmitting || utr.length < 12}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Payment"}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={() => setStep("scan")}>Back to QR Code</Button>
             </div>
          </div>
        )}

        {step === "success" && (
           <div className="text-center py-8 space-y-5">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                 <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-bold">Payment Submitted!</h3>
                 <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
                    We have received your UTR. Account activation typically takes 1-2 hours.
                 </p>
              </div>
              <Button onClick={onClose} className="w-full max-w-[200px]">Close</Button>
           </div>
        )}

      </DialogContent>
    </Dialog>
  );
}