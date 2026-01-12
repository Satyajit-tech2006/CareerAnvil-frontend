import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, CheckCircle2, Circle, ChevronRight, 
  ExternalLink, BookOpen, Play
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { roadmapSteps, type RoadmapStep } from '@/data/mockData';
import { cn } from '@/lib/utils';

const popularRoles = [
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'UI/UX Designer'
];

function TimelineStep({ step, isLast }: { step: RoadmapStep; isLast: boolean }) {
  const [isCompleted, setIsCompleted] = useState(step.status === 'completed');
  
  const getStatusIcon = () => {
    if (isCompleted) {
      return (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="timeline-dot timeline-dot-completed"
        >
          <CheckCircle2 className="w-4 h-4" />
        </motion.div>
      );
    }
    if (step.status === 'in-progress') {
      return (
        <div className="timeline-dot border-primary">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      );
    }
    return (
      <div className="timeline-dot">
        <Circle className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="timeline-node"
    >
      {/* Timeline Line */}
      {!isLast && <div className="timeline-line" />}
      
      {/* Node */}
      <div className="flex items-start gap-4">
        <div className="flex items-center" onClick={() => setIsCompleted(!isCompleted)}>
          {getStatusIcon()}
        </div>
        
        <Card className={cn(
          "flex-1 transition-all",
          step.status === 'in-progress' && "ring-2 ring-primary/20"
        )}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  {step.status === 'in-progress' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {step.duration}
              </span>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <Checkbox 
                checked={isCompleted}
                onCheckedChange={(checked) => setIsCompleted(!!checked)}
              />
              <span className="text-sm text-muted-foreground">
                Mark as completed
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Resources:</p>
              <div className="flex flex-wrap gap-2">
                {step.resources.map((resource) => (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    {resource.title}
                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default function Roadmaps() {
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [showRoadmap, setShowRoadmap] = useState(true);

  const handleGenerate = () => {
    setShowRoadmap(false);
    setTimeout(() => setShowRoadmap(true), 500);
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Career Roadmaps" 
        subtitle="AI-powered learning paths to your dream role"
      />
      
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Hero Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            What is your target role?
          </h2>
          <p className="text-muted-foreground mb-6">
            Enter a role and we'll generate a personalized learning roadmap for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Input
                placeholder="e.g., Full Stack Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="pr-12"
              />
            </div>
            <Button onClick={handleGenerate}>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {popularRoles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  setTargetRole(role);
                  handleGenerate();
                }}
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-colors",
                  role === targetRole
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Roadmap Timeline */}
        <AnimatePresence mode="wait">
          {showRoadmap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative pl-4"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{targetRole} Roadmap</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimated time: 30 weeks
                  </p>
                </div>
              </div>

              <div className="space-y-0">
                {roadmapSteps.map((step, index) => (
                  <TimelineStep
                    key={step.id}
                    step={step}
                    isLast={index === roadmapSteps.length - 1}
                  />
                ))}
              </div>

              {/* Completion */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center p-6 rounded-xl border-2 border-dashed border-border"
              >
                <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Ready for {targetRole} roles!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete all the steps above to unlock your potential
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
