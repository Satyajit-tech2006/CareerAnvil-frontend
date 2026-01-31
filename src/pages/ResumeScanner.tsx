import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle2, XCircle, AlertTriangle, 
  Sparkles, RefreshCw, Briefcase, ChevronRight, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface AtsResponse {
  score: number;
  role: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionsDetected: {
    hasSkills: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasProjects: boolean;
  };
  creditsLeft?: number;
}

const JOB_ROLES = [
  // --- INTERNSHIPS ---
  { value: 'sde_intern', label: 'Software Engineer Intern' },
  { value: 'backend_intern', label: 'Backend Engineering Intern' },
  { value: 'frontend_intern', label: 'Frontend Engineering Intern' },
  { value: 'fullstack_intern', label: 'Full Stack Intern' },

  // --- ENGINEERING (FULL TIME) ---
  { value: 'software_engineer', label: 'Software Engineer (General)' },
  { value: 'backend_dev', label: 'Backend Developer' },
  { value: 'frontend_dev', label: 'Frontend Developer' },
  { value: 'fullstack_dev', label: 'Full Stack Developer' },

  // --- DATA & AI ---
  { value: 'data_analyst', label: 'Data Analyst' },
  { value: 'data_scientist', label: 'Data Scientist' },
  { value: 'ml_engineer', label: 'Machine Learning Engineer' },
  { value: 'ai_engineer', label: 'AI Engineer' },

  // --- INFRASTRUCTURE ---
  { value: 'devops_engineer', label: 'DevOps Engineer' },
  { value: 'cloud_engineer', label: 'Cloud Engineer' },
  { value: 'security_engineer', label: 'Security Engineer' },

  // --- PRODUCT & DESIGN ---
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'ui_ux_designer', label: 'UI/UX Designer' },
  
  // --- BUSINESS ---
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'sales_rep', label: 'Sales Representative (SDR)' },
  { value: 'hr_generalist', label: 'HR Generalist' },
  { value: 'financial_analyst', label: 'Financial Analyst' },
];

