import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, GraduationCap, Briefcase, FolderGit2, Wrench,
  Plus, Trash2, Download, ChevronDown
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { defaultResumeData, type ResumeSection } from '@/data/mockData';
import { cn } from '@/lib/utils';

function ResumePreview({ data }: { data: ResumeSection }) {
  return (
    <div className="preview-canvas w-full p-8 font-serif text-[11px] leading-relaxed overflow-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wide">{data.header.name}</h1>
        <p className="text-[10px] mt-1">
          {data.header.email} | {data.header.phone} | {data.header.location}
        </p>
        <p className="text-[10px]">
          {data.header.linkedin} | {data.header.github}
        </p>
      </div>

      {/* Education */}
      <div className="mb-3">
        <h2 className="text-xs font-bold uppercase border-b border-foreground pb-0.5 mb-2">Education</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-2">
            <div className="flex justify-between">
              <span className="font-bold">{edu.institution}</span>
              <span>{edu.startDate} – {edu.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="italic">{edu.degree} in {edu.field}</span>
              {edu.gpa && <span>GPA: {edu.gpa}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Experience */}
      <div className="mb-3">
        <h2 className="text-xs font-bold uppercase border-b border-foreground pb-0.5 mb-2">Experience</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="mb-2">
            <div className="flex justify-between">
              <span className="font-bold">{exp.company}</span>
              <span>{exp.startDate} – {exp.endDate}</span>
            </div>
            <div className="italic mb-1">{exp.title}</div>
            <ul className="list-disc list-inside space-y-0.5">
              {exp.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-3">
        <h2 className="text-xs font-bold uppercase border-b border-foreground pb-0.5 mb-2">Projects</h2>
        {data.projects.map((project) => (
          <div key={project.id} className="mb-2">
            <div className="flex justify-between">
              <span>
                <span className="font-bold">{project.name}</span>
                {project.link && (
                  <span className="text-muted-foreground"> | {project.link}</span>
                )}
              </span>
              <span className="italic">{project.technologies}</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {project.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xs font-bold uppercase border-b border-foreground pb-0.5 mb-2">Technical Skills</h2>
        {data.skills.map((skill, i) => (
          <p key={i} className="mb-0.5">
            <span className="font-bold">{skill.category}:</span> {skill.items.join(', ')}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState<ResumeSection>(defaultResumeData);

  const updateHeader = (field: keyof ResumeSection['header'], value: string) => {
    setResumeData(prev => ({
      ...prev,
      header: { ...prev.header, [field]: value }
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const updateExperienceBullets = (id: string, bullets: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, bullets: bullets.split('\n').filter(b => b.trim()) } : exp
      )
    }));
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      bullets: []
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Resume Builder" 
        subtitle="Create a professional, ATS-friendly resume"
      />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)]">
        {/* Left Panel - Editor */}
        <div className="w-full lg:w-1/2 border-r border-border overflow-y-auto p-6">
          <Accordion type="multiple" defaultValue={['header', 'experience']} className="space-y-4">
            {/* Header Section */}
            <AccordionItem value="header" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Header</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={resumeData.header.name}
                    onChange={(e) => updateHeader('name', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={resumeData.header.email}
                    onChange={(e) => updateHeader('email', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={resumeData.header.phone}
                    onChange={(e) => updateHeader('phone', e.target.value)}
                  />
                  <Input
                    placeholder="Location"
                    value={resumeData.header.location}
                    onChange={(e) => updateHeader('location', e.target.value)}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={resumeData.header.linkedin}
                    onChange={(e) => updateHeader('linkedin', e.target.value)}
                  />
                  <Input
                    placeholder="GitHub URL"
                    value={resumeData.header.github}
                    onChange={(e) => updateHeader('github', e.target.value)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Education Section */}
            <AccordionItem value="education" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Education</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                    <Input placeholder="Institution" defaultValue={edu.institution} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Degree" defaultValue={edu.degree} />
                      <Input placeholder="Field of Study" defaultValue={edu.field} />
                      <Input placeholder="Start Date" defaultValue={edu.startDate} />
                      <Input placeholder="End Date" defaultValue={edu.endDate} />
                    </div>
                    <Input placeholder="GPA (optional)" defaultValue={edu.gpa} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Experience Section */}
            <AccordionItem value="experience" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Experience</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {resumeData.experience.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Input 
                        placeholder="Job Title"
                        className="flex-1 mr-2"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input 
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      />
                      <Input 
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Bullet points (one per line)"
                      rows={4}
                      value={exp.bullets.join('\n')}
                      onChange={(e) => updateExperienceBullets(exp.id, e.target.value)}
                    />
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addExperience}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Projects Section */}
            <AccordionItem value="projects" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Projects</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                {resumeData.projects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg space-y-3">
                    <Input placeholder="Project Name" defaultValue={project.name} />
                    <Input placeholder="Technologies" defaultValue={project.technologies} />
                    <Input placeholder="Link (optional)" defaultValue={project.link} />
                    <Textarea
                      placeholder="Description (one point per line)"
                      rows={3}
                      defaultValue={project.description.join('\n')}
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Skills Section */}
            <AccordionItem value="skills" className="border rounded-lg px-4">
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">Skills</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                {resumeData.skills.map((skill, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3">
                    <Input placeholder="Category" defaultValue={skill.category} />
                    <Input 
                      className="col-span-2"
                      placeholder="Skills (comma separated)"
                      defaultValue={skill.items.join(', ')}
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Generate Button */}
          <div className="sticky bottom-0 pt-4 pb-2 bg-background">
            <Button className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="hidden lg:flex w-1/2 bg-slate-700 items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg"
          >
            <ResumePreview data={resumeData} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
