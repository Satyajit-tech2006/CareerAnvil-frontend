import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, FileSearch, FileText, Map, 
  TrendingUp, Users, Target, ArrowRight 
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

// --- Static Stats ---
const stats = [
  { label: 'Active Opportunities', value: '150+', icon: Briefcase, color: 'text-primary' },
  { label: 'Companies Hiring', value: '45', icon: Users, color: 'text-success' },
  { label: 'Students Placed', value: '2,340', icon: Target, color: 'text-warning' },
  { label: 'Avg. Package', value: '₹18 LPA', icon: TrendingUp, color: 'text-primary' },
];

const quickActions = [
  { 
    title: 'Placement Board',
    description: 'Browse internships and full-time opportunities',
    icon: Briefcase,
    path: '/jobs',
    color: 'from-primary to-primary/80'
  },
  { 
    title: 'Resume Scanner',
    description: 'Get ATS feedback on your resume',
    icon: FileSearch,
    path: '/scanner',
    color: 'from-success to-success/80'
  },
  { 
    title: 'Resume Builder',
    description: 'Create a professional LaTeX-style resume',
    icon: FileText,
    path: '/builder',
    color: 'from-warning to-warning/80'
  },
  { 
    title: 'Career Roadmaps',
    description: 'AI-powered learning paths',
    icon: Map,
    path: '/roadmaps',
    color: 'from-primary to-primary/80'
  },
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  // Initialize with LocalStorage data if available to prevent "User" flash
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : { name: "User" };
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Handle Google Login & Data Fetching
  useEffect(() => {
    const initDashboard = async () => {
      // A. Check for Tokens in URL (Google Login Redirect)
      const urlAccessToken = searchParams.get("accessToken");
      const urlRefreshToken = searchParams.get("refreshToken");

      if (urlAccessToken) {
        setAccessToken(urlAccessToken);
        localStorage.setItem("refreshToken", urlRefreshToken);
        // Clean URL
        window.history.replaceState({}, document.title, "/dashboard");
      }

      // B. Fetch Data (User Profile & Jobs)
      try {
        // 1. Fetch Current User (Get fresh data from DB)
        // Ensure your Backend returns { data: { name: "...", ... } }
        const userRes = await apiClient.get(ENDPOINTS.USERS.CURRENT_USER);
        const userData = userRes.data.data;
        
        console.log("Fetched User Data:", userData); // Debug Log
        
        // Update State
        setUser(userData);
        // Update LocalStorage so Sidebar also updates
        localStorage.setItem('user', JSON.stringify(userData));

        // 2. Fetch Latest Jobs (Limit 3)
        const jobsRes = await apiClient.get(`${ENDPOINTS.JOBS.GET_ALL}?limit=3`);
        setRecentJobs(jobsRes.data.data.jobs || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [searchParams]);

  // Helper to get the best display name
  const displayName = user?.fullName || user?.name || user?.username || 'User';
  // Get just the first name for the welcome message
  const firstName = displayName.split(' ')[0];

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
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
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
                <Card className="h-full card-hover group">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
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
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
             <div className="text-center py-10 text-muted-foreground">Loading jobs...</div>
          ) : recentJobs.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">No active jobs found. Check back later!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentJobs.map((job) => (
                <Card key={job._id} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff`}
                          alt={job.company}
                          className="w-full h-full object-contain p-1.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      {new Date(job.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) && (
                        <span className="badge-new text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">New</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">
                        {job.type}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                        {job.eligibility}
                      </span>
                    </div>
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                         Apply Now
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Progress Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Complete your profile
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add your resume and skills to get personalized job recommendations.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to="/scanner">
                    <Button variant="outline">Upload Resume</Button>
                  </Link>
                  <Link to="/builder">
                    <Button>Build Resume</Button>
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