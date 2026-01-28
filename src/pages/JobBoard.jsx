import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ExternalLink, 
  Loader2, Plus, Trash2, Pencil, RefreshCcw, Save, Calendar
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

// API Imports
import apiClient from '../lib/api';
import { ENDPOINTS } from '../lib/endpoints';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// --- HELPER FUNCTIONS ---
const getDaysAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const diff = new Date().getTime() - new Date(dateString).getTime();
  const days = Math.floor(diff / (1000 * 3600 * 24));
  return days === 0 ? 'Today' : `${days} days ago`;
};

const isNewJob = (dateString) => {
  if (!dateString) return true;
  const diff = new Date().getTime() - new Date(dateString).getTime();
  return diff < (1000 * 3600 * 24 * 3);
};

// --- MAIN COMPONENT ---
export default function JobBoard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State - MATCHED TO BACKEND SCHEMA
  const initialFormState = {
    title: '', 
    company: '', 
    link: '', 
    type: 'tech', 
    eligibility: '',
    lastDate: '' // Optional Date string
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  // 1. Check Admin Status & Fetch Jobs
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      setIsAdmin(true);
    }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.JOBS.GET_ALL);
      setJobs(response.data.data.jobs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Admin Actions
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData }; 

      if (editingId) {
        await apiClient.patch(ENDPOINTS.JOBS.UPDATE(editingId), payload);
        toast.success("Job updated successfully");
      } else {
        await apiClient.post(ENDPOINTS.JOBS.CREATE, payload);
        toast.success("Job posted successfully");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchJobs();

    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      await apiClient.delete(ENDPOINTS.JOBS.DELETE(id));
      toast.success("Job deleted");
      fetchJobs();
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  const handleCleanup = async () => {
    if (!confirm("Delete all jobs older than 30 days?")) return;
    try {
      const res = await apiClient.delete(ENDPOINTS.JOBS.CLEANUP);
      toast.success(res.data.message);
      fetchJobs();
    } catch (err) {
      toast.error("Cleanup failed");
    }
  };

  const openEditModal = (e, job) => {
    e.stopPropagation();
    setEditingId(job._id);
    setFormData({
      title: job.title,
      company: job.company,
      link: job.link,
      type: job.type,
      eligibility: job.eligibility,
      lastDate: job.lastDate ? new Date(job.lastDate).toISOString().split('T')[0] : ''
    });
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  }

  // 3. Filter Logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (job.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title="Placement Opportunities" 
        subtitle="Verified listings curated by the admin team."
      />
      
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* --- ADMIN TOOLBAR --- */}
        {isAdmin && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">Admin Controls:</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleCleanup} className="border-red-200 hover:bg-red-50 text-red-600">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Cleanup Old Jobs
              </Button>
              <Button size="sm" onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </div>
          </div>
        )}

        {/* --- FILTERS --- */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by role, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] bg-card">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="non-tech">Non-Tech</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* --- LOADING / ERROR --- */}
        {loading && (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
        )}

        {/* --- JOB GRID --- */}
        {!loading && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden" animate="visible"
          >
            {filteredJobs.map((job) => (
              <motion.div variants={cardVariants} key={job._id}>
                <Card 
                  className="card-hover cursor-pointer h-full border-border/50 hover:border-primary/50 group relative" 
                  onClick={() => setSelectedJob(job)}
                >
                  {/* ADMIN EDIT/DELETE OVERLAY */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md border shadow-sm z-10">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={(e) => openEditModal(e, job)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => handleDelete(e, job._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                        {/* Always use UI Avatars since Backend has no logo field */}
                        <img 
                          src={`https://ui-avatars.com/api/?name=${job.company}&background=6366f1&color=fff`} 
                          alt={job.company} className="w-full h-full object-contain p-1"
                        />
                      </div>
                      {isNewJob(job.createdAt) && <span className="badge-new bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">New</span>}
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium uppercase">{job.type}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {getDaysAgo(job.createdAt)}
                      </span>
                      <Button size="sm" variant="secondary">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* --- CREATE / EDIT DIALOG --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Job" : "Post New Job"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrUpdate} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. SDE I" />
              </div>
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Google" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Application Link *</Label>
              <Input required value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://careers..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="non-tech">Non-Tech</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Last Date (Optional)</Label>
                <Input type="date" value={formData.lastDate} onChange={e => setFormData({...formData, lastDate: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Eligibility Criteria *</Label>
              <Textarea required className="min-h-[100px]" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} placeholder="e.g. 2026 Batch, CSE/IT, > 7.0 CGPA" />
            </div>

            <Button type="submit" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {editingId ? "Update Job" : "Post Job"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- VIEW JOB DETAILS SHEET --- */}
      <Sheet open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedJob && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden border">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${selectedJob.company}&background=6366f1&color=fff`} 
                      alt={selectedJob.company} className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl font-bold">{selectedJob.title}</SheetTitle>
                    <p className="text-muted-foreground font-medium">{selectedJob.company}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs px-2 py-0.5 bg-secondary rounded text-secondary-foreground uppercase">{selectedJob.type}</span>
                    </div>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-6 py-6">
                <div>
                  <h4 className="font-semibold mb-2">Description / Eligibility</h4>
                  <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-line border">
                    {selectedJob.eligibility}
                  </div>
                </div>

                {selectedJob.lastDate && (
                  <div>
                    <span className="text-sm text-red-500 font-medium">
                      Deadline: {new Date(selectedJob.lastDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button className="w-full" size="lg" onClick={() => window.open(selectedJob.link, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}