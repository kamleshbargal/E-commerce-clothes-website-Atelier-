/**
 * StyleHub Haute Atelier - Admin Studio Operations Logic
 */

const API_BASE = (window.location.port === "5500") 
    ? "http://127.0.0.1:5000" 
    : (window.location.origin.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000");
const ADMIN_PASSCODE = "atelier2026";

let adminOrders = [];
let adminProducts = [];
let adminUsers = [];

// 1. Authentication & Gatekeeper
function initAdminAuth() {
    const authView = document.getElementById("admin-login-view");
    const dashView = document.getElementById("admin-dashboard-view");
    const lockBtn = document.getElementById("btn-lock-admin");

    const isAuthed = sessionStorage.getItem("stylehub_admin_auth") === "true";

    if (isAuthed) {
        if (authView) authView.style.display = "none";
        if (dashView) dashView.style.display = "block";
        const adminName = sessionStorage.getItem("stylehub_admin_name") || "Kamlesh Bargal (Master Owner)";
        const adminDisplay = document.getElementById("admin-owner-display");
        if (adminDisplay) adminDisplay.textContent = `👑 ${adminName}`;
        loadAllAdminData();
    } else {
        if (authView) authView.style.display = "flex";
        if (dashView) dashView.style.display = "none";
    }

    if (lockBtn) {
        lockBtn.addEventListener("click", () => {
            sessionStorage.removeItem("stylehub_admin_auth");
            sessionStorage.removeItem("stylehub_admin_name");
            sessionStorage.removeItem("stylehub_admin_role");
            if (authView) authView.style.display = "flex";
            if (dashView) dashView.style.display = "none";
            const passInput = document.getElementById("admin-passcode-input");
            if (passInput) passInput.value = "";
            const err = document.getElementById("admin-auth-error-inline");
            if (err) err.style.display = "none";
            showToast("Admin Studio Locked 🔒", "👋");
        });
    }
}

async function handleInlineAdminUnlock(e) {
    if (e) e.preventDefault();
    const input = document.getElementById("admin-passcode-input");
    const err = document.getElementById("admin-auth-error-inline");
    const btn = document.getElementById("btn-unlock-inline");
    const passcode = input ? input.value.trim() : "";

    if (!passcode) return;
    if (btn) btn.innerHTML = "Verifying Credentials...";

    // 1. Direct Master Passcode Check
    if (passcode === ADMIN_PASSCODE) {
        unlockAdminConsole("Kamlesh Bargal (Master Owner)");
        return;
    }

    // 2. Remote Backend /api/admin/verify Check
    try {
        const res = await fetch(`${API_BASE}/api/admin/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passcode: passcode })
        });
        const data = await res.json();
        if (res.ok && data.authorized) {
            unlockAdminConsole(data.name || "Kamlesh Bargal (Master Owner)");
            return;
        }
    } catch (ex) {
        console.warn("Backend admin verify offline, fallback:", ex);
    }

    if (err) err.style.display = "block";
    if (btn) btn.innerHTML = `Unlock Studio Dashboard <span>→</span>`;
}

function unlockAdminConsole(adminName = "Kamlesh Bargal (Master Owner)") {
    sessionStorage.setItem("stylehub_admin_auth", "true");
    sessionStorage.setItem("stylehub_admin_name", adminName);
    sessionStorage.setItem("stylehub_admin_role", "admin");

    const authView = document.getElementById("admin-login-view");
    const dashView = document.getElementById("admin-dashboard-view");
    if (authView) authView.style.display = "none";
    if (dashView) dashView.style.display = "block";

    const adminDisplay = document.getElementById("admin-owner-display");
    if (adminDisplay) adminDisplay.textContent = `👑 ${adminName}`;

    loadAllAdminData();
    showToast(`Welcome, ${adminName}! 👑`, "✨");
}

function autoUnlockOwnerInline() {
    const input = document.getElementById("admin-passcode-input");
    if (input) input.value = ADMIN_PASSCODE;
    unlockAdminConsole("Kamlesh Bargal (Master Owner)");
}

// 2. Tab Navigation
function initAdminTabs() {
    const tabBtns = document.querySelectorAll(".admin-tab-btn");
    const tabPanes = document.querySelectorAll(".admin-tab-pane");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.style.display = "none");

            btn.classList.add("active");
            const activePane = document.getElementById(targetId);
            if (activePane) activePane.style.display = "block";

            if (targetId === "tab-analytics") {
                renderAdminCharts();
            } else if (targetId === "tab-coupons") {
                loadFestiveCampaignSettings();
                loadCoupons();
            }
        });
    });
}

// Live Studio Clock Ticker
function initAdminClock() {
    const clockEl = document.getElementById("admin-live-clock");
    if (!clockEl) return;
    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        clockEl.textContent = `${timeStr} IST • Live`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// Global Order ID Copy Helper
window.copyOrderId = function(id) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(() => {
            showToast(`Order ID ${id} copied to clipboard!`, "📋");
        }).catch(() => {
            showToast(`Order ID: ${id}`, "📋");
        });
    } else {
        showToast(`Order ID: ${id}`, "📋");
    }
};

// 3. Load Data & Stats
async function loadAllAdminData() {
    await Promise.all([
        loadStats(),
        loadOrders(),
        loadProducts(),
        loadUsers(),
        loadCoupons()
    ]);
    renderAdminCharts();
}

async function loadStats() {
    const tabBadge = document.getElementById("tab-orders-badge");
    try {
        const res = await fetch(`${API_BASE}/api/admin/stats`);
        if (res.ok) {
            const stats = await res.json();
            document.getElementById("stat-revenue").textContent = `₹${Math.round(stats.total_revenue || 0).toLocaleString()}`;
            document.getElementById("stat-orders").textContent = stats.total_orders || 0;
            document.getElementById("stat-pending").textContent = stats.pending_orders || 0;
            document.getElementById("stat-users").textContent = stats.total_users || 0;
            document.getElementById("stat-products").textContent = stats.total_products || 0;
            if (tabBadge) tabBadge.textContent = stats.total_orders || 0;
            return;
        }
    } catch (e) {
        console.warn("Using offline stats calculation:", e);
    }

    // Offline / LocalStorage fallback
    const localOrders = JSON.parse(localStorage.getItem("stylehub_orders")) || [];
    const localUsers = JSON.parse(localStorage.getItem("stylehub_users")) || [];
    const rev = localOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pend = localOrders.filter(o => (o.status || "").toLowerCase() === "pending").length;

    document.getElementById("stat-revenue").textContent = `₹${rev.toLocaleString()}`;
    document.getElementById("stat-orders").textContent = localOrders.length;
    document.getElementById("stat-pending").textContent = pend;
    document.getElementById("stat-users").textContent = Math.max(localUsers.length, 1);
    document.getElementById("stat-products").textContent = 22;
    if (tabBadge) tabBadge.textContent = localOrders.length;
}

// 4. Orders Manager
async function loadOrders() {
    try {
        const res = await fetch(`${API_BASE}/api/orders`);
        if (res.ok) {
            adminOrders = await res.json();
        }
    } catch (e) {
        adminOrders = JSON.parse(localStorage.getItem("stylehub_orders")) || [];
    }

    const tabBadge = document.getElementById("tab-orders-badge");
    if (tabBadge) tabBadge.textContent = adminOrders.length;

    renderAdminOrders();
}

function renderAdminOrders() {
    const tbody = document.getElementById("admin-orders-tbody");
    const searchVal = (document.getElementById("order-search-input")?.value || "").toLowerCase().trim();
    const statusVal = document.getElementById("order-status-filter")?.value || "all";

    if (!tbody) return;

    let filtered = adminOrders.filter(order => {
        const name = (order.customer_name || order.name || "").toLowerCase();
        const email = (order.email || "").toLowerCase();
        const idStr = String(order.id || order.orderId || "");
        const matchesSearch = !searchVal || name.includes(searchVal) || email.includes(searchVal) || idStr.includes(searchVal);
        const matchesStatus = statusVal === "all" || (order.status || "Pending").toLowerCase() === statusVal.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.95rem;">✨ No customer orders found matching your search.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(order => {
        const orderId = order.id ? `#SH-2026-${order.id}` : (order.orderId || `#SH-${order.id}`);
        const name = order.customer_name || order.name || "Customer";
        const initials = name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase() || "CU";
        const email = order.email || "guest@stylehub.com";
        const phone = order.phone || "";
        const address = order.address || "";
        const total = Number(order.total) || 0;
        const status = order.status || "Pending";
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (order.date || "Recent");

        return `
            <tr>
                <td>
                    <button type="button" class="btn-copy-chip" onclick="copyOrderId('${orderId}')" title="Click to copy Order ID">
                        <strong>${orderId}</strong> <span>📋</span>
                    </button>
                </td>
                <td style="color: var(--text-secondary); font-size: 0.82rem; white-space: nowrap;">${dateStr}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="admin-avatar">${initials}</div>
                        <div>
                            <strong style="display: block; font-size: 0.88rem; color: var(--text-primary);">${name}</strong>
                            <span style="display: block; font-size: 0.76rem; color: var(--text-muted);">${email}</span>
                        </div>
                    </div>
                </td>
                <td style="font-size: 0.82rem; max-width: 250px; color: var(--text-secondary); line-height: 1.35;">
                    ${phone ? `<div>📞 <strong>${phone}</strong> <a href="https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello ' + name + ', your StyleHub order ' + orderId + ' is confirmed! Grand Total: ₹' + total.toLocaleString())}" target="_blank" style="display: inline-block; margin-left: 0.35rem; padding: 0.15rem 0.45rem; background: #25D366; color: #ffffff; border-radius: 4px; font-weight: 700; font-size: 0.72rem; text-decoration: none;">💬 WhatsApp</a></div>` : ''}
                    <div style="margin-top: 0.2rem; color: var(--text-muted); font-size: 0.78rem;">📍 ${address || 'Local Delivery'}</div>
                </td>
                <td><strong style="color: var(--accent-gold); font-size: 0.98rem;">₹${total.toLocaleString()}</strong></td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 0.4rem 0.65rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: 1px solid var(--border-medium); background: var(--bg-surface); cursor: pointer;">
                        <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                        <option value="Processing" ${status === 'Processing' ? 'selected' : ''}>⚙️ Processing</option>
                        <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>🚚 Shipped</option>
                        <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
                        <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                    </select>
                </td>
                <td style="text-align: right;">
                    <button type="button" onclick="deleteOrder(${order.id})" style="color: var(--accent-terracotta); background: transparent; border: 1px solid rgba(193, 102, 79, 0.25); padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s ease;">
                        🗑️ Remove
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            showToast(`Order #${orderId} marked as ${newStatus}`, "✓");
            loadAllAdminData();
            return;
        }
    } catch (e) {
        console.warn("Backend offline, updating locally:", e);
    }

    // Local fallback
    const localOrders = JSON.parse(localStorage.getItem("stylehub_orders")) || [];
    const target = localOrders.find(o => o.id === orderId || o.orderId === orderId);
    if (target) target.status = newStatus;
    localStorage.setItem("stylehub_orders", JSON.stringify(localOrders));
    showToast(`Order status updated to ${newStatus}`, "✓");
    loadAllAdminData();
};

window.deleteOrder = async function(orderId) {
    if (!confirm(`Are you sure you want to remove order #${orderId}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`, { method: "DELETE" });
        if (res.ok) {
            showToast(`Order #${orderId} deleted`, "🗑️");
            loadAllAdminData();
            return;
        }
    } catch (e) {
        console.warn("Backend offline, deleting locally:", e);
    }

    const localOrders = JSON.parse(localStorage.getItem("stylehub_orders")) || [];
    const updated = localOrders.filter(o => o.id !== orderId && o.orderId !== orderId);
    localStorage.setItem("stylehub_orders", JSON.stringify(updated));
    showToast("Order removed", "🗑️");
    loadAllAdminData();
};

// 5. Product Catalog Manager
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (res.ok) {
            adminProducts = await res.json();
        }
    } catch (e) {
        adminProducts = [];
    }

    renderAdminProducts();
}

