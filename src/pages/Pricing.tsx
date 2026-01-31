import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from "framer-motion";
import { 
  Check, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import PaymentModal from '@/components/payment/PaymentModal';

export default function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"premium" | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Check Auth Status
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
        try {
            const res = await apiClient.get(ENDPOINTS.USERS.CURRENT_USER);
            return res.data.data;
        } catch { return null; }
    },
    retry: false
  });

  const handlePlanClick = (planId: string) => {
    if (planId === 'free') {
        navigate('/dashboard');
        return;
    }
    if (!user) {
        navigate(`/login?redirect=/pricing`); 
        return;
    }
    setSelectedPlan("premium");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/20">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container px-4 py-20 max-w-6xl mx-auto relative z-10">
        
        {/* --- Header --- */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
          <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/30 bg-primary/5 text-primary">
            <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
            Launch Offer
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-500">Career</span>.
          </h1>
          <p className="text-lg text-muted-foreground md:px-10">
            Get the tools you need to crack high-paying tech roles.
          </p>

          {/* --- Billing Toggle --- */}
          <div className="flex justify-center items-center mt-8">
            <div className="bg-muted p-1 rounded-full flex items-center relative">
               <button 
                 onClick={() => setBillingCycle("monthly")}
                 className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative z-10 ${billingCycle === 'monthly' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 Monthly
               </button>
               <button 
                 onClick={() => setBillingCycle("yearly")}
                 className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative z-10 ${billingCycle === 'yearly' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 Yearly <span className="text-[10px] ml-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">-20%</span>
               </button>
               
               {/* Sliding Pill */}
               <div className={`absolute top-1 bottom-1 w-[50%] bg-primary rounded-full transition-all duration-300 ease-in-out ${billingCycle === 'yearly' ? 'translate-x-[96%]' : 'translate-x-[2%]'}`} />
            </div>
          </div>
        </div>

        {/* --- Plans Grid --- */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
          
          {/* FREE PLAN */}
          <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
            <Card className="h-full border-border bg-card/50 backdrop-blur-sm p-2">
               <div className="p-6 h-full flex flex-col">
                  <CardHeader className="p-0 mb-6">
                      <div className="flex justify-between items-start mb-2">
                         <CardTitle className="text-2xl font-bold">Free</CardTitle>
                         <div className="p-2 bg-muted rounded-full"><CheckCircle2 className="w-5 h-5 text-muted-foreground" /></div>
                      </div>
                      <p className="text-sm text-muted-foreground h-10">Perfect for beginners just getting started.</p>
                  </CardHeader>
                  <div className="mb-8">
                     <span className="text-5xl font-extrabold tracking-tight">₹0</span>
                  </div>
                  <CardContent className="p-0 flex-1 space-y-4">
                      {['3 Resume Scans / week', '3 JD Extractions / week', 'Free DSA Sheets', 'Community Support'].map((f, i) => (
                         <div key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 w-[18px] h-[18px] rounded-full bg-muted-foreground/20 text-muted-foreground flex items-center justify-center">
                               <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-foreground/80">{f}</span>
                         </div>
                      ))}
                  </CardContent>
                  <CardFooter className="p-0 mt-8">
                     <Button className="w-full h-12 text-base" variant="outline" onClick={() => handlePlanClick('free')}>
                        Get Started
                     </Button>
                  </CardFooter>
               </div>
            </Card>
          </motion.div>

          {/* PREMIUM PLAN */}
          <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
            <Card className="h-full border-primary shadow-2xl shadow-primary/10 bg-card/80 backdrop-blur-sm p-2 relative overflow-visible">
               <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Recommended
                  </div>
               </div>
               
               <div className="p-6 h-full flex flex-col">
                  <CardHeader className="p-0 mb-6">
                      <div className="flex justify-between items-start mb-2">
                         <CardTitle className="text-2xl font-bold">Premium</CardTitle>
                         <div className="p-2 bg-primary/10 rounded-full"><Zap className="w-5 h-5 text-primary" /></div>
                      </div>
                      <p className="text-sm text-muted-foreground h-10">Everything you need to get hired faster.</p>
                  </CardHeader>
                  
                  <div className="mb-8">
                     <div className="flex items-baseline gap-1">
                        <motion.span 
                          key={billingCycle} 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="text-5xl font-extrabold tracking-tight"
                        >
                           {billingCycle === 'monthly' ? '₹79' : '₹749'}
                        </motion.span>
                        <span className="text-muted-foreground font-medium text-lg">
                           / {billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                     </div>
                  </div>

                  <CardContent className="p-0 flex-1 space-y-4">
                      {[
                        '30 ATS Resume Scans / week', 
                        '30 JD Keyword Extractions / week', 
                        'Company-wise ATS Scores', 
                        'Custom Keyword Analysis', 
                        'Priority Email Support'
                      ].map((f, i) => (
                         <div key={i} className="flex items-start gap-3">
                            <div className="mt-0.5 w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                               <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-foreground/80">{f}</span>
                         </div>
                      ))}
                  </CardContent>

                  <CardFooter className="p-0 mt-8">
                     <Button className="w-full h-12 text-base font-semibold shadow-primary/25 bg-primary hover:bg-primary/90" onClick={() => handlePlanClick('premium')}>
                        Upgrade Now <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                  </CardFooter>
               </div>
            </Card>
          </motion.div>

        </div>

        {/* --- Trust Footer --- */}
        <div className="mt-20 border-t border-border/40 pt-10 text-center max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-muted-foreground">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-green-600" />
               <span className="text-sm font-medium">Safe UPI Payment</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 rounded-full border-2 border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary">24</div>
               <span className="text-sm font-medium">Max 24hr Verification</span>
            </div>
          </div>
        </div>

      </div>

      {/* --- Modals --- */}
      <PaymentModal 
         plan={selectedPlan} 
         billingCycle={billingCycle} // Pass the cycle here
         isOpen={!!selectedPlan} 
         onClose={() => setSelectedPlan(null)} 
      />
    </div>
  );
}