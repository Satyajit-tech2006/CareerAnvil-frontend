import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import PaymentModal from '@/components/payment/PaymentModal';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    features: ['3 Resume Scans/week', '3 JD Extractions/week', 'Community Support'],
    cta: 'Get Started',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹299',
    period: '/month',
    features: ['50 Resume Scans/week', '50 JD Extractions/week', 'Priority Job Access', 'Email Support'],
    cta: 'Upgrade Now',
    popular: true
  },
  {
    id: 'premium_pro',
    name: 'Pro',
    price: '₹499',
    period: '/month',
    features: ['100 Scans/week', '1:1 Mentor Chat', 'Resume Rewrite (AI)', '24/7 Support'],
    cta: 'Go Pro',
    popular: false
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "premium_pro" | null>(null);

  // Check Auth Status
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
        try {
            const res = await apiClient.get(ENDPOINTS.USERS.CURRENT_USER);
            return res.data.data;
        } catch {
            return null; // Not logged in
        }
    },
    retry: false
  });

  const handlePlanClick = (planId: string) => {
    if (planId === 'free') {
        navigate('/dashboard');
        return;
    }
    
    if (!user) {
        // Redirect to login with return path
        navigate(`/login?redirect=/pricing`);
        return;
    }

    // Open Modal
    setSelectedPlan(planId as "premium" | "premium_pro");
  };

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4">
      <div className="text-center mb-12 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-lg">Invest in your career for less than a pizza.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-xl scale-105 z-10' : 'border-border'}`}>
             {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                   <Zap className="w-3 h-3" /> POPULAR
                </div>
             )}
             <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                   <span className="text-4xl font-bold">{plan.price}</span>
                   {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
             </CardHeader>
             <CardContent className="flex-1">
                <ul className="space-y-3">
                   {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                         <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
                      </li>
                   ))}
                </ul>
             </CardContent>
             <CardFooter>
                <Button 
                   className="w-full" 
                   variant={plan.popular ? 'default' : 'outline'}
                   onClick={() => handlePlanClick(plan.id)}
                >
                   {plan.cta}
                </Button>
             </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* CHECKOUT MODAL */}
      <PaymentModal 
         plan={selectedPlan} 
         isOpen={!!selectedPlan} 
         onClose={() => setSelectedPlan(null)} 
      />
    </div>
  );
}