function renderAdminProducts() {
    const tbody = document.getElementById("admin-products-tbody");
    const kpiProd = document.getElementById("stat-products");
    if (kpiProd && adminProducts) kpiProd.textContent = adminProducts.length;

    if (!tbody) return;

    if (!adminProducts || adminProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.95rem;">✨ No garments found in catalog.</td></tr>`;
        return;
    }

    tbody.innerHTML = adminProducts.map(prod => {
        const stockQty = prod.stock !== undefined && prod.stock !== null ? Number(prod.stock) : 25;
        const isLowStock = stockQty <= 5;
        const stockBadge = isLowStock
            ? `<span class="stock-pill" style="background: #fef2f2; color: #b91c1c; border-color: #fca5a5; font-weight: 700;">⚠️ Only ${stockQty} left</span>`
            : `<span class="stock-pill">📦 ${stockQty} in stock</span>`;

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="${prod.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=150&q=80'}" alt="${prod.name}" style="width: 48px; height: 58px; object-fit: cover; border-radius: var(--radius-xs); border: 1px solid var(--border-medium); box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
                        <div>
                            <strong style="display: block; font-size: 0.9rem; color: var(--text-primary);">${prod.name}</strong>
                            <span style="font-size: 0.76rem; color: var(--text-muted);">ID: #${prod.id}</span>
                        </div>
                    </div>
                </td>
                <td><span class="status-tag processing">${prod.category}</span></td>
                <td>${stockBadge}</td>
                <td><strong style="color: var(--accent-gold); font-size: 0.98rem;">₹${Number(prod.price).toLocaleString()}</strong></td>
                <td style="text-align: right;">
                    <div style="display: flex; gap: 0.4rem; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
                        <button type="button" onclick="editProductPrice(${prod.id}, ${prod.price})" style="color: var(--accent-gold); background: transparent; padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.78rem; border: 1px solid rgba(197, 160, 89, 0.4); cursor: pointer; transition: all 0.2s ease;">
                            ✏️ Price
                        </button>
                        <button type="button" onclick="editProductStock(${prod.id}, ${stockQty})" style="color: #3b82f6; background: transparent; padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.78rem; border: 1px solid rgba(59, 130, 246, 0.4); cursor: pointer; transition: all 0.2s ease;">
                            📦 Stock
                        </button>
                        <button type="button" onclick="deleteProduct(${prod.id})" style="color: var(--accent-terracotta); background: transparent; padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.78rem; border: 1px solid rgba(193, 102, 79, 0.25); cursor: pointer; transition: all 0.2s ease;">
                            🗑️ Remove
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

window.editProductPrice = async function(productId, currentPrice) {
    const newPrice = prompt(`Enter new price (₹) for Product #${productId}:`, currentPrice);
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) return;

    try {
        const res = await fetch(`${API_BASE}/api/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: Number(newPrice) })
        });
        if (res.ok) {
            showToast(`Product #${productId} price updated to ₹${Number(newPrice).toLocaleString()}`, "✓");
            loadAllAdminData();
            return;
        }
    } catch (e) {
        console.warn("Update product error:", e);
    }
};

window.editProductStock = async function(productId, currentStock) {
    const newStock = prompt(`Enter new stock quantity for Product #${productId}:`, currentStock !== undefined ? currentStock : 25);
    if (newStock === null || isNaN(newStock) || Number(newStock) < 0) return;

    try {
        const res = await fetch(`${API_BASE}/api/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: parseInt(newStock, 10) })
        });
        if (res.ok) {
            showToast(`Product #${productId} stock updated to ${newStock} units`, "✓");
            loadAllAdminData();
            return;
        }
    } catch (e) {
        console.warn("Update stock error:", e);
    }
};

window.deleteProduct = async function(productId) {
    if (!confirm(`Delete product #${productId} from catalog?`)) return;

    try {
        const res = await fetch(`${API_BASE}/api/products/${productId}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Product removed from catalog", "🗑️");
            loadAllAdminData();
            return;
        }
    } catch (e) {
        console.warn("Backend offline:", e);
    }
};

function initAddProductForm() {
    const form = document.getElementById("admin-add-product-form");
    if (!form) return;

    const catSelect = document.getElementById("prod-category");
    const customCatWrap = document.getElementById("custom-cat-wrap");
    const customCatInput = document.getElementById("prod-custom-cat");
    const nameInput = document.getElementById("prod-name");
    const priceInput = document.getElementById("prod-price");
    const imageInput = document.getElementById("prod-image");
    const fileInput = document.getElementById("prod-image-file");
    const previewImg = document.getElementById("live-preview-img");
    const previewTitle = document.getElementById("live-preview-title");
    const previewCat = document.getElementById("live-preview-cat");
    const previewPrice = document.getElementById("live-preview-price");

    function updateLivePreview() {
        if (previewTitle && nameInput) previewTitle.textContent = nameInput.value.trim() || "Garment Title Preview";
        if (previewPrice && priceInput) {
            const p = Number(priceInput.value) || 2499;
            previewPrice.textContent = `₹${p.toLocaleString()}`;
        }
        if (previewCat && catSelect) {
            const c = catSelect.value === "__custom__" ? (customCatInput?.value.trim() || "Custom") : catSelect.value;
            previewCat.textContent = c;
        }
        if (previewImg && imageInput && imageInput.value.trim()) {
            previewImg.src = imageInput.value.trim();
        }
    }

    nameInput?.addEventListener("input", updateLivePreview);
    priceInput?.addEventListener("input", updateLivePreview);
    catSelect?.addEventListener("change", () => {
        if (customCatWrap) customCatWrap.style.display = catSelect.value === "__custom__" ? "block" : "none";
        updateLivePreview();
    });
    customCatInput?.addEventListener("input", updateLivePreview);
    imageInput?.addEventListener("input", updateLivePreview);

    if (fileInput && imageInput) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imageInput.value = event.target.result;
                    if (previewImg) previewImg.src = event.target.result;
                    showToast("Garment photo loaded from file!", "📷");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("prod-name")?.value.trim() || "";
        let category = catSelect ? catSelect.value : "Men";
        if (category === "__custom__") {
            category = customCatInput && customCatInput.value.trim() ? customCatInput.value.trim() : "Custom Clothing";
        }
        const price = Number(document.getElementById("prod-price")?.value) || 0;
        const image = imageInput ? imageInput.value.trim() : "";

        if (!name || price <= 0) {
            showToast("Please enter a valid product name and price!", "⚠️");
            return;
        }

        const submitBtn = form.querySelector("button[type='submit']");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Publishing to Website...";
        }

        try {
            const res = await fetch(`${API_BASE}/api/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, category, price, image, stock: 25 })
            });

            if (res.ok) {
                const data = await res.json();
                showToast(`🎉 "${name}" added to website catalog!`, "✨");
                form.reset();
                if (imageInput) imageInput.value = "";
                if (customCatWrap) customCatWrap.style.display = "none";
                updateLivePreview();
                loadAllAdminData();
                return;
            } else {
                const errData = await res.json().catch(() => ({}));
                console.warn("Backend error:", errData);
                showToast(errData.error || "Failed to add product to catalog", "⚠️");
            }
        } catch (e) {
            console.warn("Failed to add product to backend:", e);
            showToast("Network error connecting to backend.", "⚠️");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Publish Garment to Catalog <span>+</span>";
            }
        }
    });
}

