import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, QrCode, CheckCircle2, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

interface PaymentModalProps {
  plan: "premium" | "premium_pro" | null;
  isOpen: boolean;
  onClose: () => void;
}

const UPI_ID = "yourname@okaxis"; // CHANGE THIS

export default function PaymentModal({ plan, isOpen, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<"loading" | "scan" | "utr" | "success">("loading");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  
  const queryClient = useQueryClient();
  const amount = plan === "premium_pro" ? 499 : 299;

  // 1. Initiate Payment on Open
  const { mutate: initiate } = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/payments/initiate", { plan });
      return res.data.data;
    },
    onSuccess: (data) => {
      setPaymentId(data._id);
      // If user already submitted UTR, go to success/waiting
      if (data.status === "pending_verification") {
        setStep("success");
      } else {
        setStep("scan");
      }
    },
    onError: (err: any) => {
      // If user has active payment, backend returns it (200 OK) usually, 
      // but if error 409, we handle it.
      toast.error(err.response?.data?.message || "Failed to initiate");
      onClose();
    }
  });

  useEffect(() => {
    if (isOpen && plan) {
      setStep("loading");
      initiate();
    }
  }, [isOpen, plan]);

  // 2. Submit UTR
  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      await apiClient.post("/payments/submit-utr", { utr, paymentId });
    },
    onSuccess: () => {
      setStep("success");
      toast.success("UTR Submitted!");
      queryClient.invalidateQueries({ queryKey: ['activePayment'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message)
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${UPI_ID}&pn=CareerAnvil&am=${amount}&tn=${plan}`;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>Upgrade to {plan === 'premium' ? 'Premium' : 'Pro'}</DialogDescription>
        </DialogHeader>

        {step === "loading" && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {step === "scan" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border flex justify-center">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
            </div>
            
            <div className="text-center space-y-1">
              <p className="font-bold text-lg">₹{amount}</p>
              <p className="text-xs text-muted-foreground font-mono bg-muted inline-block px-2 py-1 rounded">
                {UPI_ID}
              </p>
            </div>

            <div className="flex gap-2">
               <Button className="w-full" variant="outline" onClick={() => window.location.href = `upi://pay?pa=${UPI_ID}&pn=CareerAnvil&am=${amount}&tn=${plan}`}>
                 Open UPI App
               </Button>
               <Button className="w-full" onClick={() => setStep("utr")}>
                 Enter UTR
               </Button>
            </div>
          </div>
        )}

        {step === "utr" && (
          <div className="space-y-4">
             <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>Please check your banking app for the 12-digit UTR or Reference Number after payment.</p>
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium">Transaction ID / UTR</label>
                <Input 
                   placeholder="e.g. 302848192039" 
                   value={utr} 
                   onChange={(e) => setUtr(e.target.value)}
                   maxLength={22}
                />
             </div>

             <Button className="w-full" onClick={() => submit()} disabled={isSubmitting || utr.length < 12}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Payment"}
             </Button>
             
             <Button variant="ghost" className="w-full" onClick={() => setStep("scan")}>Back to QR</Button>
          </div>
        )}

        {step === "success" && (
           <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-lg font-bold">Verification Pending</h3>
                 <p className="text-sm text-muted-foreground mt-1">
                    We have received your UTR. Your account will be upgraded within 1-2 hours after manual verification.
                 </p>
              </div>
              <Button onClick={onClose} className="w-full">Close</Button>
           </div>
        )}

      </DialogContent>
    </Dialog>
  );
}