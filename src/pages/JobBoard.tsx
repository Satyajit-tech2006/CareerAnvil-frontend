import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Clock, ExternalLink, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { jobs, type Job } from '@/data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  return (
    <motion.div variants={cardVariants}>
      <Card className="card-hover cursor-pointer h-full" onClick={onClick}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <img 
                src={job.logoUrl} 
                alt={job.company} 
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${job.company}&background=6366f1&color=fff`;
                }}
              />
            </div>
            {job.isNew && <span className="badge-new">New</span>}
          </div>
          
          <h3 className="font-semibold text-foreground mb-1">{job.role}</h3>
          <p className="text-sm text-muted-foreground mb-3">{job.company}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge-type">{job.type}</span>
            <span className="badge-salary">{job.salary}</span>
            <span className="badge-location">
              <MapPin className="w-3 h-3 mr-1" />
              {job.location}
            </span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Posted {job.postedDays} days ago
            </span>
            <Button size="sm">Apply Now</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function JobBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesBatch = batchFilter === 'all' || job.batch.includes(batchFilter);
    return matchesSearch && matchesType && matchesBatch;
  });

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Placement Opportunities" 
        subtitle="Discover your next career move"
      />
      
      <div className="p-6 lg:p-8 space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by role, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
          ))}
        </motion.div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Job Detail Sheet */}
      <Sheet open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedJob && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedJob.logoUrl} 
                      alt={selectedJob.company}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedJob.company}&background=6366f1&color=fff`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <SheetTitle className="text-xl">{selectedJob.role}</SheetTitle>
                    <p className="text-muted-foreground">{selectedJob.company}</p>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-6 py-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge-type">{selectedJob.type}</span>
                  <span className="badge-salary">{selectedJob.salary}</span>
                  <span className="badge-location">
                    <MapPin className="w-3 h-3 mr-1" />
                    {selectedJob.location}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Job Description</h4>
                  <ul className="space-y-2">
                    {selectedJob.description.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Eligibility Criteria</h4>
                  <ul className="space-y-2">
                    {selectedJob.eligibility.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Open for:</span>
                  {selectedJob.batch.map(b => (
                    <span key={b} className="px-2 py-0.5 text-xs rounded-md bg-accent text-accent-foreground">
                      Batch {b}
                    </span>
                  ))}
                </div>

                <Button className="w-full" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Easy Apply
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