window.submitBulkProducts = async function() {
    const textarea = document.getElementById("bulk-products-input");
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) {
        showToast("Please paste your products list first!", "⚠️");
        return;
    }

    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const products = [];

    lines.forEach(line => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length >= 2) {
            const name = parts[0];
            const category = parts.length >= 3 ? parts[1] : "Unisex";
            const price = parts.length >= 3 ? Number(parts[2].replace(/\D/g, "")) : Number(parts[1].replace(/\D/g, ""));
            const image = parts[3] || "";
            if (name && price) {
                products.push({ name, category, price, image });
            }
        }
    });

    if (products.length === 0) {
        showToast("No valid products found. Use format: Name, Category, Price", "⚠️");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/products/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products })
        });
        if (res.ok) {
            const data = await res.json();
            showToast(data.message || `Added ${products.length} products!`, "✨");
            textarea.value = "";
            loadAllAdminData();
            return;
        }
    } catch (e) {
        console.warn("Bulk add error:", e);
    }
};

window.addStockRow = function() {
    const tbody = document.getElementById("stock-rows-tbody");
    if (!tbody) return;
    const tr = document.createElement("tr");
    tr.className = "stock-item-row";
    tr.innerHTML = `
        <td>
            <input type="text" class="stock-name" placeholder="e.g. New Garment Piece" style="width: 100%; padding: 0.65rem 0.8rem; font-size: 0.88rem; border: 1px solid var(--border-medium); border-radius: var(--radius-xs);" required>
        </td>
        <td>
            <select class="stock-category" style="width: 100%; padding: 0.65rem 0.8rem; font-size: 0.86rem; border: 1px solid var(--border-medium); border-radius: var(--radius-xs); background: var(--bg-main);">
                <option value="Men T-Shirts">Men T-Shirts</option>
                <option value="Men Shirts">Men Shirts</option>
                <option value="Men Jeans">Men Jeans</option>
                <option value="Men Kurta">Men Kurta / Ethnic</option>
                <option value="Men Suits">Men Suits / Blazers</option>
                <option value="Women Sarees">Women Sarees</option>
                <option value="Women Kurtis">Women Kurtis</option>
                <option value="Women Dresses">Women Dresses</option>
                <option value="Women Tops">Women Tops</option>
                <option value="Winterwear">Winterwear / Hoodies</option>
                <option value="Kids">Kids & Youth</option>
                <option value="Jewellery">Jewellery & Accessories</option>
            </select>
        </td>
        <td>
            <input type="number" class="stock-price" placeholder="999" min="1" style="width: 100%; padding: 0.65rem 0.8rem; font-size: 0.88rem; border: 1px solid var(--border-medium); border-radius: var(--radius-xs);" required>
        </td>
        <td>
            <input type="number" class="stock-qty" placeholder="25" min="1" value="25" style="width: 100%; padding: 0.65rem 0.8rem; font-size: 0.88rem; border: 1px solid var(--border-medium); border-radius: var(--radius-xs);" required>
        </td>
        <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <img class="stock-row-preview" src="" style="display: none;">
                <input type="file" class="stock-file" accept="image/*" onchange="handleRowFile(this)" style="width: 100%; font-size: 0.76rem; padding: 0.3rem;">
                <input type="hidden" class="stock-img-data" value="">
            </div>
        </td>
        <td style="text-align: center;">
            <button type="button" onclick="removeStockRow(this)" style="background: none; border: none; color: var(--accent-terracotta); font-size: 1.1rem; cursor: pointer;" title="Remove Row">✕</button>
        </td>
    `;
    tbody.appendChild(tr);
};

