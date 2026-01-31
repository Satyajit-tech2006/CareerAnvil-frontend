import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Sparkles, Copy, Check, Loader2, ArrowRight, 
  Quote, AlertCircle, History 
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function JobDescriptionScanner() {
  const [jdText, setJdText] = useState('');
  const [resultCsv, setResultCsv] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // 1. Fetch Credits (Fixed: Now calls the dedicated credits endpoint)
  const { data: creditsData, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['atsCredits'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.ATS.GET_CREDITS);
      return res.data.data;
    },
    retry: false,
    refetchOnWindowFocus: true
  });

  // 2. Extraction Mutation
  const { mutate: extractKeywords, isPending } = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiClient.post(ENDPOINTS.ATS.EXTRACT_KEYWORDS, { description: text });
      return res.data.data;
    },
    onSuccess: (data) => {
      setResultCsv(data.csv);
      toast.success("Keywords extracted!");
      // Refresh credits immediately after use
      queryClient.invalidateQueries({ queryKey: ['atsCredits'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Extraction failed");
    }
  });

  // Handlers
  const handleExtract = () => {
    if (!jdText || jdText.length < 50) {
      toast.error("Please paste a longer job description (min 50 chars).");
      return;
    }
    extractKeywords(jdText);
  };

  const handleCopy = () => {
    if (!resultCsv) return;
    navigator.clipboard.writeText(resultCsv);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* HEADER */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl py-6">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary fill-primary/10" />
                  JD Keyword Extractor
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Turn any Job Description into a list of high-value keywords.
                </p>
             </div>
             {/* Credit Counter */}
             <div className="hidden md:block text-right">
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                   {isLoadingCredits ? "..." : (creditsData?.jdCredits ?? 0) } Credits Left
                </Badge>
             </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: INPUT */}
          <div className="space-y-4">
             <Card className="h-full border-muted-foreground/20 shadow-sm flex flex-col">
                <CardHeader>
                   <CardTitle className="text-base">Paste Job Description</CardTitle>
                   <CardDescription>Copy the full "Responsibilities" & "Requirements" section.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                   <Textarea 
                      placeholder="e.g. 'We are looking for a Senior React Developer with experience in AWS, Node.js...'"
                      className="flex-1 min-h-[300px] resize-none font-mono text-sm leading-relaxed bg-muted/20 focus:bg-background transition-colors p-4"
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                   />
                   
                   <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                         Supports raw text from LinkedIn, Indeed, etc.
                      </p>
                      <Button onClick={handleExtract} disabled={isPending || !jdText.trim()}>
                         {isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting...</>
                         ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> Extract Keywords</>
                         )}
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* RIGHT: OUTPUT */}
          <div className="space-y-4">
             <AnimatePresence mode="wait">
                {!resultCsv ? (
                   <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/5 text-muted-foreground p-8 text-center"
                   >
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                         <Quote className="w-8 h-8 opacity-40" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-1">Waiting for content</h3>
                      <p className="max-w-xs mx-auto text-sm text-muted-foreground">
                         Paste a JD on the left and hit extract to see the magic.
                      </p>
                   </motion.div>
                ) : (
                   <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                   >
                      <Card className="bg-primary/5 border-primary/20 shadow-md">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                               <span>Extracted Keywords</span>
                               <Button size="sm" variant={copied ? "default" : "outline"} onClick={handleCopy} className="h-8 gap-2">
                                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copied ? "Copied" : "Copy CSV"}
                               </Button>
                            </CardTitle>
                            <CardDescription>
                               Most frequent technical terms found in the text.
                            </CardDescription>
                         </CardHeader>
                         <CardContent>
                            <div className="bg-background rounded-md border p-4 font-mono text-sm text-muted-foreground break-words leading-relaxed">
                               {resultCsv}
                            </div>
                         </CardContent>
                      </Card>

                      <Alert className="bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-800">
                         <AlertCircle className="h-4 w-4" />
                         <AlertTitle>Pro Tip</AlertTitle>
                         <AlertDescription className="text-xs mt-1 opacity-90">
                            Copy these keywords and paste them into the <strong>Resume Scanner's</strong> "Custom Keywords" box to check if your resume matches this specific job!
                         </AlertDescription>
                      </Alert>

                      <div className="flex justify-end">
                         <Button variant="ghost" size="sm" onClick={() => { setResultCsv(null); setJdText(''); }} className="text-muted-foreground">
                            <History className="w-4 h-4 mr-2" /> Reset
                         </Button>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}