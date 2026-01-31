import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

export default function PaymentManager() {
  const [filter, setFilter] = useState("pending_verification");
  const queryClient = useQueryClient();

  // 1. Fetch Payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ["adminPayments", filter],
    queryFn: async () => {
      // Need to add this route to backend: router.get('/admin/all', getAllPayments)
      const res = await apiClient.get(`/payments/admin/all?status=${filter}`);
      return res.data.data;
    }
  });

  // 2. Approve/Reject Mutation
  const { mutate: verifyPayment, isPending } = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'approve' | 'reject' }) => {
      await apiClient.post("/payments/admin/verify", { paymentId: id, action });
    },
    onSuccess: () => {
      toast.success("Payment processed successfully");
      queryClient.invalidateQueries({ queryKey: ["adminPayments"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message)
  });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Approvals</h1>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending_verification">Needs Approval</TabsTrigger>
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
                 <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
               </TableRow>
            ) : payments?.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No payments found.</TableCell>
               </TableRow>
            ) : (
              payments?.map((pay: any) => (
                <TableRow key={pay._id}>
                  <TableCell>
                    <div className="font-medium">{pay.userId?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{pay.userId?.email}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{pay.plan}</Badge></TableCell>
                  <TableCell>₹{pay.amount}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {pay.utr || <span className="text-muted-foreground italic">Pending</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(pay.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {pay.status === 'pending_verification' && (
                       <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                            onClick={() => verifyPayment({ id: pay._id, action: 'approve' })} disabled={isPending}>
                             <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => verifyPayment({ id: pay._id, action: 'reject' })} disabled={isPending}>
                             <X className="w-4 h-4" />
                          </Button>
                       </div>
                    )}
                    {pay.status === 'approved' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>}
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