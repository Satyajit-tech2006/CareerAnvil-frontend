// Mock data for CareerForge platform

export interface Job {
  id: string;
  company: string;
  role: string;
  type: 'Internship' | 'Full-time' | 'Remote' | 'Hybrid';
  salary: string;
  location: string;
  logoUrl: string;
  postedDays: number;
  isNew: boolean;
  batch: string[];
  description: string[];
  eligibility: string[];
}

export const jobs: Job[] = [
  {
    id: '1',
    company: 'Google',
    role: 'Software Engineering Intern',
    type: 'Internship',
    salary: '₹80k/month',
    location: 'Bangalore',
    logoUrl: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    postedDays: 1,
    isNew: true,
    batch: ['2025', '2026'],
    description: [
      'Work on cutting-edge products that impact billions of users',
      'Collaborate with world-class engineers on complex systems',
      'Participate in design reviews and code reviews',
      'Contribute to open-source projects and internal tools'
    ],
    eligibility: [
      'Currently pursuing B.Tech/M.Tech in CS or related field',
      'Strong foundation in Data Structures and Algorithms',
      'Proficiency in at least one programming language'
    ]
  },
  {
    id: '2',
    company: 'Microsoft',
    role: 'Product Manager Intern',
    type: 'Hybrid',
    salary: '₹75k/month',
    location: 'Hyderabad',
    logoUrl: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
    postedDays: 2,
    isNew: true,
    batch: ['2025'],
    description: [
      'Define product roadmap for Azure services',
      'Work closely with engineering and design teams',
      'Conduct user research and analyze market trends',
      'Present to senior leadership on product strategy'
    ],
    eligibility: [
      'MBA or equivalent experience preferred',
      'Strong analytical and communication skills',
      'Experience with agile methodologies'
    ]
  },
  {
    id: '3',
    company: 'Amazon',
    role: 'SDE-1',
    type: 'Full-time',
    salary: '₹24 LPA',
    location: 'Chennai',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    postedDays: 3,
    isNew: false,
    batch: ['2025'],
    description: [
      'Build scalable distributed systems',
      'Own end-to-end feature development',
      'Participate in on-call rotations',
      'Mentor junior engineers'
    ],
    eligibility: [
      'B.Tech/M.Tech with 0-2 years experience',
      'Strong problem-solving skills',
      'Experience with AWS services is a plus'
    ]
  },
  {
    id: '4',
    company: 'Flipkart',
    role: 'Data Science Intern',
    type: 'Internship',
    salary: '₹50k/month',
    location: 'Bangalore',
    logoUrl: 'https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png',
    postedDays: 5,
    isNew: false,
    batch: ['2025', '2026'],
    description: [
      'Build ML models for recommendation systems',
      'Analyze large-scale datasets',
      'Work with cross-functional teams',
      'Present insights to stakeholders'
    ],
    eligibility: [
      'Strong foundation in statistics and ML',
      'Proficiency in Python and SQL',
      'Experience with TensorFlow/PyTorch preferred'
    ]
  },
  {
    id: '5',
    company: 'Razorpay',
    role: 'Frontend Developer',
    type: 'Remote',
    salary: '₹18 LPA',
    location: 'Remote',
    logoUrl: 'https://razorpay.com/assets/razorpay-logo.svg',
    postedDays: 4,
    isNew: true,
    batch: ['2025'],
    description: [
      'Build payment checkout experiences',
      'Optimize for performance and accessibility',
      'Collaborate with backend and design teams',
      'Write unit and integration tests'
    ],
    eligibility: [
      'Experience with React and TypeScript',
      'Understanding of web performance',
      'Strong CSS and responsive design skills'
    ]
  },
  {
    id: '6',
    company: 'Stripe',
    role: 'Backend Engineer Intern',
    type: 'Internship',
    salary: '₹1.2L/month',
    location: 'Bangalore',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png',
    postedDays: 1,
    isNew: true,
    batch: ['2026', '2027'],
    description: [
      'Work on payment infrastructure',
      'Build APIs used by millions of businesses',
      'Ensure 99.99% uptime for critical systems',
      'Learn from industry experts'
    ],
    eligibility: [
      'Strong fundamentals in systems design',
      'Experience with Ruby, Go, or Java',
      'Interest in fintech and payments'
    ]
  }
];

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  resources: { title: string; url: string }[];
  duration: string;
}