window.removeStockRow = function(btn) {
    const tbody = document.getElementById("stock-rows-tbody");
    if (tbody && tbody.children.length > 1) {
        btn.closest("tr").remove();
    } else {
        showToast("At least one stock item row is required.", "⚠️");
    }
};

window.handleRowFile = function(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const cell = input.closest("td");
            const hidden = cell.querySelector(".stock-img-data");
            const preview = cell.querySelector(".stock-row-preview");
            if (hidden) hidden.value = e.target.result;
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = "inline-block";
            }
            showToast("Photo thumbnail loaded!", "📷");
        };
        reader.readAsDataURL(file);
    }
};

window.handleStockFormSubmit = async function(e) {
    e.preventDefault();
    const rows = document.querySelectorAll("#stock-rows-tbody .stock-item-row");
    const products = [];

    rows.forEach(row => {
        const name = row.querySelector(".stock-name")?.value.trim();
        const category = row.querySelector(".stock-category")?.value || "Men";
        const price = Number(row.querySelector(".stock-price")?.value) || 0;
        const stock = Number(row.querySelector(".stock-qty")?.value) || 20;
        const image = row.querySelector(".stock-img-data")?.value.trim() || "";

        if (name && price > 0) {
            products.push({ name, category, price, stock, image });
        }
    });

    if (products.length === 0) {
        showToast("Please enter at least one valid garment name and price!", "⚠️");
        return;
    }

    const submitBtn = document.getElementById("btn-submit-stock");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ Submitting Stock to Shop...";
    }

    try {
        const res = await fetch(`${API_BASE}/api/products/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products })
        });

        if (res.ok) {
            showToast(`🎉 Success! Added ${products.length} new stock items to your shop!`, "✓");
            document.getElementById("stock-submission-form")?.reset();
            loadAllAdminData();
            setTimeout(() => {
                document.querySelector("[data-tab='tab-products']")?.click();
            }, 1200);
            return;
        }
    } catch (err) {
        console.warn("Stock submit error:", err);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "✓ SUBMIT ALL NEW STOCK TO SHOP";
        }
    }
};

// 6. Customers Directory
async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (res.ok) {
            adminUsers = await res.json();
        }
    } catch (e) {
        adminUsers = JSON.parse(localStorage.getItem("stylehub_users")) || [];
    }

    renderAdminUsers();
}

function renderAdminUsers() {
    const tbody = document.getElementById("admin-users-tbody");
    if (!tbody) return;

    if (!adminUsers || adminUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.95rem;">✨ No registered customers in database yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = adminUsers.map(user => {
        const name = user.name || "Customer";
        const initials = name.split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("").toUpperCase() || "CU";
        const dateStr = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (user.date || "Recent");

        return `
            <tr>
                <td><span style="font-family: monospace; font-weight: 600; color: var(--text-muted); background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">#USR-${user.id}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="admin-avatar">${initials}</div>
                        <strong style="color: var(--text-primary); font-size: 0.9rem;">${name}</strong>
                    </div>
                </td>
                <td style="color: var(--text-secondary);">${user.email}</td>
                <td style="color: var(--text-muted); font-size: 0.84rem;">${dateStr}</td>
            </tr>
        `;
    }).join("");
}

// 7. Announcement Words Editor
function initAnnouncementEditor() {
    const form = document.getElementById("admin-announcement-form");
    const textarea = document.getElementById("announcement-text");

    const saved = localStorage.getItem("stylehub_announcement");
    if (textarea && saved) {
        textarea.value = saved;
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const words = textarea.value.trim();
            if (words) {
                localStorage.setItem("stylehub_announcement", words);
                showToast("Website announcement ticker updated!", "📢");
            }
        });
    }
}

// 8. PhonePe / UPI Scanner Settings
function initPaymentSettings() {
    const form = document.getElementById("admin-payment-form");
    const upiInput = document.getElementById("admin-upi-id");
    const qrFileInput = document.getElementById("admin-qr-file");
    const previewWrap = document.getElementById("admin-qr-preview-wrap");
    const previewImg = document.getElementById("admin-qr-preview-img");
    const removeQrBtn = document.getElementById("btn-remove-qr");

    // Load saved settings
    const savedUpiId = localStorage.getItem("stylehub_custom_upi_id");
    if (upiInput && savedUpiId) {
        upiInput.value = savedUpiId;
    }

    const savedQrImg = localStorage.getItem("stylehub_custom_qr_image");
    if (savedQrImg && previewWrap && previewImg) {
        previewImg.src = savedQrImg;
        previewWrap.style.display = "block";
    }

    // Handle image file selection
    if (qrFileInput) {
        qrFileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    if (previewImg && previewWrap) {
                        previewImg.src = dataUrl;
                        previewWrap.style.display = "block";
                    }
                    localStorage.setItem("stylehub_custom_qr_image", dataUrl);
                    showToast("Custom PhonePe QR loaded! Click Save to apply.", "📷");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle remove QR
    if (removeQrBtn) {
        removeQrBtn.addEventListener("click", () => {
            localStorage.removeItem("stylehub_custom_qr_image");
            if (previewWrap) previewWrap.style.display = "none";
            if (previewImg) previewImg.src = "";
            if (qrFileInput) qrFileInput.value = "";
            showToast("Custom QR photo removed. Dynamic QR will be used.", "✓");
        });
    }

    // Handle form save
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const upiId = upiInput ? upiInput.value.trim() : "";
            if (upiId) {
                localStorage.setItem("stylehub_custom_upi_id", upiId);
            } else {
                localStorage.removeItem("stylehub_custom_upi_id");
            }
            showToast("Your PhonePe Scanner settings have been saved!", "💳");
        });
    }
}

// --------------------------------------------------------------------------
// 7. FESTIVE CAMPAIGN CONTROLLER & PROMO COUPONS MANAGER
// --------------------------------------------------------------------------
const FESTIVE_PRESETS = {
    diwali: {
        name: "Diwali Grand Festive Dhamaka",
        code: "DIWALI25",
        discount: 25,
        mode: "manual",
        banner: "🪔 Grand Festive Dhamaka Live! Get Extra 25% OFF on all collections with code DIWALI25 • Complimentary Delivery on ₹1,999+"
    },
    navratri: {
        name: "Navratri & Dussehra Splendor",
        code: "NAVRATRI20",
        discount: 20,
        mode: "manual",
        banner: "🌸 Navratri & Dussehra Splendor Live! Extra 20% OFF with code NAVRATRI20 • Celebration Couture Drop"
    },
    holi: {
        name: "Holi Rang Barse Festival",
        code: "HOLI20",
        discount: 20,
        mode: "manual",
        banner: "🎨 Rang Barse Holi Festive Sale! Extra 20% OFF with code HOLI20 • Free Express Delivery"
    },
    eid: {
        name: "Eid Mubarak Festive Edit",
        code: "EID20",
        discount: 20,
        mode: "manual",
        banner: "🌙 Eid Mubarak Special: Extra 20% OFF with code EID20 • Royal Atelier Couture Archive"
    },
    newyear: {
        name: "New Year Grand Luxury Gala",
        code: "NEWYEAR30",
        discount: 30,
        mode: "manual",
        banner: "❄️ New Year Luxury Gala: Extra 30% OFF with code NEWYEAR30 • Shop Atelier Archive"
    },
    freedom: {
        name: "Independence & Rakhi Special",
        code: "FREEDOM20",
        discount: 20,
        mode: "manual",
        banner: "🇮🇳 Freedom & Rakhi Festival: Extra 20% OFF with code FREEDOM20 • Atelier Handcrafted"
    },
    auto: {
        name: "Auto Seasonal Calendar",
        code: "NAVRATRI20",
        discount: 20,
        mode: "auto",
        banner: "✨ Grand Festive Season Live! Extra Festive Discounts Active • Free Delivery on ₹1,999+"
    },
    normal: {
        name: "Normal Everyday Mode",
        code: "WELCOME10",
        discount: 10,
        mode: "off",
        banner: "Complimentary Global Courier on Orders Over ₹1,999 • Atelier Spring/Summer 2026 Archive Live"
    }
};

window.applyPreset = function(presetKey) {
    const p = FESTIVE_PRESETS[presetKey];
    if (!p) return;
    const modeSelect = document.getElementById("festive-mode-select");
    const nameInput = document.getElementById("festive-name-input");
    const codeInput = document.getElementById("festive-code-input");
    const discInput = document.getElementById("festive-discount-input");
    const bannerInput = document.getElementById("festive-banner-input");

    if (modeSelect) modeSelect.value = p.mode;
    if (nameInput) nameInput.value = p.name;
    if (codeInput) codeInput.value = p.code;
    if (discInput) discInput.value = p.discount;
    if (bannerInput) bannerInput.value = p.banner;

    showToast(`Preset loaded for ${p.name}! Click 'Broadcast' to publish.`, "⚡");
};

async function loadFestiveCampaignSettings() {
    const statusText = document.getElementById("admin-festive-active-text");
    const statusBadge = document.getElementById("admin-festive-status-badge");
    const modeSelect = document.getElementById("festive-mode-select");
    const nameInput = document.getElementById("festive-name-input");
    const codeInput = document.getElementById("festive-code-input");
    const discInput = document.getElementById("festive-discount-input");
    const bannerInput = document.getElementById("festive-banner-input");

    try {
        const res = await fetch(`${API_BASE}/api/festive-sale`);
        if (res.ok) {
            const data = await res.json();
            if (statusText) {
                if (data.active) {
                    statusText.innerHTML = `🟢 ${data.festival_name} (${data.discount}% OFF - ${data.code})`;
                    if (statusBadge) statusBadge.style.borderColor = "rgba(34, 197, 94, 0.6)";
                } else {
                    statusText.innerHTML = `⚪ Normal Everyday (Standard Offers)`;
                    if (statusBadge) statusBadge.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }
            }
            if (modeSelect) modeSelect.value = data.mode || "auto";
            if (nameInput && !nameInput.value) nameInput.value = data.festival_name || "Diwali Dhamaka Sale";
            if (codeInput && !codeInput.value) codeInput.value = data.code || "DIWALI25";
            if (discInput && !discInput.value) discInput.value = data.discount || 25;
            if (bannerInput && !bannerInput.value) bannerInput.value = data.banner_text || "";
        }
    } catch (e) {
        console.warn("Could not fetch festive sale settings:", e);
    }
}

function initFestiveCampaignForm() {
    const form = document.getElementById("festive-campaign-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const mode = document.getElementById("festive-mode-select").value;
        const name = document.getElementById("festive-name-input").value.trim();
        const code = document.getElementById("festive-code-input").value.trim().toUpperCase();
        const discount = parseFloat(document.getElementById("festive-discount-input").value) || 20;
        const banner = document.getElementById("festive-banner-input").value.trim();
        const feedback = document.getElementById("festive-save-feedback");

        try {
            const res = await fetch(`${API_BASE}/api/festive-sale`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: mode,
                    festival_name: name,
                    code: code,
                    discount: discount,
                    banner_text: banner
                })
            });
            const data = await res.json();
            if (res.ok) {
                if (feedback) {
                    feedback.style.display = "inline";
                    setTimeout(() => { feedback.style.display = "none"; }, 4000);
                }
                showToast(data.message || "Festive campaign broadcasted successfully!", "🎉");
                loadFestiveCampaignSettings();
                loadCoupons();
            } else {
                alert(data.error || "Failed to update festive campaign");
            }
        } catch (e) {
            console.error("Error saving campaign:", e);
            alert("Network error updating festive campaign");
        }
    });
}

let adminCoupons = [];

async function loadCoupons() {
    const tbody = document.getElementById("admin-coupons-tbody");
    try {
        const res = await fetch(`${API_BASE}/api/coupons`);
        if (res.ok) {
            adminCoupons = await res.json();
            renderCouponsTable();
            return;
        }
    } catch (e) {
        console.warn("Backend offline, fallback coupons:", e);
    }

    adminCoupons = [
        { id: 1, code: "WELCOME10", discount_type: "percent", discount_value: 10, min_order: 0, description: "10% off for new atelier members" },
        { id: 2, code: "FESTIVE500", discount_type: "fixed", discount_value: 500, min_order: 1999, description: "₹500 off on festive orders" },
        { id: 3, code: "ATELIER15", discount_type: "percent", discount_value: 15, min_order: 1499, description: "15% off couture orders above ₹1,499" },
        { id: 4, code: "DIWALI25", discount_type: "percent", discount_value: 25, min_order: 0, description: "25% Diwali Dhamaka discount" },
        { id: 5, code: "NAVRATRI20", discount_type: "percent", discount_value: 20, min_order: 0, description: "20% Navratri & Dussehra discount" }
    ];
    renderCouponsTable();
}

function renderCouponsTable() {
    const tbody = document.getElementById("admin-coupons-tbody");
    if (!tbody) return;

    if (!adminCoupons || adminCoupons.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No active promotional coupons found.</td></tr>`;
        return;
    }

    tbody.innerHTML = adminCoupons.map(coupon => {
        const isPercent = coupon.discount_type === "percent" || coupon.discount_type === "percentage";
        const val = Math.round(Number(coupon.discount_value));
        const minOrder = Number(coupon.min_order) || 0;
        const discountBadge = isPercent
            ? `<span style="background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem;">${val}% OFF</span>`
            : `<span style="background: rgba(197, 160, 89, 0.12); color: var(--accent-gold); border: 1px solid rgba(197, 160, 89, 0.3); padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem;">₹${val} OFF</span>`;

        return `
            <tr>
                <td><strong style="font-family: monospace; font-size: 0.95rem; color: var(--text-primary); letter-spacing: 0.05em;">${coupon.code}</strong></td>
                <td>${discountBadge}</td>
                <td><span style="font-size: 0.84rem; color: var(--text-secondary);">${minOrder > 0 ? `₹${minOrder.toLocaleString()}` : "None"}</span></td>
                <td><span style="font-size: 0.82rem; color: var(--text-muted);">${coupon.description || "Active promotion"}</span></td>
                <td><span class="status-tag delivered">Active</span></td>
                <td>
                    <button type="button" onclick="deleteCoupon(${coupon.id})" style="color: var(--accent-terracotta); background: transparent; padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.8rem; border: 1px solid rgba(193, 102, 79, 0.25); cursor: pointer; transition: all 0.2s ease;">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function initCouponManager() {
    loadFestiveCampaignSettings();
    initFestiveCampaignForm();

    const form = document.getElementById("create-coupon-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const codeInput = document.getElementById("coupon-code");
        const typeSelect = document.getElementById("coupon-type");
        const valueInput = document.getElementById("coupon-value");
        const minOrderInput = document.getElementById("coupon-min-order");
        const descInput = document.getElementById("coupon-desc");

        const code = codeInput ? codeInput.value.trim().toUpperCase() : "";
        const rawType = typeSelect ? typeSelect.value : "percentage";
        const discountType = (rawType === "fixed") ? "fixed" : "percent";
        const discountValue = valueInput ? parseFloat(valueInput.value) : 0;
        const minOrder = minOrderInput ? parseFloat(minOrderInput.value) || 0 : 0;
        const description = descInput ? descInput.value.trim() : "";

        if (!code || isNaN(discountValue) || discountValue <= 0) {
            alert("Please enter a valid coupon code and discount value.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/coupons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: code,
                    discount_type: discountType,
                    discount_value: discountValue,
                    min_order: minOrder,
                    description: description
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Coupon ${code} activated successfully!`, "🎟️");
                form.reset();
                loadCoupons();
                return;
            } else {
                alert(data.error || "Failed to create coupon.");
            }
        } catch (e) {
            console.error("Error creating coupon:", e);
            alert("Network error connecting to backend.");
        }
    });
}

