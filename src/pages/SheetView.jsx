import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Loader2, 
  Trophy,
  Share2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

// --- HELPER COMPONENTS ---

// Difficulty Badge
const DifficultyBadge = ({ level }) => {
  const colors = {
    Easy: "bg-green-500/10 text-green-500 border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[level] || colors.Medium}`}>
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
  const [itemsMap, setItemsMap] = useState({}); // { sectionId: [items] }
  const [progressMap, setProgressMap] = useState({}); // { itemId: 'done' | 'todo' }
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({}); // { sectionId: boolean }

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadSheetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Sheet Details
        const sheetRes = await apiClient.get(ENDPOINTS.SHEETS.GET_BY_SLUG(slug));
        const sheetData = sheetRes.data.data;
        setSheet(sheetData);

        if (!sheetData) throw new Error("Sheet not found");

        // 2. Fetch Sections for this Sheet
        const sectionsRes = await apiClient.get(ENDPOINTS.SECTIONS.GET_BY_SHEET(sheetData._id));
        const sectionsData = sectionsRes.data.data || [];
        setSections(sectionsData);

        // 3. Fetch Items & Progress in Parallel
        // We create an array of promises to fetch items for ALL sections at once
        const itemsPromises = sectionsData.map(section => 
          apiClient.get(ENDPOINTS.ITEMS.GET_BY_SECTION(section._id))
            .then(res => ({ sectionId: section._id, items: res.data.data }))
        );

        // Also fetch user's progress
        const progressPromise = apiClient.get(ENDPOINTS.PROGRESS.GET_SHEET_PROGRESS(sheetData._id));

        const [itemsResults, progressRes] = await Promise.all([
          Promise.all(itemsPromises),
          progressPromise
        ]);

        // 4. Organize Data
        const newItemsMap = {};
        itemsResults.forEach(result => {
          newItemsMap[result.sectionId] = result.items;
        });
        setItemsMap(newItemsMap);
        setProgressMap(progressRes.data.data.progressMap || {});
        
        // Auto-expand the first section
        if (sectionsData.length > 0) {
          setExpandedSections({ [sectionsData[0]._id]: true });
        }

      } catch (err) {
        console.error("Failed to load sheet:", err);
        setError("Failed to load sheet content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadSheetData();
  }, [slug]);


  // --- LOGIC: CALCULATE PROGRESS ---
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


  // --- LOGIC: TOGGLE CHECKBOX (OPTIMISTIC UI) ---
  const handleToggle = async (sectionId, itemId) => {
    // 1. Determine new status
    const currentStatus = progressMap[itemId] || 'todo';
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';

    // 2. Optimistic Update (Update UI immediately)
    setProgressMap(prev => ({ ...prev, [itemId]: newStatus }));

    // 3. API Call
    try {
      await apiClient.post(ENDPOINTS.PROGRESS.TOGGLE, {
        sheetId: sheet._id,
        sectionId,
        itemId,
        status: newStatus
      });
      // Optionally show a subtle success toast
      // toast.success(newStatus === 'done' ? "Problem solved!" : "Marked as pending");
    } catch (err) {
      // 4. Rollback on error
      console.error("Toggle failed", err);
      setProgressMap(prev => ({ ...prev, [itemId]: currentStatus }));
      toast.error("Failed to save progress");
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };


  // --- RENDER: LOADING STATE ---
  if (loading) {
    return (
      <div className="container max-w-5xl py-10 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  // --- RENDER: ERROR STATE ---
  if (error) {
    return (
      <div className="container max-w-xl py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Oops! Something went wrong</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // --- RENDER: MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Sticky Header / Progress Overview */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-5xl py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{sheet.title}</h1>
              <p className="text-sm text-muted-foreground">{sheet.description || "Master these concepts step by step."}</p>
            </div>
            
            <div className="flex items-center gap-6 bg-secondary/50 p-3 rounded-lg border border-border/50">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{stats.completed}</span>
                <span className="text-sm text-muted-foreground">/{stats.total}</span>
              </div>
              
              {/* Circular Progress (CSS only approach for simplicity) or standard bar */}
              <div className="w-32 space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Progress</span>
                  <span>{stats.percentage}%</span>
                </div>
                <Progress value={stats.percentage} className="h-2.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 space-y-6">
        {/* Sections List */}
        {sections.map((section) => {
          const sectionItems = itemsMap[section._id] || [];
          const isExpanded = expandedSections[section._id];
          
          // Calculate Section Progress
          const sectionTotal = sectionItems.length;
          const sectionCompleted = sectionItems.filter(i => progressMap[i._id] === 'done').length;

          return (
            <motion.div 
              key={section._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl overflow-hidden bg-card shadow-sm"
            >
              {/* Section Header */}
              <div 
                onClick={() => toggleSection(section._id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {sectionCompleted}/{sectionTotal} Done • {section.description || "Core concepts"}
                    </p>
                  </div>
                </div>
                
                {/* Mini progress ring or fraction */}
                <div className="hidden sm:block">
                  <Badge variant={sectionCompleted === sectionTotal && sectionTotal > 0 ? "default" : "secondary"}>
                    {sectionCompleted === sectionTotal && sectionTotal > 0 ? "Completed" : `${sectionCompleted}/${sectionTotal}`}
                  </Badge>
                </div>
              </div>

              {/* Section Content (Items Table) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-border">
                      {sectionItems.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          No problems added to this section yet.
                        </div>
                      ) : (
                        <div className="divide-y divide-border/50">
                          {sectionItems.map((item) => {
                            const isDone = progressMap[item._id] === 'done';

                            return (
                              <div 
                                key={item._id} 
                                className={`flex items-center gap-4 p-4 transition-all hover:bg-muted/30 ${isDone ? 'bg-primary/5' : ''}`}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => handleToggle(section._id, item._id)}
                                  className={`flex-shrink-0 transition-all active:scale-95 ${isDone ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                  {isDone ? (
                                    <CheckCircle2 size={24} className="fill-green-500/10" />
                                  ) : (
                                    <Circle size={24} />
                                  )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <a 
                                      href={item.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`font-medium hover:text-primary hover:underline flex items-center gap-1 ${isDone ? 'text-muted-foreground line-through decoration-border' : 'text-foreground'}`}
                                    >
                                      {item.title}
                                      <ExternalLink size={12} className="opacity-50" />
                                    </a>
                                    <DifficultyBadge level={item.difficulty} />
                                  </div>
                                </div>

                                {/* Actions / Notes */}
                                <div className="flex items-center gap-2">
                                  {/* Placeholder for future Notes/Revision button */}
                                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => window.open(item.link, '_blank')}>
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

        {/* Completion State */}
        {stats.percentage === 100 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
          >
            <div className="inline-flex p-3 rounded-full bg-green-500 text-white mb-4 shadow-lg shadow-green-500/30">
              <Trophy size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Sheet Completed!</h2>
            <p className="text-muted-foreground mb-6">You've mastered this topic. Great job keeping up the consistency.</p>
            <Button size="lg" className="gap-2">
              <Share2 size={16} /> Share Achievement
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}