export const roadmapSteps: RoadmapStep[] = [
  {
    id: '1',
    title: 'Web Fundamentals',
    description: 'Master HTML5, CSS3, and responsive design principles',
    status: 'completed',
    duration: '4 weeks',
    resources: [
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
      { title: 'CSS Tricks', url: 'https://css-tricks.com' },
      { title: 'freeCodeCamp', url: 'https://freecodecamp.org' }
    ]
  },
  {
    id: '2',
    title: 'JavaScript & ES6+',
    description: 'Deep dive into modern JavaScript, async programming, and DOM manipulation',
    status: 'completed',
    duration: '6 weeks',
    resources: [
      { title: 'JavaScript.info', url: 'https://javascript.info' },
      { title: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net' }
    ]
  },
  {
    id: '3',
    title: 'React & State Management',
    description: 'Build interactive UIs with React, hooks, and state management solutions',
    status: 'in-progress',
    duration: '8 weeks',
    resources: [
      { title: 'React Documentation', url: 'https://react.dev' },
      { title: 'Zustand Guide', url: 'https://zustand-demo.pmnd.rs' }
    ]
  },
  {
    id: '4',
    title: 'Backend Development',
    description: 'Learn Node.js, Express, REST APIs, and database design',
    status: 'upcoming',
    duration: '8 weeks',
    resources: [
      { title: 'Node.js Docs', url: 'https://nodejs.org/docs' },
      { title: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com' }
    ]
  },
  {
    id: '5',
    title: 'DevOps & Deployment',
    description: 'Master Git, CI/CD, Docker, and cloud deployment strategies',
    status: 'upcoming',
    duration: '4 weeks',
    resources: [
      { title: 'Docker Docs', url: 'https://docs.docker.com' },
      { title: 'GitHub Actions', url: 'https://docs.github.com/actions' }
    ]
  }
];

export interface ATSResult {
  score: number;
  missingKeywords: string[];
  presentKeywords: string[];
  formattingChecks: { label: string; passed: boolean }[];
  suggestions: string[];
}

export const atsResult: ATSResult = {
  score: 72,
  missingKeywords: ['TypeScript', 'GraphQL', 'CI/CD', 'Agile'],
  presentKeywords: ['React', 'JavaScript', 'Node.js', 'Git', 'REST API', 'MongoDB'],
  formattingChecks: [
    { label: 'Margins (0.5-1 inch)', passed: true },
    { label: 'Font Size (10-12pt)', passed: true },
    { label: 'Contact Information', passed: false },
    { label: 'Section Headers', passed: true },
    { label: 'Bullet Points', passed: true },
    { label: 'Page Length (1-2 pages)', passed: true }
  ],
  suggestions: [
    'Add a professional email address to your contact section',
    'Include TypeScript in your skills if you have experience with it',
    'Quantify your achievements with metrics (e.g., "Improved performance by 40%")',
    'Add a brief professional summary at the top'
  ]
};

export interface ResumeSection {
  header: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
  };
  education: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }[];
  experience: {
    id: string;
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  projects: {
    id: string;
    name: string;
    technologies: string;
    description: string[];
    link?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
}

export const defaultResumeData: ResumeSection = {
  header: {
    name: 'Arjun Sharma',
    email: 'arjun.sharma@email.com',
    phone: '+91 98765 43210',
    linkedin: 'linkedin.com/in/arjunsharma',
    github: 'github.com/arjunsharma',
    location: 'Bangalore, India'
  },
  education: [
    {
      id: '1',
      institution: 'Indian Institute of Technology, Delhi',
      degree: 'Bachelor of Technology',
      field: 'Computer Science and Engineering',
      startDate: 'Aug 2021',
      endDate: 'May 2025',
      gpa: '8.9/10'
    }
  ],
  experience: [
    {
      id: '1',
      company: 'Google',
      title: 'Software Engineering Intern',
      startDate: 'May 2024',
      endDate: 'Aug 2024',
      bullets: [
        'Developed a real-time collaboration feature using WebSockets, improving team productivity by 35%',
        'Optimized database queries reducing page load time by 40% across 15M+ daily active users',
        'Led code reviews for a team of 4 interns, ensuring adherence to best practices'
      ]
    }
  ],
  projects: [
    {
      id: '1',
      name: 'CodeCollab',
      technologies: 'React, Node.js, Socket.io, MongoDB',
      description: [
        'Built a real-time collaborative code editor supporting 50+ concurrent users',
        'Implemented syntax highlighting for 20+ programming languages'
      ],
      link: 'github.com/arjunsharma/codecollab'
    }
  ],
  skills: [
    { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'] },
    { category: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Next.js', 'TailwindCSS'] },
    { category: 'Tools', items: ['Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL'] }
  ]
};
