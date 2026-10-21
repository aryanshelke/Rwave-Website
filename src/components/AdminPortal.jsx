import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ShieldAlert,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import rwaveLogo from '../assets/RwaveLogo.svg';
import './AdminPortal.css';

const CATEGORIES = [
  'ECG Machines',
  'Patient Monitors',
  'BP Monitors',
  'DVT Pumps',
  'Fluid Warmers',
];

export default function AdminPortal({ onBackToSite }) {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('rwave_admin_token') || '');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'ECG Machines',
    description: '',
    specs: '',
    imageUrl: '',
    inStock: true,
    displayOrder: 0,
  });
  const [imageMode, setImageMode] = useState('url'); // 'url' or 'file'
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products if authenticated
  const fetchProducts = async () => {
    setIsLoading(true);
    setDashboardError('');
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setDashboardError(data.message || 'Failed to load products');
      }
    } catch (err) { console.error(err);
      setDashboardError('Could not reach backend API server. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('rwave_admin_token', data.token);
        setToken(data.token);
      } else {
        setAuthError(data.message || 'Invalid credentials');
      }
    } catch (err) { console.error(err);
      setAuthError('Connection to backend failed. Please ensure the backend server is running on port 5001 (npm run dev:all).');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('rwave_admin_token');
    setToken('');
    setProducts([]);
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'ECG Machines',
      description: '',
      specs: '',
      imageUrl: '',
      inStock: true,
      displayOrder: products.length + 1,
    });
    setImageMode('url');
    setImageFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'ECG Machines',
      description: product.description || '',
      specs: Array.isArray(product.specs) ? product.specs.join(', ') : '',
      imageUrl: product.imageUrl || '',
      inStock: product.inStock !== false,
      displayOrder: product.displayOrder || 0,
    });
    setImageMode('url');
    setImageFile(null);
    setPreviewUrl(product.imageUrl || '');
    setIsModalOpen(true);
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit Add or Edit Form
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      let bodyData;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (imageMode === 'file' && imageFile) {
        bodyData = new FormData();
        bodyData.append('name', formData.name);
        bodyData.append('category', formData.category);
        bodyData.append('description', formData.description);
        bodyData.append('specs', formData.specs);
        bodyData.append('inStock', formData.inStock);
        bodyData.append('displayOrder', formData.displayOrder);
        bodyData.append('image', imageFile);
      } else {
        headers['Content-Type'] = 'application/json';
        bodyData = JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrl || previewUrl,
        });
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body: bodyData,
      });

      const result = await res.json();

      if (result.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const errorMsg = result.error ? `${result.message}\n(${result.error})` : (result.message || 'Operation failed.');
        alert(errorMsg);
      }
    } catch (err) {
      alert('Error saving product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${product.name}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
      } else {
        alert(result.message || 'Failed to delete product.');
      }
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  /* ──────────────────────────────────
     RENDER: LOGIN SCREEN
  ────────────────────────────────── */
  if (!token) {
    return (
      <div className="admin-portal-wrapper">
        <div className="admin-login-screen">
          <div className="admin-login-glow-orb" />
          <div className="admin-login-card">
            <div className="admin-login-header">
              <div className="admin-brand-pill">
                <ShieldAlert size={14} />
                <span>Authorized Staff Only</span>
              </div>
              <img src={rwaveLogo} alt="R Wave Logo" style={{ height: 32 }} />
              <h1 className="admin-login-title">Admin Portal</h1>
              <p className="admin-login-subtitle">
                Access R Wave Cardio Products NX inventory control and product catalogue management.
              </p>
            </div>

            {authError && (
              <div className="admin-alert-error">
                <ShieldAlert size={18} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="admin-form-group">
                <label className="admin-form-label">Admin Username</label>
                <div className="admin-input-wrapper">
                  <User size={16} className="admin-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Password</label>
                <div className="admin-input-wrapper">
                  <Lock size={16} className="admin-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="admin-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoggingIn} className="admin-btn-primary">
                {isLoggingIn ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>

            <div className="admin-login-footer">
              <button type="button" onClick={onBackToSite} className="admin-back-link">
                <ArrowLeft size={14} />
                <span>Return to Live Public Website</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────
     RENDER: DASHBOARD VIEW
  ────────────────────────────────── */
  return (
    <div className="admin-portal-wrapper">
      {/* Top Navigation Bar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <div className="admin-nav-logo-badge">
            <img src={rwaveLogo} alt="R Wave Logo" className="admin-nav-logo" />
            <h2 className="admin-nav-title">R Wave NX — Inventory Control</h2>
          </div>
          <span className="admin-count-pill">{products.length} Products in Database</span>
        </div>

        <div className="admin-nav-actions">
          <button type="button" onClick={onBackToSite} className="admin-btn-outline">
            <ArrowLeft size={16} />
            <span>Back to Live Website</span>
          </button>
          <button type="button" onClick={handleLogout} className="admin-btn-danger-outline">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Toolbar: Search, Category Filter, and Add Button */}
        <div className="admin-toolbar">
          <div className="admin-filter-group">
            <div className="admin-search-box">
              <Search size={16} className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search models, specs, or names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={handleOpenAddModal} className="admin-btn-add">
            <Plus size={18} />
            <span>Add New Equipment</span>
          </button>
        </div>

        {/* Dashboard Error Alert */}
        {dashboardError && (
          <div className="admin-alert-error">
            <ShieldAlert size={18} />
            <span>{dashboardError}</span>
          </div>
        )}

        {/* Product Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Model / Equipment Name</th>
                <th>Category</th>
                <th>Key Specifications / Badges</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    Loading product database...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No products found matching your current filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div className="admin-prod-thumb-wrap">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="admin-prod-thumb"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="admin-prod-info-cell">
                        <span className="admin-prod-name">{prod.name}</span>
                        <span className="admin-prod-desc-snippet">{prod.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-category-badge">{prod.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {Array.isArray(prod.specs) && prod.specs.length > 0
                          ? prod.specs.slice(0, 3).join(' • ')
                          : 'Standard Hospital Specifications'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-stock-badge ${
                          prod.inStock ? 'in-stock' : 'out-of-stock'
                        }`}
                      >
                        {prod.inStock ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          title="Edit Equipment"
                          onClick={() => handleOpenEditModal(prod)}
                          className="admin-btn-action-icon edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete Equipment"
                          onClick={() => handleDeleteProduct(prod)}
                          className="admin-btn-action-icon delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingProduct ? 'Edit Equipment Entry' : 'Add New Medical Equipment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="admin-modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="admin-modal-form-grid">
                {/* Product Name */}
                <div className="admin-form-group admin-col-span-2">
                  <label className="admin-form-label">Equipment / Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CardioWave 12-Channel ECG"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="admin-input"
                  />
                </div>

                {/* Category */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Order */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Display Order (Sorting)</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="admin-input"
                  />
                </div>

                {/* Description */}
                <div className="admin-form-group admin-col-span-2">
                  <label className="admin-form-label">Description / Summary *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide clinical summary, target department (ICU, OT, OPD), and key benefits..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="admin-textarea"
                  />
                </div>

                {/* Specs / Badges */}
                <div className="admin-form-group admin-col-span-2">
                  <label className="admin-form-label">Key Specs / Badges (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10.4 Touchscreen, DICOM Ready, MD-42 Certified"
                    value={formData.specs}
                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                    className="admin-input"
                  />
                </div>

                {/* Image Mode Selector */}
                <div className="admin-form-group admin-col-span-2">
                  <label className="admin-form-label">Product Image *</label>
                  <div className="admin-img-mode-toggle">
                    <button
                      type="button"
                      className={`admin-img-mode-btn ${imageMode === 'url' ? 'active' : ''}`}
                      onClick={() => setImageMode('url')}
                    >
                      <LinkIcon size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                      Image URL / Path
                    </button>
                    <button
                      type="button"
                      className={`admin-img-mode-btn ${imageMode === 'file' ? 'active' : ''}`}
                      onClick={() => setImageMode('file')}
                    >
                      <Upload size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                      Upload from Computer
                    </button>
                  </div>

                  {imageMode === 'url' ? (
                    <input
                      type="text"
                      placeholder="e.g. /uploads/ecg-12ch.jpg or https://..."
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setPreviewUrl(e.target.value);
                      }}
                      className="admin-input"
                    />
                  ) : (
                    <label className="admin-file-upload-box">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/jpg"
                        onChange={handleFileChange}
                        className="admin-file-input"
                      />
                      <Upload size={24} style={{ color: '#38bdf8', marginBottom: 8 }} />
                      <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                        {imageFile ? imageFile.name : 'Click to select JPEG, PNG, WEBP, or AVIF image'}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Up to 5MB (Synced to Cloudinary)</span>
                    </label>
                  )}

                  {previewUrl && (
                    <div className="admin-preview-box">
                      <img src={previewUrl} alt="Preview" className="admin-preview-img" />
                    </div>
                  )}
                </div>

                {/* In Stock Checkbox */}
                <div className="admin-form-group admin-col-span-2">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    />
                    <span>Item currently in stock and available for immediate wholesale dispatch</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  {isSubmitting
                    ? imageMode === 'file' && imageFile
                      ? 'Uploading to Cloudinary...'
                      : 'Saving...'
                    : editingProduct
                    ? 'Update Equipment'
                    : 'Create Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
