import { useEffect, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Monitor,
  Gauge,
  Wind,
  ThermometerSnowflake,
  Menu,
  X,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  User,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  FileCheck,
  Truck,
  HeadphonesIcon,
} from 'lucide-react'
import rwaveLogo from './assets/RwaveLogo.svg'
import rwaveText from './assets/Rwave-Text.png'
import heroBg from './assets/Hero-BG.jpeg'
import ecg12ch from "./assets/products/ecg-12ch.jpg"
import ecg3ch from "./assets/products/ecg-3ch.jpg"
import ecgStress from "./assets/products/ecg-stress.jpg"
import ecgHolter from "./assets/products/ecg-holter.jpg"
import monIcu15 from "./assets/products/mon-icu15.jpg"
import monBed12 from "./assets/products/mon-bed12.jpg"
import monTransport from "./assets/products/mon-transport.jpg"
import monCns from "./assets/products/mon-cns.jpg"
import bpDesk from "./assets/products/bp-desk.jpg"
import bpAbpm from "./assets/products/bp-abpm.jpg"
import bpStand from "./assets/products/bp-stand.jpg"
import dvtDual from "./assets/products/dvt-dual.jpg"
import dvtPort from "./assets/products/dvt-port.jpg"
import dvtSleeve from "./assets/products/dvt-sleeve.jpg"
import fwBlood from "./assets/products/fw-blood.jpg"
import fwRapid from "./assets/products/fw-rapid.jpg"
import fwPort from "./assets/products/fw-port.jpg"
import aboutCardioTech from './assets/about-cardio-tech.jpg'
import aboutDistribution from './assets/about-distribution.jpg'

import servicesBg from './assets/Service.jpeg'
import './App.css'
import AdminPortal from './components/AdminPortal'
import ProductsPage from './components/ProductsPage'

