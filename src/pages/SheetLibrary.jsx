import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, ArrowRight, Loader2, Code2, Layers, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

// Helper to pick an icon based on title tags
const getIconForSheet = (title) => {
  if (title.toLowerCase().includes('design')) return <Layers className="w-6 h-6 text-purple-500" />;
  if (title.toLowerCase().includes('sql') || title.toLowerCase().includes('db')) return <Database className="w-6 h-6 text-blue-500" />;
  return <Code2 className="w-6 h-6 text-green-500" />;
};

export default function SheetLibrary() {
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Sheets
  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.SHEETS.GET_ALL);
        // Assuming response structure: { data: { sheets: [...] } } or { data: [...] }
        const data = response.data.data.sheets || response.data.data || [];
        setSheets(data);
      } catch (error) {
        console.error("Failed to fetch sheets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSheets();
  }, []);

  const filteredSheets = sheets.filter(sheet => 
    sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container max-w-6xl py-12 md:py-16 space-y-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Master Technical Skills
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated roadmaps for Data Structures, System Design, and more. 
            Follow step-by-step paths used by top engineers.
          </p>
          
          <div className="max-w-md mx-auto mt-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search topics (e.g. 'Dynamic Programming')..." 
              className="pl-10 h-12 bg-background shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="container max-w-6xl py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[280px] flex flex-col justify-between p-6">
                <div className="space-y-4">
                   <Skeleton className="w-12 h-12 rounded-lg" />
                   <Skeleton className="h-6 w-3/4" />
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSheets.map((sheet, index) => (
              <motion.div
                key={sheet._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate(`/sheets/${sheet.slug}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        {getIconForSheet(sheet.title)}
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {sheet.totalItems || 0} Problems
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{sheet.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {sheet.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-4">
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Start Learning <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
            
            {filteredSheets.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                No learning paths found matching "{searchQuery}"
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}