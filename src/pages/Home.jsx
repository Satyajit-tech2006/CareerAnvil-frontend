import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Briefcase,
  FileText,
  FileSearch,
  Users,
  Code2,
  Rocket,
  Anvil
} from "lucide-react"

// Import the dedicated stylesheet
import "../../src/styles/Home.css"
const Home = () => {
  const navigate = useNavigate()

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  return (
    <div className="home-wrapper">
      
      {/* --- Navbar --- */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="brand" onClick={() => navigate("/")}>
              <div className="brand-icon">
                <Anvil size={20} />
              </div>
              <span>CareerAnvil</span>
            </div>

            <div className="nav-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="#resources" className="nav-link">Resources</a>
              <a href="#testimonials" className="nav-link">Success Stories</a>
            </div>

            <div className="nav-actions">
              <button onClick={() => navigate("/login")} className="btn btn-ghost">
                Log in
              </button>
              <button onClick={() => navigate("/signup")} className="btn btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="hero">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            
            <div className="badge-wrapper">
              <span className="pulse-dot"></span>
              The Ultimate Placement Toolkit
            </div>

            <h1 className="hero-title">
              Crack Your Dream <br />
              <span className="highlight">Tech Role.</span>
            </h1>

            <p className="hero-desc">
              A complete ecosystem for developers. Build ATS-friendly resumes, 
              find curated jobs, and master interviews with 1-on-1 mentorship.
            </p>

            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/signup")}>
                Start Preparing Now <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate("/jobs")}>
                Explore Jobs
              </button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* --- Stats Strip --- */}
      <div className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            <Stat number="10k+" label="Students Placed" />
            <Stat number="500+" label="Top Companies" />
            <Stat number="1M+" label="Resumes Created" />
            <Stat number="4.9/5" label="User Rating" />
          </div>
        </div>
      </div>

      {/* --- Features Grid --- */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why CareerAnvil?</h2>
            <p className="hero-desc" style={{ fontSize: '1.1rem', margin: 0 }}>
              We provide the tools you need to stand out in a crowded job market.
            </p>
          </div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <FeatureCard 
              icon={<FileText size={24} />}
              title="ATS Resume Builder"
              desc="Create professional, ATS-optimized resumes in minutes using our LaTeX-powered engine."
            />
            <FeatureCard 
              icon={<Briefcase size={24} />}
              title="Curated Job Feed"
              desc="Stop scrolling endlessly. Get verified job listings from top product-based companies."
            />
            <FeatureCard 
              icon={<FileSearch size={24} />}
              title="Resume Analysis"
              desc="AI-driven feedback on your resume. Identify missing keywords and formatting errors."
            />
            <FeatureCard 
              icon={<Code2 size={24} />}
              title="DSA Sheets"
              desc="Track your progress on curated DSA problems. Structured roadmaps to master coding."
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title="Mock Interviews"
              desc="Practice with peers or book 1:1 sessions with mentors from FAANG companies."
            />
            <FeatureCard 
              icon={<Rocket size={24} />}
              title="Application Tracker"
              desc="Keep track of all your applications in one place. Never miss a follow-up."
            />
          </motion.div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2 className="cta-title">Ready to launch your career?</h2>
          <p className="cta-text">
            Join thousands of developers who have secured their dream jobs using CareerAnvil.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/signup")}>
            Get Started for Free
          </button>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="brand">
              <div className="brand-icon" style={{ background: '#0f172a' }}>
                <Anvil size={18} />
              </div>
              <span style={{ fontSize: '1.25rem' }}>CareerAnvil</span>
            </div>
            
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Contact Us</a>
            </div>
            
            <div className="copyright">© 2026 CareerAnvil Inc.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// --- Sub Components ---

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
    <div className="feature-card">
      <div className="icon-wrapper">
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  </motion.div>
)

const Stat = ({ number, label }) => (
  <div className="stat-item">
    <h4>{number}</h4>
    <p>{label}</p>
  </div>
)

export default Home