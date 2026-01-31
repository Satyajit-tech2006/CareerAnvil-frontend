import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Briefcase,
  FileSearch,
  Users,
  Code2,
  Sparkles,
  Anvil,
  MessageSquare
} from "lucide-react"

// Import the dedicated stylesheet
import "../styles/Home.css"

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
            </div>

            <div className="nav-actions">
              <button onClick={() => navigate("/login")} className="btn btn-ghost">
                Log in
              </button>
              <button 
                onClick={() => navigate("/signup")} 
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
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
              Tools that actually help. Extract keywords from any Job Description, 
              score your resume against top companies, and master DSA with curated sheets.
            </p>

            <div className="hero-cta">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => navigate("/signup")}
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              >
                Start Preparing Now <ArrowRight size={20} style={{ marginLeft: '8px', color: '#ffffff' }} />
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
            <Stat number="1.5k+" label="Resumes Scanned" />
            <Stat number="200+" label="Jobs Posted" />
            <Stat number="100+" label="Daily Learners" />
            <Stat number="10+" label="Currated Sheets" />
          </div>
        </div>
      </div>

      {/* --- Features Grid --- */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="hero-desc" style={{ fontSize: '1.1rem', margin: 0 }}>
               From application to preparation, we've got you covered.
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
              icon={<Briefcase size={24} />}
              title="Curated Job Board"
              desc="Verified listings from top product-based companies. Filter by role, type, and eligibility."
            />
            <FeatureCard 
              icon={<FileSearch size={24} />}
              title="AI Resume Scanner"
              desc="Check your resume's ATS score. See exactly how you match against companies like Google & Amazon."
            />
            <FeatureCard 
              icon={<Sparkles size={24} />}
              title="JD Keyword Extractor"
              desc="Paste any Job Description to instantly extract the top 40 keywords you need to include in your resume."
            />
            <FeatureCard 
              icon={<Code2 size={24} />}
              title="DSA Sheets"
              desc="Structured roadmaps for Data Structures & Algorithms. Track your progress topic by topic."
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title="Mock Interviews"
              desc="Practice technical interviews with peers or AI. Get feedback on your communication and logic."
              badge="Coming Soon"
            />
            <FeatureCard 
              icon={<MessageSquare size={24} />}
              title="1:1 Mentorship"
              desc="Book sessions with mentors from top tech companies for career guidance and resume reviews."
            />
          </motion.div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2 className="cta-title">Ready to launch your career?</h2>
          <p className="cta-text">
            Join thousands of developers who are optimizing their prep with CareerAnvil.
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

const FeatureCard = ({ icon, title, desc, badge }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
    <div className="feature-card" style={{ position: 'relative' }}>
      {badge && (
        <span style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          fontSize: '0.7rem', 
          background: '#fef3c7', 
          color: '#d97706', 
          padding: '2px 8px', 
          borderRadius: '12px', 
          fontWeight: 600 
        }}>
          {badge}
        </span>
      )}
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