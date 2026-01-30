import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Trophy,
  Share2,
  AlertCircle,
  Youtube, 
  FileText,
  ArrowLeft,
  PlayCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

// --- SUB-COMPONENTS ---

const DifficultyBadge = ({ level }) => {
  const colors = {
    easy: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/20",
    hard: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-500/20",
  };
  const key = level?.toLowerCase() || 'medium';
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide ${colors[key]}`}>
      {level}
    </span>
  );
};

export default function SheetView() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [sheet, setSheet] = useState(null);
  const [sections, setSections] = useState([]);
  const [itemsMap, setItemsMap] = useState({});
  const [progressMap, setProgressMap] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadSheetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Sheet Metadata
        const sheetRes = await apiClient.get(ENDPOINTS.SHEETS.GET_BY_SLUG(slug));
        const sheetData = sheetRes.data.data;
        setSheet(sheetData);

        if (!sheetData) throw new Error("Sheet not found");

        // 2. Fetch Sections
        const sectionsRes = await apiClient.get(ENDPOINTS.SECTIONS.GET_BY_SHEET(sheetData._id));
        const sectionsData = sectionsRes.data.data || [];
        setSections(sectionsData);

        // 3. Parallel Fetch: Items per Section & User Progress
        const itemsPromises = sectionsData.map(section => 
          apiClient.get(ENDPOINTS.ITEMS.GET_BY_SECTION(section._id))
            .then(res => ({ sectionId: section._id, items: res.data.data }))
        );

        const progressPromise = apiClient.get(ENDPOINTS.PROGRESS.GET_SHEET_PROGRESS(sheetData._id));

        const [itemsResults, progressRes] = await Promise.all([
          Promise.all(itemsPromises),
          progressPromise
        ]);

        // 4. Transform Data
        const newItemsMap = {};
        itemsResults.forEach(result => {
          newItemsMap[result.sectionId] = result.items;
        });
        setItemsMap(newItemsMap);
        setProgressMap(progressRes.data.data.progressMap || {});
        
        // Auto-expand the first section for better UX
        if (sectionsData.length > 0) {
          setExpandedSections({ [sectionsData[0]._id]: true });
        }

      } catch (err) {
        console.error("Failed to load sheet:", err);
        setError("Failed to load sheet content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadSheetData();
  }, [slug]);

  // --- COMPUTED STATS ---
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    Object.values(itemsMap).forEach(items => {
      items.forEach(item => {
        total++;
        if (progressMap[item._id] === 'done') completed++;
      });
    });
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }, [itemsMap, progressMap]);

  // --- HANDLERS ---
  const handleToggle = async (sectionId, itemId) => {
    const currentStatus = progressMap[itemId] || 'todo';
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';

    // Optimistic UI Update
    setProgressMap(prev => ({ ...prev, [itemId]: newStatus }));

    try {
      await apiClient.post(ENDPOINTS.PROGRESS.TOGGLE, {
        sheetId: sheet._id,
        sectionId,
        itemId,
        status: newStatus
      });
    } catch (err) {
      console.error("Toggle failed", err);
      // Rollback on failure
      setProgressMap(prev => ({ ...prev, [itemId]: currentStatus }));
      toast.error("Failed to save progress");
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- RENDER STATES ---

  if (loading) {
    return (
        <div className="container max-w-5xl py-10 space-y-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>
            <div className="grid gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container max-w-xl py-20 text-center space-y-6">
            <div className="bg-destructive/10 p-4 rounded-full inline-block">
                <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Unable to load roadmap</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => navigate('/roadmaps')}>Back to Library</Button>
        </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* 1. Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm transition-all">
        <div className="container max-w-5xl py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" className="-ml-2 mt-1 hidden md:flex" onClick={() => navigate('/roadmaps')}>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        {sheet.title}
                    </h1>
                    <p className="text-sm text-muted-foreground line-clamp-1">{sheet.description}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-6 bg-secondary/40 p-2 pr-4 pl-4 rounded-full border border-border/50">
              <div className="flex flex-col items-end">
                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">{stats.completed}</span>
                    <span className="text-xs text-muted-foreground">/ {stats.total}</span>
                 </div>
              </div>
              <div className="w-24 md:w-32">
                <Progress value={stats.percentage} className="h-2.5" />
              </div>
              <span className="text-sm font-bold text-foreground min-w-[3ch]">{stats.percentage}%</span>
            </div>

          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 space-y-6">
        
        {/* 2. Completion Celebration Card */}
        <AnimatePresence>
            {stats.percentage === 100 && (
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
                <div className="inline-flex p-4 rounded-full bg-green-500 text-white mb-4 shadow-lg shadow-green-500/30">
                    <Trophy size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Sheet Completed!</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You've successfully mastered all the topics in this roadmap. This is a huge milestone in your journey!
                </p>
                <Button size="lg" className="gap-2 font-semibold shadow-md active:scale-95 transition-transform">
                    <Share2 size={18} /> Share Achievement
                </Button>
            </motion.div>
            )}
        </AnimatePresence>

        {/* 3. Sections List */}
        {sections.map((section) => {
          const sectionItems = itemsMap[section._id] || [];
          const isExpanded = expandedSections[section._id];
          const sectionTotal = sectionItems.length;
          const sectionCompleted = sectionItems.filter(i => progressMap[i._id] === 'done').length;
          const isSectionComplete = sectionTotal > 0 && sectionCompleted === sectionTotal;

          return (
            <motion.div 
                key={section._id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`border transition-all duration-300 rounded-xl overflow-hidden bg-card ${isExpanded ? 'shadow-md ring-1 ring-primary/5' : 'shadow-sm border-border/60'}`}
            >
              {/* Section Header */}
              <div 
                onClick={() => toggleSection(section._id)} 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors select-none group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-primary/10 text-primary rotate-180' : 'bg-secondary text-muted-foreground'}`}>
                    <ChevronDown size={20} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg transition-colors ${isExpanded ? 'text-primary' : 'text-foreground'}`}>
                        {section.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-md">
                            {sectionCompleted} / {sectionTotal} Solved
                        </span>
                        {isSectionComplete && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                        )}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar for collapsed state */}
                {!isExpanded && (
                    <div className="hidden sm:flex items-center gap-3 w-32">
                         <Progress value={(sectionCompleted/sectionTotal)*100} className="h-1.5" />
                    </div>
                )}
              </div>

              {/* Items Table (Accordion Content) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="border-t border-border/60">
                      {sectionItems.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <div className="bg-muted p-3 rounded-full mb-3"><AlertCircle className="w-6 h-6 opacity-50"/></div>
                            <p>No problems added to this section yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/40">
                          {sectionItems.map((item) => {
                            const isDone = progressMap[item._id] === 'done';
                            
                            return (
                              <div 
                                key={item._id} 
                                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition-all duration-200 hover:bg-muted/40 ${isDone ? 'bg-primary/5' : ''}`}
                              >
                                
                                {/* 1. Checkbox & Title */}
                                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                                    <button 
                                        onClick={() => handleToggle(section._id, item._id)} 
                                        className={`mt-1 sm:mt-0 flex-shrink-0 transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full ${isDone ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
                                        title={isDone ? "Mark as pending" : "Mark as done"}
                                    >
                                        {isDone ? <CheckCircle2 size={26} className="fill-green-500/10" /> : <Circle size={26} strokeWidth={1.5} />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <a 
                                                href={item.externalLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className={`font-medium text-base hover:text-primary hover:underline transition-colors ${isDone ? 'text-muted-foreground line-through decoration-border' : 'text-foreground'}`}
                                            >
                                                {item.title}
                                            </a>
                                            <DifficultyBadge level={item.difficulty} />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Action Buttons & Resources */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0 w-full sm:w-auto">
                                    
                                    {/* Resource Icons (YouTube / Notes) */}
                                    <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1 border border-border/30">
                                        
                                        {/* YouTube */}
                                        {item.youtubeLink ? (
                                            <a 
                                                href={item.youtubeLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" 
                                                title="Watch Video Solution"
                                            >
                                                <Youtube size={18} strokeWidth={2} />
                                            </a>
                                        ) : (
                                            <span className="p-1.5 opacity-20 cursor-default"><Youtube size={18} /></span>
                                        )}

                                        <div className="w-px h-4 bg-border/50 mx-1"></div>

                                        {/* Notes Logic: Internal -> NoteViewer, External -> New Tab */}
                                        {item.hasNote ? (
                                            <button 
                                                onClick={() => navigate(`/notes/${item._id}`)} 
                                                className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors" 
                                                title="Read Internal Notes"
                                            >
                                                <FileText size={18} strokeWidth={2} />
                                            </button>
                                        ) : item.articleLink ? (
                                            <a 
                                                href={item.articleLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors" 
                                                title="Read External Article"
                                            >
                                                <ExternalLink size={18} strokeWidth={2} />
                                            </a>
                                        ) : (
                                            <span className="p-1.5 opacity-20 cursor-default"><FileText size={18} /></span>
                                        )}
                                    </div>

                                    {/* Solve Button */}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-9 gap-2 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all" 
                                        onClick={() => window.open(item.externalLink, '_blank')}
                                    >
                                        <PlayCircle size={14} />
                                        Solve
                                    </Button>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}