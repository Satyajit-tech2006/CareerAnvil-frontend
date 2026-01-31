import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, FileSearch, FileText, Layers, 
  TrendingUp, Users, CheckCircle2, ArrowRight, Sparkles 
} from 'lucide-react';

// API Imports
import apiClient, { setAccessToken } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// --- Quick Actions Configuration ---
const quickActions = [
  { 
    title: 'Placement Board',
    description: 'Browse internships and full-time opportunities',
    icon: Briefcase,
    path: '/jobs',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    title: 'Resume Scanner',
    description: 'Get ATS feedback on your resume',
    icon: FileSearch,
    path: '/scanner',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    title: 'JD Extractor',
    description: 'Extract keywords from any Job Description',
    icon: Sparkles,
    path: '/jd-scanner',
    color: 'from-amber-500 to-orange-600'
  },
  { 
    title: 'DSA Sheets',
    description: 'Curated roadmaps for DSA & System Design',
    icon: Layers,
    path: '/sheets',
    color: 'from-emerald-500 to-green-600'
  },
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  
  // State
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : { name: "User", atsScore: 0 };
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [jobCount, setJobCount] = useState(0);
  const [activeLearners, setActiveLearners] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize Dashboard Data
  useEffect(() => {
    // Set a random number for "Current Students Learning" on mount (to avoid hydration mismatch issues if SSR, though this is SPA)
    setActiveLearners(207);

    const initDashboard = async () => {
      // 1. Handle Google Login Redirect
      const urlAccessToken = searchParams.get("accessToken");
      const urlRefreshToken = searchParams.get("refreshToken");

      if (urlAccessToken) {
        setAccessToken(urlAccessToken);
        localStorage.setItem("refreshToken", urlRefreshToken);
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // 2. Fetch Data
      try {
        // Fetch User (For ATS Score & Name)
        const userRes = await apiClient.get(ENDPOINTS.USERS.CURRENT_USER);
        const userData = userRes.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Fetch Jobs (Get Recent 3 + Total Count)
        const jobsRes = await apiClient.get(`${ENDPOINTS.JOBS.GET_ALL}?limit=3`);
        setRecentJobs(jobsRes.data.data.jobs || []);
        // Assuming API returns totalDocs or count. If not, default to length.
        setJobCount(jobsRes.data.data.totalDocs || jobsRes.data.data.jobs?.length || 0);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [searchParams]);

  // Helper variables
  const displayName = user?.fullName || user?.name || user?.username || 'User';
  const firstName = displayName.split(' ')[0];
  const atsScore = user?.atsScore || 0;

  // --- Dynamic Stats Configuration ---
  const stats = [
    { 
      label: 'Active Opportunities', 
      value: loading ? '...' : `${jobCount}+`, 
      icon: Briefcase, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      label: 'Your ATS Score', 
      value: atsScore > 0 ? atsScore : 'N/A', 
      icon: CheckCircle2, 
      color: atsScore >= 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600' 
    },
    { 
      label: 'Current Learners', 
      value: activeLearners, 
      icon: Users, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      label: 'Resumes Optimized', 
      value: '1.5k+', // Hardcoded social proof
      icon: TrendingUp, 
      color: 'bg-orange-100 text-orange-600' 
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${firstName}! Here's what's happening.`}
      />
      
      <motion.div 
        className="p-6 lg:p-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={itemVariants}
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card className="h-full card-hover group border-border/50">
                  <CardContent className="p-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">{action.title}</h3>
                    <p className="text-sm text-muted-foreground leading-snug">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Latest Opportunities */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Latest Opportunities</h2>
            <Link to="/jobs">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
                ))}
             </div>
          ) : recentJobs.length === 0 ? (
             <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No active jobs found at the moment.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentJobs.map((job: any) => (
                <Card key={job._id} className="card-hover border-border/50">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center overflow-hidden shrink-0">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff&size=64`}
                          alt={job.company}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                        {job.type}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {job.location || 'Remote'}
                      </span>
                    </div>

                    <div className="mt-auto pt-2">
                        <a 
                        href={job.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block w-full"
                        >
                        <Button variant="outline" size="sm" className="w-full h-9">
                            Apply Now
                        </Button>
                        </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Call to Action Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    Ready to crack your dream job?
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    Start by optimizing your resume with our AI scanner, then practice with our curated DSA sheets.
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <Link to="/scanner">
                    <Button variant="default" className="shadow-lg shadow-primary/20">Check Resume Score</Button>
                  </Link>
                  <Link to="/sheets">
                    <Button variant="outline" className="bg-background">Start Learning</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}