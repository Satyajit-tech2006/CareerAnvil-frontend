import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { atsResult } from '@/data/mockData';
import { cn } from '@/lib/utils';

type ScanState = 'idle' | 'uploading' | 'scanning' | 'complete';

function CircularProgress({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = () => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getStrokeColor = () => {
    if (score >= 75) return 'hsl(var(--success))';
    if (score >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className={cn("text-4xl font-bold", getScoreColor())}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

export default function ResumeScanner() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      simulateUpload(file.name);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file.name);
    }
  };

  const simulateUpload = (name: string) => {
    setFileName(name);
    setScanState('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanState('scanning');
          setTimeout(() => setScanState('complete'), 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const resetScanner = () => {
    setScanState('idle');
    setUploadProgress(0);
    setFileName('');
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Resume Scanner" 
        subtitle="Get ATS-optimized feedback on your resume"
      />
      
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Upload Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {scanState === 'idle' && (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="dropzone"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Drag & drop your Resume PDF here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click the button below to browse
                    </p>
                    <label>
                      <Button variant="outline" className="cursor-pointer">
                        Upload Resume
                      </Button>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </label>
                  </motion.div>
                )}

                {scanState === 'uploading' && (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
                    <p className="font-medium mb-2">{fileName}</p>
                    <Progress value={uploadProgress} className="w-48 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </motion.div>
                )}

                {scanState === 'scanning' && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      className="w-16 h-16 mx-auto mb-4"
                    >
                      <Sparkles className="w-full h-full text-primary" />
                    </motion.div>
                    <p className="font-medium mb-2">Analyzing your resume...</p>
                    <div className="space-y-2 max-w-xs mx-auto">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </motion.div>
                )}

                {scanState === 'complete' && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-3" />
                    <p className="font-medium text-lg mb-1">Scan Complete!</p>
                    <p className="text-sm text-muted-foreground mb-4">{fileName}</p>
                    <Button variant="outline" size="sm" onClick={resetScanner}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Scan Another
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <AnimatePresence>
              {scanState === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Score Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>ATS Compatibility Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CircularProgress score={atsResult.score} />
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        {atsResult.score >= 75 
                          ? "Great job! Your resume is well-optimized."
                          : atsResult.score >= 50
                          ? "Good start, but there's room for improvement."
                          : "Your resume needs significant improvements."
                        }
                      </p>
                    </CardContent>
                  </Card>

                  {/* Missing Keywords */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Missing Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {atsResult.missingKeywords.map((keyword) => (
                          <span 
                            key={keyword}
                            className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Formatting Check */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Formatting Check</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {atsResult.formattingChecks.map((check, i) => (
                          <li key={i} className="flex items-center gap-3">
                            {check.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                            )}
                            <span className={cn(
                              "text-sm",
                              check.passed ? "text-foreground" : "text-destructive"
                            )}>
                              {check.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {atsResult.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
                              {i + 1}
                            </span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {scanState !== 'complete' && (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Upload your resume to see the analysis results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
