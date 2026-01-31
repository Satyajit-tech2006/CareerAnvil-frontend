import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Loader2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

export default function PaymentManager() {
  const [filter, setFilter] = useState("pending_verification");
  const queryClient = useQueryClient();

  // 1. Fetch Payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ["adminPayments", filter],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PAYMENTS.ADMIN_GET_ALL(filter));
      return res.data.data;
    }
  });

  // 2. Approve/Reject Mutation
  const { mutate: verifyPayment, isPending: isVerifying } = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'approve' | 'reject' }) => {
      await apiClient.post(ENDPOINTS.PAYMENTS.ADMIN_VERIFY, { paymentId: id, action });
    },
    onSuccess: () => {
      toast.success("Payment processed successfully");
      queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message)
  });

  // 3. Cleanup Mutation (NEW)
  const { mutate: cleanup, isPending: isCleaning } = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(ENDPOINTS.PAYMENTS.ADMIN_CLEANUP);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || `Cleaned up ${data.deletedCount} stale requests`);
      queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Cleanup failed")
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold">Payment Approvals</h1>
           <p className="text-muted-foreground text-sm">Manage user subscriptions and verify UTRs.</p>
        </div>
        
        {/* CLEANUP BUTTON: Only visible in Pending UTR tab */}
        {filter === 'pending_utr' && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => cleanup()} 
            disabled={isCleaning || !payments?.length}
          >
            {isCleaning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Cleanup Stale Requests
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending_verification" className="relative">
             Needs Approval
             {/* Optional: Add badge count logic if you fetch counts separately */}
          </TabsTrigger>
          <TabsTrigger value="pending_utr">Pending UTR</TabsTrigger>
          <TabsTrigger value="approved">History</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>UTR / Ref</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                 </TableCell>
               </TableRow>
            ) : payments?.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No payments found in this category.
                 </TableCell>
               </TableRow>
            ) : (
              payments?.map((pay: any) => (
                <TableRow key={pay._id}>
                  <TableCell>
                    <div className="font-medium">{pay.userId?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{pay.userId?.email}</div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="capitalize">
                        {pay.plan.replace('_', ' ')}
                     </Badge>
                     {pay.note === 'yearly' && <Badge className="ml-2 bg-indigo-100 text-indigo-700 text-[10px] hover:bg-indigo-100">Yearly</Badge>}
                  </TableCell>
                  <TableCell>₹{pay.amount}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {pay.utr ? (
                        <span className="bg-muted px-2 py-1 rounded select-all">{pay.utr}</span>
                    ) : (
                        <span className="text-muted-foreground italic text-xs flex items-center gap-1">
                           <Loader2 className="w-3 h-3 animate-spin" /> Waiting for user...
                        </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(pay.createdAt).toLocaleDateString()} <br/>
                    {new Date(pay.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </TableCell>
                  <TableCell className="text-right">
                    {pay.status === 'pending_verification' && (
                        <div className="flex justify-end gap-2">
                           <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" 
                             onClick={() => verifyPayment({ id: pay._id, action: 'approve' })} disabled={isVerifying}>
                             <Check className="w-4 h-4" />
                           </Button>
                           <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                             onClick={() => verifyPayment({ id: pay._id, action: 'reject' })} disabled={isVerifying}>
                             <X className="w-4 h-4" />
                           </Button>
                        </div>
                    )}
                    {pay.status === 'pending_utr' && (
                        <span className="text-xs text-muted-foreground italic pr-2">User hasn't paid yet</span>
                    )}
                    {pay.status === 'approved' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Approved</Badge>}
                    {pay.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}