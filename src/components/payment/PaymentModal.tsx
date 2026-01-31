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
  billingCycle: "monthly" | "yearly"; 
  isOpen: boolean;
  onClose: () => void;
}

// --- CONFIGURATION ---
const UPI_ID = "7656999488@ybl";
const PAYEE_NAME = "CareerAnvil"; 
const QR_IMAGE_PATH = "/UPI_QR.jpeg"; // STATIC, BANK-GENERATED QR

export default function PaymentModal({ plan, billingCycle, isOpen, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<"loading" | "scan" | "utr" | "success">("loading");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [utr, setUtr] = useState("");
  
  const queryClient = useQueryClient();

  // --- AMOUNT ---
  const rawAmount = billingCycle === "yearly" ? 999 : 10;
  const amountString = rawAmount.toFixed(2);

  // --- UPI INTENT (FOR MOBILE BUTTON ONLY) ---
  const note = `CareerAnvil Premium ${billingCycle}`;
  const mobileDeepLink =
    `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amountString}&cu=INR&tn=${encodeURIComponent(note)}`;

  // 1. Initiate Payment on Open
  const { mutate: initiate } = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/payments/initiate", { plan, billingCycle });
      return res.data.data;
    },
    onSuccess: (data) => {
      setPaymentId(data._id);
      setStep("scan");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to initiate payment";
      if (err.response?.status === 409) {
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
      toast.success("UTR submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["activePayment"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to submit UTR"),
  });

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Upgrade to Premium ({billingCycle === "yearly" ? "Yearly" : "Monthly"})
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
              {/* STATIC QR ONLY */}
              <img
                src={QR_IMAGE_PATH}
                alt="Scan UPI QR"
                className="w-56 h-auto object-contain mix-blend-multiply"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Scan with PhonePe, GPay, Paytm, or BHIM
              </p>
            </div>

            <div className="text-center space-y-1">
              <p className="text-3xl font-bold">₹{amountString}</p>
              <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded select-all">
                {UPI_ID}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = mobileDeepLink)}
                className="w-full"
              >
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
                <strong>Important:</strong> After payment, paste the{" "}
                <strong>UTR / Transaction ID</strong> from your UPI app.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Enter UTR</label>
              <Input
                placeholder="e.g. 302848192039"
                value={utr}
                onChange={(e) =>
                  setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
                }
                maxLength={22}
                className="font-mono tracking-wide"
              />
              <p className="text-xs text-muted-foreground text-right">
                {utr.length}/12+
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full"
                onClick={() => submit()}
                disabled={isSubmitting || utr.length < 12}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify Payment"
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("scan")}
              >
                Back to QR Code
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-8 space-y-5">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Payment Submitted!</h3>
              <p className="text-sm text-muted-foreground max-w-[260px] mx-auto">
                We received your UTR. Your account will be activated shortly.
              </p>
            </div>
            <Button onClick={onClose} className="w-full max-w-[200px]">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
