import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ArrowRight, Users, Shield, Zap, Clock, CheckCircle } from 'lucide-react';
import axios from '../config/axios';
import Footer from '../components/Footer';
import { formatPrice } from '../utils/currency';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredGigs, setFeaturedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const heroHeadlines = [
    { headline: "Hire the talent your project actually needs.", sub: "Vetted freelancers. Real work. No guesswork." },
    { headline: "From idea to delivery — without the agency markup.", sub: "Project-based pricing. Clear milestones. Quality output." },
    { headline: "The fastest way to grow your team without growing headcount.", sub: "On-demand expertise for every stage of your business." },
  ];

  const categories = [
    { name: "Graphics & Design", icon: "✦", desc: "Logos, branding, UI/UX", path: "graphics-design" },
    { name: "Digital Marketing", icon: "◈", desc: "SEO, ads, social strategy", path: "digital-marketing" },
    { name: "Writing & Translation", icon: "◉", desc: "Copy, content, localization", path: "writing-translation" },
    { name: "Video & Animation", icon: "▶", desc: "Editing, motion, 3D", path: "video-animation" },
    { name: "Music & Audio", icon: "◎", desc: "Voiceover, mixing, scoring", path: "music-audio" },
    { name: "Programming & Tech", icon: "⬡", desc: "Web, mobile, APIs", path: "programming-tech" },
    { name: "Business", icon: "◇", desc: "Finance, strategy, ops", path: "business" },
    { name: "AI Services", icon: "⬟", desc: "Automation, prompts, models", path: "ai-services" },
  ];

  const popularSearches = [
    'Brand Identity', 'Landing Page', 'SEO Audit', 'React Developer',
    'Content Strategy', 'Motion Graphics', 'Copywriting'
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Founder, TechStart Inc.",
      quote: "We cut our time-to-hire from weeks to days. The quality of work on CodeHire consistently surprises us.",
      initials: "SJ",
      color: "#1E2D4A"
    },
    {
      name: "Michael Chen",
      role: "Marketing Director, Digital Solutions",
      quote: "Every campaign we've run with CodeHire talent has outperformed in-house benchmarks. The talent pool is genuinely strong.",
      initials: "MC",
      color: "#2A3F5F"
    },
    {
      name: "Emma Davis",
      role: "CEO, StyleCraft",
      quote: "Our rebrand took three weeks. One designer, one brief, zero back-and-forth drama. That's what we come back for.",
      initials: "ED",
      color: "#344E75"
    }
  ];

  const trustPoints = [
    { icon: Shield, title: "Payment held in escrow", body: "Funds are only released when you confirm the work meets your brief — no exceptions." },
    { icon: Zap, title: "Matched within minutes", body: "Our search surfaces the right specialists for your scope, budget, and timeline." },
    { icon: Clock, title: "Clear delivery windows", body: "Every gig has a set turnaround. No open-ended timelines or moving goalposts." },
    { icon: Users, title: "Support on every order", body: "Dedicated resolution support is available around the clock, seven days a week." },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroHeadlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchFeaturedGigs(); }, []);

  const fetchFeaturedGigs = async () => {
    try {
      const response = await axios.get('/api/gigs');
      let gigs = response.data?.gigs || (Array.isArray(response.data) ? response.data : []);
      setFeaturedGigs(gigs.slice(0, 8));
    } catch {
      setFeaturedGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const path = searchQuery.trim()
      ? `/client/browse-gigs?search=${encodeURIComponent(searchQuery)}`
      : '/client/browse-gigs';
    navigate(path);
  };

  const handleCategoryClick = (cat) => navigate(`/client/browse-gigs?category=${encodeURIComponent(cat.name)}`);
  const handleGigClick = (gig) => navigate(`/client/gig/${gig._id}`);
  const handlePopularSearch = (term) => { setSearchQuery(term); navigate(`/client/browse-gigs?search=${encodeURIComponent(term)}`); };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#F7F5F1', color: '#0F1523' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ background: '#0F1523', minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}>

            {/* Left — copy */}
            <div>
              {/* Eyebrow */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.25)', borderRadius: 40, padding: '6px 14px', marginBottom: 32 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4A853', display: 'inline-block' }} />
                <span style={{ color: '#D4A853', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Freelance marketplace</span>
              </div>

              {/* Rotating headline */}
              <h1 key={currentSlide} style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, color: '#F7F5F1', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em', transition: 'opacity 0.5s' }}>
                {heroHeadlines[currentSlide].headline}
              </h1>
              <p style={{ fontSize: 18, color: '#8A9BB5', marginBottom: 40, lineHeight: 1.6 }}>
                {heroHeadlines[currentSlide].sub}
              </p>

              {/* Search */}
              <div style={{ display: 'flex', gap: 0, maxWidth: 560, background: '#1E2D4A', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#6C7A96' }} />
                  <input
                    type="text"
                    placeholder="What do you need done?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '16px 16px 16px 48px', color: '#F7F5F1', fontSize: 15 }}
                  />
                </div>
                <button onClick={handleSearch} style={{ background: '#D4A853', color: '#0F1523', border: 'none', padding: '0 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                  Search
                </button>
              </div>

              {/* Popular tags */}
              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6C7A96', fontWeight: 500 }}>Trending:</span>
                {popularSearches.map((tag) => (
                  <button key={tag} onClick={() => handlePopularSearch(tag)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#8A9BB5', borderRadius: 40, padding: '5px 12px', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.target.style.borderColor = '#D4A853'; e.target.style.color = '#D4A853'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#8A9BB5'; }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right — floating dashboard card */}
            <div style={{ position: 'relative' }}>
              <div style={{ background: '#1A2740', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 28, boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <span style={{ color: '#6C7A96', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active Projects</span>
                  <span style={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Live</span>
                </div>
                {[
                  { label: 'Brand Identity — Startup', status: 'In Review', progress: 80, color: '#D4A853' },
                  { label: 'E-commerce Redesign', status: 'In Progress', progress: 45, color: '#5B8FD4' },
                  { label: 'SEO Content Package', status: 'Delivered', progress: 100, color: '#4CAF7D' },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 20 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#C8D6E8', fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: 11, fontWeight: 600 }}>{item.status}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4 }}>
                      <div style={{ width: `${item.progress}%`, height: '100%', background: item.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 24, paddingTop: 20, display: 'flex', justifyContent: 'space-between' }}>
                  {[['Hired', '14'], ['Completed', '12'], ['Rating', '4.9']].map(([k, v]) => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ color: '#F7F5F1', fontSize: 22, fontWeight: 700 }}>{v}</div>
                      <div style={{ color: '#6C7A96', fontSize: 11, marginTop: 2 }}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating mini-card */}
              <div style={{ position: 'absolute', bottom: -24, left: -32, background: '#D4A853', borderRadius: 12, padding: '12px 18px', boxShadow: '0 16px 32px rgba(212,168,83,0.3)' }}>
                <div style={{ color: '#0F1523', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>NEW ORDER</div>
                <div style={{ color: '#0F1523', fontSize: 13, fontWeight: 600, marginTop: 2 }}>Logo & Brand Kit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {heroHeadlines.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? 24 : 6, height: 6, borderRadius: 3, background: i === currentSlide ? '#D4A853' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
      </section>

      {/* ── CATEGORY STRIP ───────────────────────────────── */}
      <section style={{ background: '#F7F5F1', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 8 }}>What we cover</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, color: '#0F1523', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>Every discipline.<br />One platform.</h2>
            </div>
            <button onClick={() => navigate('/client/browse-gigs')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1.5px solid #0F1523', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#0F1523' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0F1523'; e.currentTarget.style.color = '#F7F5F1'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0F1523'; }}
            >
              Browse all <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {categories.map((cat, i) => (
              <div key={i} onClick={() => handleCategoryClick(cat)}
                onMouseEnter={() => setActiveCategory(i)}
                onMouseLeave={() => setActiveCategory(null)}
                style={{ background: activeCategory === i ? '#0F1523' : '#fff', border: '1px solid #E2E0DB', borderRadius: 12, padding: '28px 24px', cursor: 'pointer', transition: 'all 0.2s', transform: activeCategory === i ? 'translateY(-3px)' : 'none', boxShadow: activeCategory === i ? '0 16px 40px rgba(15,21,35,0.15)' : 'none' }}>
                <span style={{ fontSize: 22, display: 'block', marginBottom: 16, color: activeCategory === i ? '#D4A853' : '#6C7A96', fontFamily: 'monospace' }}>{cat.icon}</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: activeCategory === i ? '#F7F5F1' : '#0F1523', marginBottom: 6, margin: '0 0 6px 0' }}>{cat.name}</h3>
                <p style={{ fontSize: 12, color: activeCategory === i ? '#8A9BB5' : '#9B9587', margin: 0 }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED GIGS ────────────────────────────────── */}
      <section style={{ background: '#EFECE6', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 8 }}>Featured services</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, color: '#0F1523', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>Work worth hiring for.</h2>
            </div>
            <button onClick={() => navigate('/client/browse-gigs')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#D4A853', border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#0F1523' }}>
              View all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E0DB' }}>
                  <div style={{ height: 180, background: '#E2E0DB', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ padding: 16 }}>
                    <div style={{ height: 12, background: '#E2E0DB', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 12, background: '#E2E0DB', borderRadius: 4, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {featuredGigs.map((gig, index) => (
                <div key={gig._id} onClick={() => handleGigClick(gig)}
                  style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E0DB', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(15,21,35,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={gig.image || `https://picsum.photos/400/280?random=${index + 20}`} alt={gig.title}
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <img src={gig.sellerId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(gig.sellerId?.name || 'U')}&background=1E2D4A&color=F7F5F1&size=32`}
                        alt={gig.sellerId?.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      <span style={{ fontSize: 12, color: '#6C7A96', fontWeight: 500 }}>{gig.sellerId?.name}</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F1523', lineHeight: 1.45, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {gig.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0EDE8', paddingTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} style={{ color: '#D4A853', fill: '#D4A853' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0F1523' }}>{gig.rating || '5.0'}</span>
                        <span style={{ fontSize: 11, color: '#9B9587' }}>({gig.reviews?.length || '—'})</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: '#9B9587', letterSpacing: '0.05em', textTransform: 'uppercase' }}>From</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1523' }}>{formatPrice(gig.price)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST SECTION ────────────────────────────────── */}
      <section style={{ background: '#0F1523', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 16 }}>Why CodeHire</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700, color: '#F7F5F1', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>Built for the people who get things done.</h2>
              <p style={{ color: '#6C7A96', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
                Most platforms optimise for volume. We optimise for fit — the right person, the right brief, the right result.
              </p>
              <button onClick={() => navigate('/client/browse-gigs')}
                style={{ background: '#D4A853', border: 'none', borderRadius: 8, padding: '14px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#0F1523', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Start hiring <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {trustPoints.map(({ icon: Icon, title, body }, i) => (
                <div key={i} style={{ background: '#1A2740', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(212,168,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={18} style={{ color: '#D4A853' }} />
                  </div>
                  <h4 style={{ color: '#F7F5F1', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{title}</h4>
                  <p style={{ color: '#6C7A96', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section style={{ background: '#F7F5F1', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 8 }}>Client stories</p>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, color: '#0F1523', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 48 }}>Results people actually talk about.</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E2E0DB', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 200 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={14} style={{ color: '#D4A853', fill: '#D4A853' }} />)}
                </div>
                <p style={{ color: '#3A3530', fontSize: 15, lineHeight: 1.7, marginBottom: 28, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F7F5F1', fontSize: 13, fontWeight: 700 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1523' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#9B9587' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section style={{ background: '#1A2740', padding: '80px 32px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4A853', marginBottom: 16 }}>Get started today</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#F7F5F1', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Your next hire is already on CodeHire.
          </h2>
          <p style={{ color: '#6C7A96', fontSize: 17, marginBottom: 40, lineHeight: 1.6 }}>
            Browse thousands of verified specialists and post your first project in under two minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/client/browse-gigs')}
              style={{ background: '#D4A853', border: 'none', borderRadius: 8, padding: '15px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#0F1523' }}>
              Browse Services
            </button>
            <button onClick={() => navigate('/freelancer/dashboard')}
              style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '15px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', color: '#F7F5F1' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4A853'; e.currentTarget.style.color = '#D4A853'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#F7F5F1'; }}>
              Sell your skills
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;