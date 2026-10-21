import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  HeartPulse,
  Monitor,
  Gauge,
  Wind,
  ThermometerSnowflake,
  Layers,
} from 'lucide-react';
import rwaveLogo from '../assets/RwaveLogo.svg';
import rwaveText from '../assets/Rwave-Text.png';
import './ProductsPage.css';

const CATEGORY_TABS = [
  { id: 'all', name: 'All Products', icon: Layers },
  { id: 'ecg', name: 'ECG Machines', icon: HeartPulse },
  { id: 'monitors', name: 'Patient Monitors', icon: Monitor },
  { id: 'bp', name: 'BP Monitors', icon: Gauge },
  { id: 'dvt', name: 'DVT Pumps', icon: Wind },
  { id: 'warmers', name: 'Fluid Warmers', icon: ThermometerSnowflake },
];

export default function ProductsPage({ products, onBackToHome, onInquireProduct }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products by selected category and search input
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        selectedCategory === 'all' ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'ecg' && p.category === 'ECG Machines') ||
        (selectedCategory === 'monitors' && p.category === 'Patient Monitors') ||
        (selectedCategory === 'bp' && p.category === 'BP Monitors') ||
        (selectedCategory === 'dvt' && p.category === 'DVT Pumps') ||
        (selectedCategory === 'warmers' && p.category === 'Fluid Warmers');

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.specs && (Array.isArray(p.specs) ? p.specs.join(' ') : p.specs).toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="catalog-page">
      {/* ── Top Sticky Header ── */}
      <header className="catalog-nav-header">
        <div className="catalog-nav-inner">
          <button type="button" onClick={onBackToHome} className="catalog-logo-wrap" aria-label="Go to Home">
            <img src={rwaveLogo} alt="Rwave Logo" className="catalog-logo-img" />
            <img src={rwaveText} alt="Rwave Cardio Products NX" className="catalog-logo-text-img" />
          </button>

          <div className="catalog-nav-actions">
            <button type="button" onClick={onBackToHome} className="catalog-back-btn">
              <ArrowLeft size={16} />
              <span>Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <h1 className="catalog-title">Product catalogue</h1>
          <p className="catalog-subtitle">
            Browse our complete portfolio of critical care electrocardiographs, ICU patient telemetry monitors, digital sphygmomanometers, sequential DVT pumps, and blood/fluid warming systems.
          </p>
        </div>
      </section>

      {/* ── Filter & Search Toolbar ── */}
      <div className="catalog-toolbar-wrap">
        <div className="catalog-toolbar">
          <div className="catalog-search-box">
            <Search size={18} className="catalog-search-icon" />
            <input
              type="text"
              placeholder="Search by equipment model, specifications, or clinical features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalog-search-input"
            />
          </div>

          <div className="catalog-category-pills">
            {CATEGORY_TABS.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`catalog-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <Icon size={14} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <section className="catalog-grid-section">
        {filteredProducts.length === 0 ? (
          <div className="catalog-empty-state">
            <h3 className="catalog-empty-title">No products found</h3>
            <p className="catalog-empty-desc">
              We couldn't find any equipment matching &ldquo;{searchQuery}&rdquo;. Try clearing your search or switching category filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="catalog-pill-btn active"
              style={{ marginTop: '0.5rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredProducts.map((product) => {
              const specDisplay = Array.isArray(product.specs)
                ? product.specs.join(' • ')
                : product.specs || product.description;

              return (
                <div key={product.id || product._id} className="product-card" style={{ flex: 'none', width: '100%' }}>
                  <div className="product-image-container">
                    <img
                      src={product.image || product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="placeholder-badge">{product.badge || 'MD-42 Certified'}</div>
                    <span className="placeholder-tag">{product.category || product.tag}</span>
                  </div>

                  <div className="product-info">
                    <span className="product-category-label">{product.category}</span>
                    <h3 className="card-title">{product.name}</h3>
                    <p className="card-desc">{specDisplay}</p>
                  </div>

                  <div className="card-action-row">
                    <button
                      type="button"
                      className="btn-product-inquire"
                      onClick={() => onInquireProduct(product)}
                    >
                      <span>Inquire Now</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

