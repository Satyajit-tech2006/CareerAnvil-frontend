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
  Youtube, // New Icon
  FileText // New Icon
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

// Difficulty Badge Component
const DifficultyBadge = ({ level }) => {
  const colors = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  const key = level?.toLowerCase() || 'medium';
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase ${colors[key]}`}>
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

        // 1. Fetch Sheet
        const sheetRes = await apiClient.get(ENDPOINTS.SHEETS.GET_BY_SLUG(slug));
        const sheetData = sheetRes.data.data;
        setSheet(sheetData);

        if (!sheetData) throw new Error("Sheet not found");

        // 2. Fetch Sections
        const sectionsRes = await apiClient.get(ENDPOINTS.SECTIONS.GET_BY_SHEET(sheetData._id));
        const sectionsData = sectionsRes.data.data || [];
        setSections(sectionsData);

        // 3. Fetch Items & Progress
        const itemsPromises = sectionsData.map(section => 
          apiClient.get(ENDPOINTS.ITEMS.GET_BY_SECTION(section._id))
            .then(res => ({ sectionId: section._id, items: res.data.data }))
        );

        const progressPromise = apiClient.get(ENDPOINTS.PROGRESS.GET_SHEET_PROGRESS(sheetData._id));

        const [itemsResults, progressRes] = await Promise.all([
          Promise.all(itemsPromises),
          progressPromise
        ]);

        const newItemsMap = {};
        itemsResults.forEach(result => {
          newItemsMap[result.sectionId] = result.items;
        });
        setItemsMap(newItemsMap);
        setProgressMap(progressRes.data.data.progressMap || {});
        
        // Auto-expand first section
        if (sectionsData.length > 0) {
          setExpandedSections({ [sectionsData[0]._id]: true });
        }

      } catch (err) {
        console.error("Failed to load sheet:", err);
        setError("Failed to load sheet content.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadSheetData();
  }, [slug]);

  // --- LOGIC: STATS ---
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

  // --- LOGIC: TOGGLE ---
  const handleToggle = async (sectionId, itemId) => {
    const currentStatus = progressMap[itemId] || 'todo';
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';

    // Optimistic Update
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
      setProgressMap(prev => ({ ...prev, [itemId]: currentStatus }));
      toast.error("Failed to save progress");
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="container max-w-5xl py-10 space-y-8"><Skeleton className="h-8 w-2/3" /><div className="grid gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div></div>;

  if (error) return <div className="container max-w-xl py-20 text-center space-y-4"><AlertCircle className="w-12 h-12 text-destructive mx-auto" /><h2 className="text-xl font-semibold">Oops! Something went wrong</h2><p className="text-muted-foreground">{error}</p></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-5xl py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{sheet.title}</h1>
              <p className="text-sm text-muted-foreground">{sheet.description || "Master these concepts step by step."}</p>
            </div>
            
            <div className="flex items-center gap-6 bg-secondary/50 p-3 rounded-lg border border-border/50">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{stats.completed}</span>
                <span className="text-sm text-muted-foreground">/{stats.total}</span>
              </div>
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
          const sectionTotal = sectionItems.length;
          const sectionCompleted = sectionItems.filter(i => progressMap[i._id] === 'done').length;

          return (
            <motion.div key={section._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              {/* Section Header */}
              <div onClick={() => toggleSection(section._id)} className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors select-none">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{sectionCompleted}/{sectionTotal} Done</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge variant={sectionCompleted === sectionTotal && sectionTotal > 0 ? "default" : "secondary"}>
                    {sectionCompleted === sectionTotal && sectionTotal > 0 ? "Completed" : `${sectionCompleted}/${sectionTotal}`}
                  </Badge>
                </div>
              </div>

              {/* Items Table */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="border-t border-border">
                      {sectionItems.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">No problems added yet.</div>
                      ) : (
                        <div className="divide-y divide-border/50">
                          {sectionItems.map((item) => {
                            const isDone = progressMap[item._id] === 'done';
                            return (
                              <div key={item._id} className={`flex items-center gap-4 p-4 transition-all hover:bg-muted/30 ${isDone ? 'bg-primary/5' : ''}`}>
                                
                                {/* Checkbox */}
                                <button onClick={() => handleToggle(section._id, item._id)} className={`flex-shrink-0 transition-all active:scale-95 ${isDone ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}>
                                  {isDone ? <CheckCircle2 size={24} className="fill-green-500/10" /> : <Circle size={24} />}
                                </button>

                                {/* Problem Title + Difficulty */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-3 mb-1">
                                    <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className={`font-medium hover:text-primary hover:underline ${isDone ? 'text-muted-foreground line-through decoration-border' : 'text-foreground'}`}>
                                      {item.title}
                                    </a>
                                    <DifficultyBadge level={item.difficulty} />
                                  </div>
                                </div>

                                {/* NEW: RESOURCES COLUMN (TUF Style) */}
                                <div className="flex items-center gap-3 px-2 border-l border-r border-border/40 mx-2">
                                    {/* YouTube */}
                                    {item.youtubeLink ? (
                                        <a href={item.youtubeLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" title="Watch Solution">
                                            <Youtube size={20} />
                                        </a>
                                    ) : <span className="text-muted-foreground/20 text-sm w-8 text-center select-none">--</span>}

                                    {/* Article/Notes */}
                                    {item.articleLink ? (
                                        <a href={item.articleLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors" title="Read Notes">
                                            <FileText size={18} />
                                        </a>
                                    ) : <span className="text-muted-foreground/20 text-sm w-8 text-center select-none">--</span>}
                                </div>

                                {/* Practice Button */}
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-primary" onClick={() => window.open(item.externalLink, '_blank')}>
                                  <ExternalLink size={16} className="mr-2" /> Solve
                                </Button>

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

        {/* Completion Message */}
        {stats.percentage === 100 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center">
            <div className="inline-flex p-3 rounded-full bg-green-500 text-white mb-4 shadow-lg shadow-green-500/30"><Trophy size={32} /></div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Sheet Completed!</h2>
            <p className="text-muted-foreground mb-6">You've mastered this topic. Great job!</p>
            <Button size="lg" className="gap-2"><Share2 size={16} /> Share Achievement</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}