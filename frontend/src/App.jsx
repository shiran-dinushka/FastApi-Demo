import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown, ArrowUp, Boxes, ChevronDown, CircleAlert, LayoutDashboard,
  LoaderCircle, MoreHorizontal, Package, Plus, Search, SlidersHorizontal,
  Sparkles, X,
} from 'lucide-react'

const blankProduct = { id: '', name: '', description: '', price: '', quantity: '' }
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All products')
  const [sort, setSort] = useState('name')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(blankProduct)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  async function loadProducts() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/products`)
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      setProducts(await response.json())
    } catch (err) {
      setError('Could not reach the inventory API. Start FastAPI on port 8000, then refresh.')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadProducts() }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((p) => {
      const matches = !query || `${p.name} ${p.description} ${p.id}`.toLowerCase().includes(query)
      const inStock = Number(p.quantity) > 0
      return matches && (filter === 'All products' || (filter === 'In stock' ? inStock : !inStock))
    }).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : Number(b[sort]) - Number(a[sort]))
  }, [products, search, filter, sort])

  const totalUnits = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0)
  const inventoryValue = products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0), 0)
  const lowStock = products.filter((p) => Number(p.quantity) > 0 && Number(p.quantity) <= 10).length

  function openCreate() { setForm(blankProduct); setModal({ mode: 'create' }) }
  function openEdit(product) { setForm({ ...product }); setModal({ mode: 'edit', id: product.id }) }
  function closeModal() { if (!saving) setModal(null) }

  async function saveProduct(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const body = { id: Number(form.id), name: form.name.trim(), description: form.description.trim(), price: Number(form.price), quantity: Number(form.quantity) }
    try {
      const response = await fetch(modal.mode === 'create' ? `${API_URL}/product` : `${API_URL}/product/${modal.id}`, {
        method: modal.mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const result = await response.json()
      if (!response.ok || result.error) throw new Error(result.detail?.[0]?.msg || result.error || 'Could not save product')
      await loadProducts()
      setModal(null)
      setNotice(modal.mode === 'create' ? 'Product added to your inventory' : 'Product details updated')
      window.setTimeout(() => setNotice(''), 2800)
    } catch (err) { setError(err.message || 'Could not save product') }
    finally { setSaving(false) }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete “${product.name}” from your inventory?`)) return
    try {
      const response = await fetch(`${API_URL}/product/${product.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete product')
      await loadProducts()
      setNotice('Product removed from inventory')
      window.setTimeout(() => setNotice(''), 2800)
    } catch (err) { setError(err.message) }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span className="brand-mark"><Boxes size={19} /></span><span>stockroom<span className="brand-dot">.</span></span></a>
      <div className="workspace"><div className="workspace-avatar">S</div><div><strong>Studio Goods</strong><small>Workspace</small></div><ChevronDown size={15} /></div>
      <p className="nav-label">WORKSPACE</p>
      <nav><a className="nav-item active" href="#inventory"><LayoutDashboard size={17} />Overview</a><a className="nav-item" href="#inventory"><Package size={17} />Products<span className="nav-count">{products.length}</span></a></nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><Sparkles size={16} /></span><strong>Keep things moving</strong><p>Your inventory is looking good. Keep it up!</p><a href="#inventory">View inventory <span>→</span></a></div><div className="profile"><div className="profile-avatar">JD</div><div><strong>Jordan Davis</strong><small>Administrator</small></div><MoreHorizontal size={18} /></div></div>
    </aside>

    <main className="main" id="top">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="live-dot" />API connected <span className="top-divider" /><button className="icon-button" aria-label="More options"><MoreHorizontal size={19} /></button><div className="profile-avatar small">JD</div></div></header>
      <section className="content" id="inventory">
        <div className="page-heading"><div><div className="eyebrow">MONDAY, YOUR INVENTORY AT A GLANCE</div><h1>Good morning, Jordan <span>✦</span></h1><p>Here’s what’s happening with your products today.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17} /> Add product</button></div>

        <div className="stats-grid">
          <StatCard title="Total products" value={products.length} note="Unique items in catalog" icon={<Package size={18} />} accent="violet" />
          <StatCard title="Units in stock" value={totalUnits.toLocaleString()} note="Across all products" icon={<Boxes size={18} />} accent="blue" />
          <StatCard title="Inventory value" value={money(inventoryValue)} note="Based on current quantity" icon={<span className="dollar">$</span>} accent="green" />
          <StatCard title="Low stock" value={lowStock} note={lowStock ? 'Products with 10 or fewer units' : 'Everything is well stocked'} icon={<CircleAlert size={18} />} accent="amber" />
        </div>

        <section className="panel">
          <div className="panel-heading"><div><h2>Product inventory</h2><p>Manage and keep track of your products.</p></div><button className="subtle-button" onClick={loadProducts}><SlidersHorizontal size={15} /> Refresh</button></div>
          <div className="toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search products" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></div><div className="toolbar-right"><select aria-label="Filter products" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All products</option><option>In stock</option><option>Out of stock</option></select><select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}><option value="name">Sort: Name</option><option value="price">Sort: Price</option><option value="quantity">Sort: Quantity</option></select></div></div>
          {error && <div className="error-banner"><CircleAlert size={17} /><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button></div>}
          <div className="table-wrap"><table><thead><tr><th><input type="checkbox" aria-label="Select all products" /></th><th>PRODUCT</th><th>PRICE</th><th>QUANTITY</th><th>STATUS</th><th></th></tr></thead><tbody>
            {loading ? <tr><td colSpan="6" className="table-message"><LoaderCircle className="spin" size={20} />Loading inventory…</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" className="empty-state"><div className="empty-icon"><Package size={22} /></div><strong>{products.length ? 'No products match your search' : 'Your inventory is empty'}</strong><span>{products.length ? 'Try another search or filter.' : 'Add your first product to get started.'}</span>{!products.length && <button className="primary-button compact" onClick={openCreate}><Plus size={15} /> Add product</button>}</td></tr> : filtered.map((product, index) => <ProductRow key={product.id} product={product} index={index} onEdit={() => openEdit(product)} onDelete={() => deleteProduct(product)} />)}
          </tbody></table></div>
          <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products</span><div className="pagination"><button disabled><ArrowUp size={14} /></button><span>1</span><button disabled><ArrowDown size={14} /></button></div></div>
        </section>
        <footer>© 2024 Stockroom <span>·</span> Inventory, made simple</footer>
      </section>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow">PRODUCT CATALOG</div><h2 id="modal-title">{modal.mode === 'create' ? 'Add a product' : 'Edit product'}</h2><p>Enter the details for this inventory item.</p></div><button className="icon-button" onClick={closeModal} aria-label="Close dialog"><X size={18} /></button></div><form onSubmit={saveProduct}><label>Product ID<input type="number" min="1" required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={modal.mode === 'edit'} placeholder="e.g. 5" /></label><label>Product name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless speaker" /></label><label>Description<textarea required rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A short description of the product" /></label><div className="form-row"><label>Price (USD)<input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></label><label>Quantity<input type="number" min="0" step="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" /></label></div>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="subtle-button" onClick={closeModal}>Cancel</button><button className="primary-button" disabled={saving}>{saving && <LoaderCircle className="spin" size={15} />}{saving ? 'Saving…' : modal.mode === 'create' ? 'Add product' : 'Save changes'}</button></div></form></section></div>}
    {notice && <div className="toast"><span>✓</span>{notice}</div>}
  </div>
}

function StatCard({ title, value, note, icon, accent }) {
  return <article className="stat-card"><div className={`stat-icon ${accent}`}>{icon}</div><span className="stat-label">{title}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></article>
}

function ProductRow({ product, index, onEdit, onDelete }) {
  const initials = product.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['lavender', 'peach', 'mint', 'sky', 'lemon']
  const quantity = Number(product.quantity)
  const status = quantity <= 0 ? 'out' : quantity <= 10 ? 'low' : 'available'
  const [menu, setMenu] = useState(false)
  return <tr><td><input type="checkbox" aria-label={`Select ${product.name}`} /></td><td><div className="product-cell"><div className={`product-thumb ${colors[index % colors.length]}`}>{initials}</div><div><strong>{product.name}</strong><span>{product.description || 'No description'} · ID {product.id}</span></div></div></td><td className="price-cell">{money(product.price)}</td><td><span className="quantity-cell">{quantity.toLocaleString()} <small>units</small></span></td><td><span className={`badge ${status}`}><i />{status === 'out' ? 'Out of stock' : status === 'low' ? 'Low stock' : 'In stock'}</span></td><td className="actions-cell"><div className="row-menu-wrap"><button className="icon-button row-menu" aria-label={`Actions for ${product.name}`} onClick={() => setMenu(!menu)}><MoreHorizontal size={18} /></button>{menu && <div className="row-menu-popover"><button onClick={() => { setMenu(false); onEdit() }}>Edit product</button><button className="delete-action" onClick={() => { setMenu(false); onDelete() }}>Delete product</button></div>}</div></td></tr>
}

export default App
