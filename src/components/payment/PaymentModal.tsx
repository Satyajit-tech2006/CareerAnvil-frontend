import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight, Download, ScanLine } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface PaymentModalProps {
  plan: "premium" | null;
  billingCycle: "monthly" | "yearly"; 
  isOpen: boolean;
  onClose: () => void;
}

// --- CONFIGURATION ---
const UPI_ID = "7656999488@ybl";
const QR_IMAGE_PATH = "/UPI_QR.jpeg"; 
const EXAMPLE_IMAGE_PATH = "/Example.jpeg"; // Shows where to find UTR

export default function PaymentModal({ plan, billingCycle, isOpen, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<"loading" | "scan" | "utr" | "success">("loading");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  
  const queryClient = useQueryClient();

  // --- AMOUNT (Testing: 1.00 / 999.00) ---
  const rawAmount = billingCycle === "yearly" ? 749 : 79;
  const amountString = rawAmount.toFixed(2);

  // 1. Initiate Payment on Open
  const { mutate: initiate } = useMutation({
    mutationFn: async () => {
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

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = QR_IMAGE_PATH;
    link.download = 'CareerAnvil_Payment_QR.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
            
            {/* INSTRUCTIONS */}
            <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2 border">
               <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Scan QR with any UPI App</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Pay <span className="font-bold">₹{amountString}</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Enter Transaction ID / UTR below</span>
               </div>
            </div>

            <div className="bg-white p-4 rounded-xl border flex flex-col items-center justify-center shadow-sm">
              <img 
                src={QR_IMAGE_PATH} 
                alt="Scan UPI QR" 
                className="w-48 h-auto object-contain mix-blend-multiply"
              />
              <div className="mt-3 flex items-center gap-2">
                 <p className="text-xs font-mono bg-muted px-2 py-1 rounded select-all text-muted-foreground border">
                    {UPI_ID}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" onClick={handleDownloadQR} className="w-full">
                 <Download className="w-4 h-4 mr-2" /> Save QR
               </Button>
               <Button onClick={() => setStep("utr")} className="w-full">
                 Enter UTR <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
          </div>
        )}

        {step === "utr" && (
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Transaction ID / UTR</label>
                <Input 
                   placeholder="e.g. 302848192039" 
                   value={utr} 
                   onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                   maxLength={22}
                   className="font-mono tracking-wide h-11"
                />
             </div>

             {/* EXAMPLE IMAGE */}
             <div className="rounded-lg border bg-muted/30 p-2">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                   <ScanLine className="w-3 h-3" /> Where to find UTR?
                </p>
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md bg-white">
                   <img 
                      src={EXAMPLE_IMAGE_PATH} 
                      alt="UTR Example" 
                      className="object-contain w-full h-full" 
                   />
                </div>
             </div>

             <div className="flex flex-col gap-2 pt-2">
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
                    We have received your UTR. Your account will be upgraded shortly after admin verification.
                 </p>
              </div>
              <Button onClick={onClose} className="w-full max-w-[200px]">Close</Button>
           </div>
        )}

      </DialogContent>
    </Dialog>
  );
}