window.deleteCoupon = async function(id) {
    if (!confirm("Are you sure you want to remove this promotional coupon?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/coupons/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Coupon deleted", "🗑️");
            loadCoupons();
            return;
        }
    } catch (e) {
        console.warn("Error deleting coupon:", e);
    }
};

// --------------------------------------------------------------------------
// 8. CHART.JS SALES & CATEGORY ANALYTICS
// --------------------------------------------------------------------------
window.revenueChartInstance = null;
window.categoryChartInstance = null;

async function renderAdminCharts() {
    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded yet.");
        return;
    }

    const revenueCanvas = document.getElementById("chart-revenue-trend");
    const categoryCanvas = document.getElementById("chart-category-dist");
    if (!revenueCanvas || !categoryCanvas) return;

    let statsData = null;
    try {
        const statsRes = await fetch(`${API_BASE}/api/admin/stats`);
        if (statsRes.ok) {
            statsData = await statsRes.json();
        }
    } catch (e) {
        console.warn("Could not fetch stats for charts:", e);
    }

    // Chart 1: Revenue Trend
    const recentOrders = [...adminOrders].slice(0, 8).reverse();
    const orderLabels = recentOrders.length > 0
        ? recentOrders.map(o => `#SH-${o.id}`)
        : ["#SH-1", "#SH-2", "#SH-3", "#SH-4", "#SH-5"];
    const orderAmounts = recentOrders.length > 0
        ? recentOrders.map(o => Number(o.total) || 0)
        : [1899, 3499, 2199, 4999, 2899];

    if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
    }

    const revCtx = revenueCanvas.getContext("2d");
    window.revenueChartInstance = new Chart(revCtx, {
        type: "line",
        data: {
            labels: orderLabels,
            datasets: [{
                label: "Order Revenue (₹)",
                data: orderAmounts,
                borderColor: "#c5a059",
                backgroundColor: "rgba(197, 160, 89, 0.15)",
                borderWidth: 2.5,
                tension: 0.35,
                fill: true,
                pointBackgroundColor: "#c5a059",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` Revenue: ₹${Number(context.parsed.y).toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => "₹" + Number(value).toLocaleString(),
                        font: { size: 11 }
                    },
                    grid: { color: "rgba(0, 0, 0, 0.05)" }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });

    // Chart 2: Category Breakdown
    let catLabels = [];
    let catCounts = [];
    if (statsData && Array.isArray(statsData.categories) && statsData.categories.length > 0) {
        catLabels = statsData.categories.map(c => c.category);
        catCounts = statsData.categories.map(c => c.count);
    } else if (adminProducts && adminProducts.length > 0) {
        const countsMap = {};
        adminProducts.forEach(p => {
            countsMap[p.category] = (countsMap[p.category] || 0) + 1;
        });
        catLabels = Object.keys(countsMap);
        catCounts = Object.values(countsMap);
    } else {
        catLabels = ["Men", "Women", "Unisex", "Footwear", "Jewellery"];
        catCounts = [8, 10, 4, 3, 3];
    }

    if (window.categoryChartInstance) {
        window.categoryChartInstance.destroy();
    }

    const catCtx = categoryCanvas.getContext("2d");
    window.categoryChartInstance = new Chart(catCtx, {
        type: "doughnut",
        data: {
            labels: catLabels,
            datasets: [{
                data: catCounts,
                backgroundColor: [
                    "#c5a059",
                    "#3b82f6",
                    "#10b981",
                    "#8b5cf6",
                    "#f59e0b",
                    "#ec4899",
                    "#6366f1",
                    "#14b8a6"
                ],
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: { boxWidth: 12, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.parsed} pieces`;
                        }
                    }
                }
            },
            cutout: "68%"
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initAdminClock();
    initAdminAuth();
    initAdminTabs();
    initAddProductForm();
    initAnnouncementEditor();
    initPaymentSettings();
    initCouponManager();

    document.getElementById("order-search-input")?.addEventListener("input", renderAdminOrders);
    document.getElementById("order-status-filter")?.addEventListener("change", renderAdminOrders);
});