function App() {
  const sliderRef = useRef(null)
  // Route state for /admin portal
  const [isAdminRoute, setIsAdminRoute] = useState(
    () => window.location.pathname === "/admin" || window.location.hash === "#admin"
  );
  const [isProductsPageRoute, setIsProductsPageRoute] = useState(
    () => window.location.pathname === "/products" || window.location.hash === "#all-products"
  );

  // Products from API state
  const [apiProducts, setApiProducts] = useState([]);

  // Listen for navigation and secret shortcut (Ctrl + Shift + A)
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname === "/admin" || window.location.hash === "#admin");
      setIsProductsPageRoute(window.location.pathname === "/products" || window.location.hash === "#all-products");
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        window.history.pushState({}, "", "/admin");
        setIsAdminRoute(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fetch products from GET /api/products
  const fetchProductsFromApi = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setApiProducts(data.data);
      }
    } catch (err) {
      console.warn("API products unavailable, falling back to local dataset:", err.message);
    }
  };

  useEffect(() => {
    fetchProductsFromApi();
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsMenuOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    // If on admin portal or products page, skip observing landing page elements
    if (isAdminRoute || isProductsPageRoute) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    // Give DOM a micro-tick to render then observe all reveal-on-scroll elements
    const timer = setTimeout(() => {
      const revealElements = document.querySelectorAll('.reveal-on-scroll')
      revealElements.forEach((el) => {
        // If element is already in viewport, make it visible immediately
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible')
        } else {
          observer.observe(el)
        }
      })
    }, 50)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [isAdminRoute, isProductsPageRoute, apiProducts])
  const [quoteForm, setQuoteForm] = useState({
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    category: 'General Inquiry',
    message: '',
  })
  const [formFeedback, setFormFeedback] = useState({ error: '', success: '' })

  const handleQuoteChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      let digits = value.replace(/\D/g, '')
      if (digits.length > 10 && digits.startsWith('91')) {
        digits = digits.slice(2)
      } else if (digits.length > 10 && digits.startsWith('0')) {
        digits = digits.slice(1)
      }
      setQuoteForm((prev) => ({ ...prev, phone: digits.slice(0, 10) }))
    } else {
      setQuoteForm((prev) => ({ ...prev, [name]: value }))
    }
    if (formFeedback.error || formFeedback.success) {
      setFormFeedback({ error: '', success: '' })
    }
  }

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId)
    if (!el) return

    const startY = window.pageYOffset
    const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - 80)
    const distance = targetY - startY
    const duration = 600 // smooth 600ms cinematic duration
    let startTime = null

    // Easing: Quartic ease-out for ultra smooth deceleration
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      const easeProgress = easeOutQuart(progress)

      window.scrollTo(0, startY + distance * easeProgress)

      if (timeElapsed < duration) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }

  const scrollToQuote = () => {
    scrollToSection('quote')
  }

  const handleQuoteSubmit = (channel) => {
    const fullName = quoteForm.fullName.trim()
    const email = quoteForm.email.trim()
    const phone = quoteForm.phone.trim()

    if (!fullName) {
      setFormFeedback({
        error: 'Please enter your Full Name before submitting.',
        success: '',
      })
      return
    }

    if (!email) {
      setFormFeedback({
        error: 'Please enter your Email Address before submitting.',
        success: '',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(email)) {
      setFormFeedback({
        error: 'Please enter a valid email address (e.g. doctor@hospital.com).',
        success: '',
      })
      return
    }

    if (!phone) {
      setFormFeedback({
        error: 'Please enter your Phone / WhatsApp number before submitting.',
        success: '',
      })
      return
    }

    const phoneDigits = phone.replace(/\D/g, '')

    if (phoneDigits.length !== 10) {
      setFormFeedback({
        error: 'Phone number must be exactly 10 digits long.',
        success: '',
      })
      return
    }

    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      setFormFeedback({
        error: 'Please enter a valid mobile number',
        success: '',
      })
      return
    }

    if (/^(\d)\1{9}$/.test(phoneDigits)) {
      setFormFeedback({
        error: 'Please enter a valid 10-digit phone number without repeated digits.',
        success: '',
      })
      return
    }

    const messageLines = [
      'Hello Rwave Cardio Team, I would like to request a custom quote:',
      `• Name: ${fullName}`,
      quoteForm.organization.trim() ? `• Organization / Hospital: ${quoteForm.organization.trim()}` : null,
      `• Email: ${email}`,
      `• Phone / WhatsApp: ${phone}`,
      `• Product / Requirement: ${quoteForm.category}`,
      quoteForm.message.trim() ? `• Notes: ${quoteForm.message.trim()}` : null,
    ].filter(Boolean).join('\n')

    if (channel === 'whatsapp') {
      const waNumber = '919136015674' // Official WhatsApp number: +91 91 360 156 74
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageLines)}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      setFormFeedback({
        error: '',
        success: 'Opening WhatsApp (+91 91 360 156 74) with your quote request...',
      })
    } else {
      const emailRecipient = 'contact@rwavecardio.com' // Replace with official company email
      const subject = `Quote Request: ${quoteForm.category} - ${fullName}`
      const mailtoUrl = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageLines)}`
      window.location.href = mailtoUrl
      setFormFeedback({
        error: '',
        success: 'Opening your email client with your quote request...',
      })
    }
  }

  const productCategories = [
    {
      id: 'ecg',
      name: 'ECG Machines',
      icon: HeartPulse,
      tag: 'Diagnostics',
      subtitle: 'Multi-Channel Diagnostic Electrocardiographs',
      products: [
        {
          id: 'ecg-12ch',
          image: ecg12ch,
          name: 'CardioWave 12-Channel ECG',
          tag: 'Hospital Grade',
          specs: '10.4" Color Touchscreen • Automatic Lead Interpretation • USB / DICOM',
          badge: 'MD-42 Certified',
        },
        {
          id: 'ecg-3ch',
          image: ecg3ch,
          name: 'CardioCompact 3-Channel ECG',
          tag: 'Portable / Clinic',
          specs: 'Lightweight Design • High-Resolution Thermal Print • Built-in Battery',
          badge: 'MD-42 Certified',
        },
        {
          id: 'ecg-stress',
          image: ecgStress,
          name: 'CardioStress Treadmill System',
          tag: 'Stress Test',
          specs: 'Wireless Transmitter Box • Real-Time ST Segment Analysis • Heavy-Duty',
          badge: 'MD-42 Certified',
        },
        {
          id: 'ecg-holter',
          image: ecgHolter,
          name: 'CardioTrac 24-Hour Holter Recorder',
          tag: 'Ambulatory',
          specs: 'Ultra-Compact 3/12 Lead • 72h Continuous Recording • AI Analysis Suite',
          badge: 'MD-42 Certified',
        },
      ],
    },
    {
      id: 'monitors',
      name: 'Patient Monitors',
      icon: Monitor,
      tag: 'Critical Care',
      subtitle: 'ICU, OT & Bedside Multi-Parameter Monitors',
      products: [
        {
          id: 'mon-icu15',
          image: monIcu15,
          name: 'ApexCare ICU Monitor 15"',
          tag: 'ICU / OT',
          specs: 'ECG, SpO2, NIBP, 2-IBP, Resp, Temp, EtCO2 Ready • Central Station Sync',
          badge: 'MD-42 Certified',
        },
        {
          id: 'mon-bed12',
          image: monBed12,
          name: 'VitalEdge Bedside Monitor 12"',
          tag: 'In-Patient Ward',
          specs: '6-Standard Parameters • 120h Trend Data Review • Anti-Glare Display',
          badge: 'MD-42 Certified',
        },
        {
          id: 'mon-transport',
          image: monTransport,
          name: 'MobiSense Transport Monitor',
          tag: 'Ambulance & ER',
          specs: 'Rugged Shock-Proof Housing • 6h Li-ion Battery • Wireless Syncing',
          badge: 'MD-42 Certified',
        },
        {
          id: 'mon-cns',
          image: monCns,
          name: 'ApexCentral Monitoring Station',
          tag: 'Telemetry',
          specs: 'Up to 64 Bed Central Display • Dual Screen Support • Real-Time Alarm Relay',
          badge: 'MD-42 Certified',
        },
      ],
    },
    {
      id: 'bp',
      name: 'BP Monitors',
      icon: Gauge,
      tag: 'Diagnostics',
      subtitle: 'Clinical & Ambulatory Sphygmomanometers',
      products: [
        {
          id: 'bp-desk',
          image: bpDesk,
          name: 'ProCheck Clinical Digital BP',
          tag: 'OPD / Clinic',
          specs: 'Oscillometric & Auscultatory Modes • Dual Cuff Sizes • Shock Resistant',
          badge: 'MD-42 Certified',
        },
        {
          id: 'bp-abpm',
          image: bpAbpm,
          name: 'OmniBP 24h Ambulatory Monitor',
          tag: 'Cardiology',
          specs: 'Silent Motor Pump • Circadian Rhythm Analysis • PC Software Export',
          badge: 'MD-42 Certified',
        },
        {
          id: 'bp-stand',
          image: bpStand,
          name: 'StandPro Mobile Clinic BP Monitor',
          tag: 'Hospital Ward',
          specs: 'Heavy-Duty Rolling Base • Large Backlit LED • Battery & Mains Powered',
          badge: 'MD-42 Certified',
        },
      ],
    },
    {
      id: 'dvt',
      name: 'DVT Pumps',
      icon: Wind,
      tag: 'Post-Op Recovery',
      subtitle: 'Intermittent Pneumatic Compression Systems',
      products: [
        {
          id: 'dvt-dual',
          image: dvtDual,
          name: 'FlowGuard Dual-Chamber DVT Pump',
          tag: 'Surgical ICU',
          specs: 'Sequential Gradient Compression • Calf & Thigh Sleeve Support • Whisper Quiet',
          badge: 'MD-42 Certified',
        },
        {
          id: 'dvt-port',
          image: dvtPort,
          name: 'VenoFlow Portable Compression Unit',
          tag: 'Recovery Ward',
          specs: 'Integrated Tubing • Visual Pressure Gauge • 8h Continuous Battery Life',
          badge: 'MD-42 Certified',
        },
        {
          id: 'dvt-sleeve',
          image: dvtSleeve,
          name: 'BioPress Pro Multi-Mode IPC System',
          tag: 'Orthopedic OT',
          specs: 'Foot, Calf, Thigh Presets • Automatic Sleeve Recognition • Smart Alarms',
          badge: 'MD-42 Certified',
        },
      ],
    },
    {
      id: 'warmers',
      name: 'Fluid Warmers',
      icon: ThermometerSnowflake,
      tag: 'Temperature Mgmt',
      subtitle: 'Inline Infusion & Blood Warming Systems',
      products: [
        {
          id: 'fw-blood',
          image: fwBlood,
          name: 'ThermaFlow Blood & Infusion Warmer',
          tag: 'OT & Trauma',
          specs: 'Dry-Heat Plate Technology • Fast 2-Min Warmup • 39°C Precise Safety Cutoff',
          badge: 'MD-42 Certified',
        },
        {
          id: 'fw-rapid',
          image: fwRapid,
          name: 'RapidWarm High-Flow Infusion Warmer',
          tag: 'Emergency & OT',
          specs: 'High Flow Rate (Up to 30,000 ml/h) • Dual Sensor Redundancy • Bubble Detector',
          badge: 'MD-42 Certified',
        },
        {
          id: 'fw-port',
          image: fwPort,
          name: 'TempGrip Compact IV Line Warmer',
          tag: 'ICU / Recovery',
          specs: 'Direct Tubing Snap-in • Digital Temperature Readout • Lightweight Pole Mount',
          badge: 'MD-42 Certified',
        },
      ],
    },
  ]


  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  const handleMobileNav = (sectionId) => {
    setIsMenuOpen(false)
    setTimeout(() => {
      scrollToSection(sectionId)
    }, 60)
  }

  const handleMobileCatalog = () => {
    setIsMenuOpen(false)
    window.history.pushState({}, "", "/products")
    setIsProductsPageRoute(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isAdminRoute) {
    return (
      <AdminPortal
        onBackToSite={() => {
          window.history.pushState({}, "", "/");
          setIsAdminRoute(false);
        }}
      />
    );
  }

  if (isProductsPageRoute) {
    // Combine all catalog products across categories
    const allCatalogProducts = apiProducts.length > 0
      ? apiProducts
      : productCategories.flatMap((c) => c.products.map(p => ({ ...p, category: c.name })));

    return (
      <ProductsPage
        products={allCatalogProducts}
        onBackToHome={() => {
          window.history.pushState({}, "", "/");
          setIsProductsPageRoute(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onInquireProduct={(product) => {
          if (product && product.category) {
            setQuoteForm((prev) => ({
              ...prev,
              category: product.category,
            }));
          }
          window.history.pushState({}, "", "/");
          setIsProductsPageRoute(false);
          setTimeout(() => {
            scrollToQuote();
          }, 100);
        }}
      />
    );
  }

  return (
    <div className="landing-page">
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className="header">
        <div className={`header-inner ${isScrolled ? 'scrolled' : ''}`}>
          <div className="logo-wrap">
            <img src={rwaveLogo} alt="Rwave Logo" className="logo-img" />
            <img src={rwaveText} alt="Rwave Cardio Products NX" className="logo-text-img" />
          </div>

          {/* All nav elements: glass capsule, far right */}
          <div className="nav-capsule">
            {/* Desktop: links + CTA inside capsule */}
            <nav className="capsule-links">
              <a
                href="#products"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('products')
                }}
              >
                Products
              </a>
              <a
                href="#services"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('services')
                }}
              >
                Services
              </a>
              <a
                href="#about"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('about')
                }}
              >
                About
              </a>
            </nav>
            <div className="capsule-divider" />
            <button type="button" className="btn-cta" onClick={scrollToQuote}>Request Quote</button>

            {/* Narrow: rounded glass square hamburger toggle */}
            <button
              type="button"
              className={`hamburger ${isMenuOpen ? 'is-active' : ''}`}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE ROUNDED GLASS SQUARE MENU ─── */}
      <div
        className={`mobile-menu-backdrop ${isMenuOpen ? 'is-open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        className={`mobile-glass-card ${isMenuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="mobile-menu-header">
          <div className="mobile-menu-brand">
            <img src={rwaveLogo} alt="R Wave Logo" className="mobile-menu-logo" />
            <span className="mobile-menu-brand-text">Quick Navigation</span>
          </div>
          <button
            type="button"
            className="mobile-menu-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          
          <button
            type="button"
            className="mobile-menu-item"
            onClick={handleMobileCatalog}
          >
            <span>Product Catalog</span>
          </button>

          <button
            type="button"
            className="mobile-menu-item"
            onClick={() => handleMobileNav('services')}
          >
            <span>Services</span>
          </button>

          <button
            type="button"
            className="mobile-menu-item"
            onClick={() => handleMobileNav('about')}
          >
            <span>About</span>
          </button>
        </nav>

        <button
          type="button"
          className="mobile-menu-cta-btn"
          onClick={() => handleMobileNav('quote')}
        >
          <span>Request Custom Quote</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section id="hero" className="hero">
        <div className="hero-bg-wrapper" aria-hidden="true">
          <img src={heroBg} alt="" className="hero-bg-img" />
          <div className="hero-bg-overlay" />
        </div>
        <div className="hero-content">
          <h1 className="hero-headline reveal-on-scroll">
            Empowering India's healthcare
          </h1>
          <p className="hero-sub reveal-on-scroll reveal-delay-1">
            Your trusted wholesale partner for diagnostic and ICU equipment. Delivering
            MD&#8209;42 certified reliability to private clinics and hospital networks pan-India.
          </p>
          <div className="hero-btns reveal-on-scroll reveal-delay-2">
            <a
              href="#products"
              className="btn-hero-primary"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('products')
              }}
            >
              <span>View Catalog</span>
              <ArrowUpRight size={16} />
            </a>
            <button type="button" className="btn-hero-outline" onClick={scrollToQuote}>
              Request Quote
            </button>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT CATEGORIES ─────────────────────────────────── */}
      <section id="products" className="products-section">
        <div className="section-top reveal-on-scroll">
          <div>
            <h2 className="section-title">Featured Medical Equipment</h2>
            <p className="section-subtitle">A curated preview of our flagship diagnostic and ICU monitoring systems.</p>
          </div>
          <div className="featured-header-actions">
            <button
              type="button"
              className="btn-view-all-header"
              onClick={() => {
                window.history.pushState({}, "", "/products");
                setIsProductsPageRoute(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span>View All Medical Equipment</span>
              <ArrowUpRight size={16} />
            </button>
            <div className="slider-arrows">
              <button
                type="button"
                className="arrow-btn"
                onClick={() => scrollSlider('left')}
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="arrow-btn"
                onClick={() => scrollSlider('right')}
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Horizontal Product Slider (Placeholders for Selected Category) ── */}
        <div
          className="slider reveal-on-scroll reveal-delay-1"
          ref={sliderRef}
        >
          {(() => {
            // Selected 5 premier representative devices across clinical categories
            const defaultFeaturedList = [
              {
                id: "ecg-12ch",
                image: ecg12ch,
                name: "CardioWave 12-Channel ECG",
                category: "ECG Machines",
                specs: "10.4\" Color Touchscreen • Automatic Interpretation",
                badge: "MD-42 Certified",
                tag: "Hospital Grade",
              },
              {
                id: "mon-icu15",
                image: monIcu15,
                name: "ApexCare ICU Monitor 15\"",
                category: "Patient Monitors",
                specs: "Dual-IBP, EtCO2 Ready • Central Station Sync",
                badge: "MD-42 Certified",
                tag: "ICU / OT",
              },
              {
                id: "bp-desk",
                image: bpDesk,
                name: "ProCheck Clinical Digital BP",
                category: "BP Monitors",
                specs: "Oscillometric & Auscultatory • Dual Cuffs",
                badge: "MD-42 Certified",
                tag: "OPD / Clinic",
              },
              {
                id: "dvt-dual",
                image: dvtDual,
                name: "FlowGuard Dual-Chamber DVT Pump",
                category: "DVT Pumps",
                specs: "Sequential Gradient Compression • Whisper Quiet",
                badge: "MD-42 Certified",
                tag: "Surgical ICU",
              },
              {
                id: "fw-blood",
                image: fwBlood,
                name: "ThermaFlow Blood & Infusion Warmer",
                category: "Fluid Warmers",
                specs: "Dry-Heat Plate Tech • 39°C Precise Safety Cutoff",
                badge: "MD-42 Certified",
                tag: "OT & Trauma",
              },
            ];

            // If API products are loaded, pick up to 5 items (one from each category when available)
            let itemsToRender = defaultFeaturedList;
            if (apiProducts.length > 0) {
              const picked = [];
              const categories = ["ECG Machines", "Patient Monitors", "BP Monitors", "DVT Pumps", "Fluid Warmers"];
              categories.forEach((cat) => {
                const found = apiProducts.find((p) => p.category === cat);
                if (found) {
                  picked.push({
                    id: found._id || found.id,
                    image: found.imageUrl,
                    name: found.name,
                    category: found.category,
                    specs: Array.isArray(found.specs) ? found.specs.slice(0, 2).join(" • ") : found.specs,
                    badge: found.inStock ? "MD-42 Certified" : "Direct Order",
                    tag: found.category,
                  });
                }
              });
              if (picked.length > 0) {
                itemsToRender = picked.slice(0, 5);
              }
            }

            return itemsToRender.map((product) => {
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="placeholder-badge">{product.badge}</div>
                    <span className="placeholder-tag">{product.category}</span>
                  </div>

                  <div className="product-info">
                    <span className="product-category-label">{product.category}</span>
                    <h3 className="card-title">{product.name}</h3>
                    <p className="card-desc">{product.specs}</p>
                  </div>

                  <div className="card-action-row">
                    <button
                      type="button"
                      className="btn-product-inquire"
                      onClick={() => {
                        setQuoteForm((prev) => ({
                          ...prev,
                          category: product.category || "General Inquiry",
                        }));
                        scrollToQuote();
                      }}
                    >
                      <span>Inquire Now</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* ─── SERVICES SECTION (After-Sales Support & Maintenance) ─── */}
      <section id="services" className="services-section">
        <div className="services-bg-wrapper" aria-hidden="true">
          <img src={servicesBg} alt="" className="services-bg-img"/>
          <div className="services-bg-overlay" />
        </div>

        <div className="services-container">
          {/* Left Glass Box */}
          <div className="services-glass-card reveal-on-scroll">
            <h2 className="services-heading">
              Comprehensive After-Sales Support & Maintenance
            </h2>

            <p className="services-body-text">
              Medical equipment requires zero downtime. We protect your investment and ensure
              patient safety with dedicated technical support, standard manufacturer warranties,
              and fast repair turnarounds.
            </p>

            <ul className="services-bullet-list">
              <li>
                <CheckCircle2 size={16} strokeWidth={2} className="bullet-icon" />
                <span>Customizable Annual Maintenance Contracts (AMC)</span>
              </li>
              <li>
                <CheckCircle2 size={16} strokeWidth={2} className="bullet-icon" />
                <span>Comprehensive Maintenance Contracts (CMC) for high-value ICU equipment</span>
              </li>
              <li>
                <CheckCircle2 size={16} strokeWidth={2} className="bullet-icon" />
                <span>Priority support for defective or transit-damaged deliveries</span>
              </li>
            </ul>

            <div className="services-btn-row">
              <button type="button" className="btn-services-cta" onClick={scrollToQuote}>
                <span>View Maintenance Options / Contact Support</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REQUEST QUOTE SECTION ───────────────────────────────── */}
      <section id="quote" className="quote-section">
        <div className="quote-bg-glow" aria-hidden="true" />

        <div className="quote-container">
          <div className="quote-card reveal-on-scroll">
            <h2 className="quote-headline">Get a Custom Quote Today</h2>

            <p className="quote-subtext">
              Connect with our team to find the right diagnostic and monitoring solutions for your exact requirements.
            </p>

            <form className="quote-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="quote-fullname" className="form-label">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      id="quote-fullname"
                      type="text"
                      name="fullName"
                      placeholder="Dr. Rajesh Sharma"
                      value={quoteForm.fullName}
                      onChange={handleQuoteChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Organization / Hospital Name */}
                <div className="form-group">
                  <label htmlFor="quote-organization" className="form-label">
                    Organization / Hospital Name
                  </label>
                  <div className="input-wrapper">
                    <Building2 size={16} className="input-icon" />
                    <input
                      id="quote-organization"
                      type="text"
                      name="organization"
                      placeholder="City Care Multispeciality Hospital"
                      value={quoteForm.organization}
                      onChange={handleQuoteChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label htmlFor="quote-email" className="form-label">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="quote-email"
                      type="email"
                      name="email"
                      placeholder="dr.rajesh@hospital.org"
                      value={quoteForm.email}
                      onChange={handleQuoteChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div className="form-group">
                  <label htmlFor="quote-phone" className="form-label">
                    Phone / WhatsApp Number (10 Digits) <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      id="quote-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={14}
                      name="phone"
                      placeholder="9136015674"
                      value={quoteForm.phone}
                      onChange={handleQuoteChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Equipment / Category */}
                <div className="form-group full-width">
                  <label htmlFor="quote-category" className="form-label">
                    Equipment / Product Category
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="quote-category"
                      name="category"
                      value={quoteForm.category}
                      onChange={handleQuoteChange}
                      className="form-input form-select"
                    >
                      <option value="General Inquiry">General / All Medical Equipment</option>
                      <option value="ECG Machines">ECG Machines (3-Lead, 6-Lead, 12-Lead, Holter, Stress Test)</option>
                      <option value="Patient Monitors">Patient Monitors (ICU, Modular, Multipara, Bedside)</option>
                      <option value="BP Monitors">BP Monitors (Clinical Digital, NIBP Sphygmomanometers)</option>
                      <option value="DVT Pumps">DVT Pumps & Compression Sleeves</option>
                      <option value="Fluid Warmers">Blood & Infusion Fluid Warmers</option>
                      <option value="AMC / CMC Support">After-Sales Support (AMC / CMC Service Contracts)</option>
                      <option value="Multiple Products / Bulk Hospital Setup">Multiple Products / Complete Hospital Setup</option>
                    </select>
                  </div>
                </div>

                {/* Message / Requirement Details */}
                <div className="form-group full-width">
                  <label htmlFor="quote-message" className="form-label">
                    Message / Specific Model Requirements
                  </label>
                  <textarea
                    id="quote-message"
                    name="message"
                    rows="3"
                    placeholder="Specify required quantities, target delivery timelines, or hospital requirements..."
                    value={quoteForm.message}
                    onChange={handleQuoteChange}
                    className="form-input form-textarea"
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {formFeedback.error && (
                <div className="quote-feedback error" role="alert">
                  {formFeedback.error}
                </div>
              )}
              {formFeedback.success && (
                <div className="quote-feedback success" role="status">
                  {formFeedback.success}
                </div>
              )}

              {/* Action Buttons: WhatsApp & Email */}
              <div className="quote-actions">
                <button
                  type="button"
                  onClick={() => handleQuoteSubmit('whatsapp')}
                  className="btn-quote-action btn-quote-whatsapp"
                >
                  <MessageSquare size={18} />
                  <span>Get in Touch via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuoteSubmit('email')}
                  className="btn-quote-action btn-quote-email"
                >
                  <Mail size={18} />
                  <span>Get in Touch via Email</span>
                </button>
              </div>

              <div className="quote-guarantee">
                <ShieldCheck size={15} />
                <span>Zero spam guarantee. Dedicated technical specialists respond within 2-4 business hours.</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ─── ABOUT US SECTION ───────────────────────────────────── */}
      <section id="about" className="about-section">
        <div className="about-container">
          {/* Section Header */}
          <div className="about-header reveal-on-scroll">
            <h2 className="about-main-title">A Decade of Excellence in Medical Equipment</h2>
            <p className="about-main-subtitle">
              Bridging critical healthcare needs with authorized, precision-engineered medical diagnostic technologies pan-India.
            </p>
          </div>

          {/* Story Block 1: Introduction (The "Who We Are" statement) */}
          <div className="about-story-row about-story-reverse reveal-on-scroll">
            <div className="about-story-content">
              <h3 className="story-heading">Advancing Healthcare with Precision &amp; Reliability</h3>
              <p className="story-body">
                Based in Thane, Maharashtra, R Wave Cardio Products NX has spent over a decade establishing itself as a premier wholesale importer and authorized distributor of critical care medical equipment. We are dedicated to bridging the gap between advanced diagnostic technology and the healthcare facilities that rely on it daily.
              </p>
              <div className="story-stat-pills">
                <div className="story-stat-card">
                  <span className="stat-number">10+</span>
                  <span className="stat-label">Years of Industry Trust</span>
                </div>
                <div className="story-stat-card">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Authorized Distribution</span>
                </div>
              </div>
            </div>
            <div className="about-story-visual">
              <img
                src='pexels-delhi-eye-centre-2150177981-31000573.jpg'
                alt="Advanced Cardiology and Critical Care Hospital Diagnostic Equipment"
                className="about-story-img"
                loading="lazy"
              />
            </div>
          </div>

          {/* Story Block 2: Our Core Mission */}
          <div className="about-story-row reveal-on-scroll">
            <div className="about-story-visual">
              <img
                src='360_F_189577923_ANoSMIVLctEun9cy9WUafBnJ2YJvds9e.jpg'
                alt="Pan-India Medical Equipment Distribution and Quality Inspection Facility"
                className="about-story-img"
                loading="lazy"
              />
            </div>
            <div className="about-story-content">
              <h3 className="story-heading">Equipping India’s Medical Infrastructure</h3>
              <p className="story-body">
                Our mission is to equip hospitals, private clinics, diagnostic centers, and regional sub-dealers pan-India with certified, high-performance medical devices. We understand that reliable equipment—from diagnostic ECG machines to multi-parameter patient monitors—is the foundation of effective patient care and accurate clinical decision-making.
              </p>
              <ul className="story-feature-list">
                <li>
                  <CheckCircle2 size={16} className="feature-check" />
                  <span>Serving private clinics, tertiary hospitals &amp; regional dealers</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="feature-check" />
                  <span>Comprehensive diagnostics ranging from ECG to ICU patient monitors</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Story Block 3: The Trust & Compliance Factors */}
          <div className="about-trust-container reveal-on-scroll">
            <div className="trust-header-wrap">
              <h3 className="story-heading">Why Healthcare Providers Partner With Us</h3>
            </div>

            <div className="trust-cards-grid">
              {/* Bullet 1 */}
              <div className="trust-card">
                <div className="trust-icon-box">
                  <FileCheck size={26} strokeWidth={1.8} />
                </div>
                <div className="trust-card-body">
                  <h4 className="trust-card-title">Certified Compliance</h4>
                  <p className="trust-card-text">
                    We operate with complete regulatory transparency, holding valid GST, Udyam, and CDSCO MD-42 medical device licenses to guarantee equipment authenticity.
                  </p>
                </div>
                <div className="trust-tag">CDSCO MD-42 Licensed</div>
              </div>

              {/* Bullet 2 */}
              <div className="trust-card">
                <div className="trust-icon-box">
                  <Truck size={26} strokeWidth={1.8} />
                </div>
                <div className="trust-card-body">
                  <h4 className="trust-card-title">Direct Wholesale Value</h4>
                  <p className="trust-card-text">
                    As an authorized distributor and direct importer, we streamline the supply chain to provide premium diagnostic tools without the inflated costs of multiple middlemen.
                  </p>
                </div>
                <div className="trust-tag">Direct Importer Rates</div>
              </div>

              {/* Bullet 3 */}
              <div className="trust-card">
                <div className="trust-icon-box">
                  <HeadphonesIcon size={26} strokeWidth={1.8} />
                </div>
                <div className="trust-card-body">
                  <h4 className="trust-card-title">Unwavering Post-Sale Support</h4>
                  <p className="trust-card-text">
                    We do not just supply equipment; we sustain it. Our dedicated After-Sales Service and customizable AMC/CMC contracts ensure your facility experiences zero operational downtime.
                  </p>
                </div>
                <div className="trust-tag">AMC / CMC Backed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <img src={rwaveLogo} alt="R Wave Cardio Products NX" className="footer-logo" />
          <address className="footer-address">
            <span className="footer-label">Registered Address</span>
            Shop no. 02, C wing, Ashar Estate, Shreenagar, Wagle Estate,
            near Finland International School, Ashram road, Thane (w) – 400 604.
            <div className="footer-contact">
              <span>Direct Helpline & WhatsApp: </span>
              <a href="https://wa.me/919136015674" target="_blank" rel="noopener noreferrer" className="footer-phone-link">
                +91 91 360 156 74
              </a>
            </div>
          </address>
          <p className="footer-copy">© 2025 All rights reserved. Rwave Cardio Products NX.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
