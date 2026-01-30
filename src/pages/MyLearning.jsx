import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function MyLearning() {
  const navigate = useNavigate();
  const [enrolledSheets, setEnrolledSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySheets = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(ENDPOINTS.ENROLLMENT.MY_SHEETS);
        // Assuming response data structure contains an array of enrolled sheets with progress stats
        setEnrolledSheets(response.data.data || []);
      } catch (error) {
        console.error("Failed to load your progress", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMySheets();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Learning</h1>
          <p className="text-muted-foreground">Track your progress and continue where you left off.</p>
        </div>

        {/* Content */}
        {loading ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
           </div>
        ) : enrolledSheets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledSheets.map((enrollment, index) => {
              // Calculate Progress %
              const total = enrollment.sheet.totalItems || 1; // avoid division by zero
              const completed = enrollment.completedItemsCount || 0;
              const percent = Math.round((completed / total) * 100);

              return (
                <motion.div
                  key={enrollment._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-border/50 hover:border-primary/40 transition-all cursor-pointer group" onClick={() => navigate(`/sheets/${enrollment.sheet.slug}`)}>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                           <h3 className="font-semibold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                             {enrollment.sheet.title}
                           </h3>
                           {percent === 100 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {enrollment.sheet.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{percent}%</span>
                        </div>
                        <Progress value={percent} className="h-2.5" />
                        <p className="text-xs text-muted-foreground text-right">
                          {completed}/{total} Problems Solved
                        </p>
                      </div>

                      <Button className="w-full gap-2 group-hover:translate-x-1 transition-transform" variant="outline">
                        Continue Learning <PlayCircle className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
            <div className="p-4 rounded-full bg-muted mb-4">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No active courses</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You haven't enrolled in any learning paths yet. Explore our library to get started.
            </p>
            <Button onClick={() => navigate('/roadmaps')}>
              Browse Library
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}