// --- SUB-COMPONENT: CIRCULAR PROGRESS ---
function CircularProgress({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500 stroke-green-500';
    if (s >= 50) return 'text-yellow-500 stroke-yellow-500';
    return 'text-red-500 stroke-red-500';
  };

  return (
    <div className="relative w-40 h-40 mx-auto group">
      <svg className="w-full h-full -rotate-90 transform transition-all duration-700" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          className="stroke-muted/20"
          strokeWidth="8"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          className={cn("transition-colors duration-500", getColor(score).split(' ')[1])}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className={cn("text-5xl font-bold tracking-tighter", getColor(score).split(' ')[0])}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Score</span>
      </div>
      
      {/* Glow Effect */}
      <div className={cn("absolute inset-0 rounded-full blur-3xl opacity-10", getColor(score).split(' ')[0].replace('text-', 'bg-'))} />
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ResumeScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<string>('');
  const [result, setResult] = useState<AtsResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Mutation
  const { mutate: analyzeResume, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post(ENDPOINTS.ATS.ANALYZE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Analysis complete!");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Analysis failed";
      toast.error(msg);
    }
  });

  // Handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setResult(null); 
    } else {
      toast.error("Please upload a PDF file");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!file || !role) {
      toast.error("Please select a role and upload a resume");
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role);
    analyzeResume(formData);
  };

  const resetScanner = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl py-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary fill-primary/10" />
            Resume Scanner
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis to beat the Applicant Tracking System (ATS).
          </p>
        </div>
      </div>
      
      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: INPUTS --- */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
                <CardDescription>Tell us what you are applying for.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* 1. Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Target Role</label>
                  <Select value={role} onValueChange={setRole} disabled={isPending}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select job role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* 2. File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Upload Resume</label>
                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="border-2 border-dashed rounded-xl p-8 transition-colors hover:bg-accent/50 cursor-pointer border-muted-foreground/25"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <p className="text-sm font-medium">Click to upload or drag & drop</p>
                          <p className="text-xs text-muted-foreground">PDF only (Max 5MB)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileInput}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="border rounded-xl p-4 bg-primary/5 border-primary/20 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-background rounded-md border shadow-sm">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}>
                          Change
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Action Button */}
                <Button 
                  className="w-full h-11 text-base font-medium shadow-sm" 
                  onClick={handleAnalyze} 
                  disabled={!file || !role || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
                    </>
                  ) : (
                    <>
                      Analyze Resume <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {result?.creditsLeft !== undefined && (
                   <p className="text-center text-xs text-muted-foreground pt-2">
                     {result.creditsLeft} free credits remaining this week.
                   </p>
                )}

              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT COLUMN: RESULTS --- */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              
              {/* STATE 1: IDLE / LOADING */}
              {!result && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground p-8 text-center"
                >
                  {isPending ? (
                    <div className="space-y-4">
                      <div className="relative w-20 h-20 mx-auto">
                        <motion.div 
                          className="absolute inset-0 border-4 border-primary/30 rounded-full" 
                        />
                        <motion.div 
                          className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full" 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-foreground">Analyzing your resume...</h3>
                      <p className="max-w-xs mx-auto text-sm">We are checking keywords, formatting, and section structure against standard ATS rules.</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Briefcase className="w-8 h-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-1">Ready to Scan</h3>
                      <p className="max-w-sm mx-auto text-sm">Select a role and upload your resume on the left to get a detailed ATS compatibility report.</p>
                    </>
                  )}
                </motion.div>
              )}

              {/* STATE 2: RESULTS */}
              {result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  
                  {/* TOP CARD: SCORE */}
                  <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-card to-muted/30">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex-shrink-0">
                          <CircularProgress score={result.score} />
                        </div>
                        <div className="text-center md:text-left space-y-2 flex-1">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border text-sm font-medium shadow-sm mb-2">
                            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                            {result.role}
                          </div>
                          <h2 className="text-2xl font-bold">
                            {result.score >= 80 ? "Excellent Match!" : result.score >= 50 ? "Good Potential" : "Needs Optimization"}
                          </h2>
                          <p className="text-muted-foreground">
                            {result.score >= 80 
                              ? "Your resume is highly optimized for this role. You are ready to apply!" 
                              : result.score >= 50
                              ? "You have the basics down, but missing some key technical skills or sections."
                              : "Your resume might be filtered out by bots. Focus on adding the missing keywords below."
                            }
                          </p>
                        </div>
                        <Button variant="outline" size="icon" onClick={resetScanner} className="hidden md:flex shrink-0 h-10 w-10 rounded-full" title="Scan new">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* STRUCTURE CHECK */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" /> Structure Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        {Object.entries(result.sectionsDetected).map(([key, found]) => (
                          <div key={key} className="flex items-center justify-between p-2.5 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                            <span className="text-sm font-medium capitalize">{key.replace('has', '')} Section</span>
                            {found ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 gap-1 hover:bg-green-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Found
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 gap-1 hover:bg-red-500/20">
                                <AlertTriangle className="w-3 h-3" /> Missing
                              </Badge>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* MISSING KEYWORDS */}
                    <Card className="border-red-200/50 bg-red-50/10 dark:bg-red-900/5">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" /> Missing Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {result.missingKeywords.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.missingKeywords.slice(0, 10).map((keyword) => (
                              <span 
                                key={keyword} 
                                className="px-2.5 py-1 rounded-md bg-background border border-red-200 text-red-600 text-xs font-medium shadow-sm"
                              >
                                {keyword}
                              </span>
                            ))}
                            {result.missingKeywords.length > 10 && (
                              <span className="px-2.5 py-1 text-xs text-muted-foreground">
                                +{result.missingKeywords.length - 10} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-green-600">
                            <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium">Perfect! No keywords missing.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* MATCHED KEYWORDS */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" /> Matched Keywords ({result.matchedKeywords.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.matchedKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {result.matchedKeywords.map((keyword) => (
                            <span 
                              key={keyword} 
                              className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-200 text-xs font-medium dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No specific role keywords found.</p>
                      )}
                    </CardContent>
                  </Card>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}