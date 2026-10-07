/**
 * StyleHub Haute Atelier - Customer Profile & Order History Logic
 */

const API_BASE = (window.location.port === "5500") 
    ? "http://127.0.0.1:5000" 
    : (window.location.origin.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000");

let customerOrders = [];

function checkAuth() {
    const userJson = localStorage.getItem("stylehub_user");
    if (!userJson) {
        window.location.href = "login.html";
        return null;
    }
    return JSON.parse(userJson);
}

function initProfileHeader(user) {
    const nameEl = document.getElementById("profile-name");
    const emailEl = document.getElementById("profile-email");
    const avatarEl = document.getElementById("profile-avatar");
    const logoutBtn = document.getElementById("btn-logout");

    if (nameEl) nameEl.textContent = user.name || "Atelier Member";
    if (emailEl) emailEl.textContent = user.email || "";
    if (avatarEl) {
        const initial = (user.name ? user.name[0] : (user.email ? user.email[0] : "A")).toUpperCase();
        avatarEl.textContent = initial;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("stylehub_user");
            showToast("Signed out successfully", "👋");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 800);
        });
    }
}

async function loadCustomerOrders(user) {
    const container = document.getElementById("profile-orders-container");
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/api/orders?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
            customerOrders = await response.json();
        }
    } catch (e) {
        console.warn("Backend offline, loading local orders fallback:", e);
    }

    // If API returned nothing or offline, check localStorage
    if (!customerOrders || customerOrders.length === 0) {
        const localOrders = JSON.parse(localStorage.getItem("stylehub_orders")) || [];
        customerOrders = localOrders.filter(o => 
            !o.email || o.email.toLowerCase() === user.email.toLowerCase()
        );

        // Also check lastOrder
        const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
        if (lastOrder && (!lastOrder.email || lastOrder.email.toLowerCase() === user.email.toLowerCase())) {
            if (!customerOrders.some(o => o.orderId === lastOrder.orderId)) {
                customerOrders.unshift(lastOrder);
            }
        }
    }

    renderOrders(customerOrders);
}

function getStepState(orderStatus, stepName) {
    const status = (orderStatus || "Pending").toLowerCase();
    const steps = ["placed", "processing", "shipped", "out for delivery", "delivered"];
    
    let activeIndex = 0;
    if (status === "pending" || status === "placed") activeIndex = 0;
    else if (status === "processing") activeIndex = 1;
    else if (status === "shipped") activeIndex = 2;
    else if (status === "out for delivery") activeIndex = 3;
    else if (status === "delivered") activeIndex = 4;

    const stepIndex = steps.indexOf(stepName.toLowerCase());
    if (stepIndex < activeIndex) return "completed";
    if (stepIndex === activeIndex) return "active";
    return "";
}

function renderOrders(orders) {
    const container = document.getElementById("profile-orders-container");
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
                <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">🛍️</span>
                <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem;">No acquisitions yet</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">You have not placed any orders with this account yet.</p>
                <a href="product.html" class="btn-primary">Explore The Spring Collection <span>→</span></a>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map((order, idx) => {
        const orderId = order.order_id ? `#SH-2026-${order.order_id}` : (order.orderId || `#SH-2026-${order.id || 1001}`);
        const total = Number(order.total) || 0;
        const status = order.status || "Pending";
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (order.date || "Recent");
        const address = order.address || "Flagship Delivery";

        return `
            <div class="customer-order-card">
                <div class="order-card-header">
                    <div>
                        <strong style="font-size: 1.1rem; display: block; margin-bottom: 0.2rem;">${orderId}</strong>
                        <span style="color: var(--text-muted); font-size: 0.82rem;">Placed on ${dateStr}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="status-tag ${status.toLowerCase()}">${status}</span>
                        <strong style="font-size: 1.1rem; font-family: var(--font-serif); color: var(--accent-gold);">₹${total.toLocaleString()}</strong>
                    </div>
                </div>

                <!-- Live Tracking Stepper -->
                <div class="tracking-stepper">
                    <div class="tracking-step ${getStepState(status, 'placed')}">
                        <div class="step-marker">1</div>
                        <span class="step-title">Placed</span>
                    </div>
                    <div class="tracking-step ${getStepState(status, 'processing')}">
                        <div class="step-marker">2</div>
                        <span class="step-title">Tailoring</span>
                    </div>
                    <div class="tracking-step ${getStepState(status, 'shipped')}">
                        <div class="step-marker">3</div>
                        <span class="step-title">Dispatched</span>
                    </div>
                    <div class="tracking-step ${getStepState(status, 'out for delivery')}">
                        <div class="step-marker">4</div>
                        <span class="step-title">Out for Delivery</span>
                    </div>
                    <div class="tracking-step ${getStepState(status, 'delivered')}">
                        <div class="step-marker">5</div>
                        <span class="step-title">Delivered</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-top: 1px solid var(--border-light); padding-top: 1.2rem; font-size: 0.86rem;">
                    <div style="color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem;">
                        <span>📍 Delivery Destination: <strong>${address}</strong></span>
                        <span style="font-size: 0.8rem;">📲 Registered Mobile: <strong style="color: var(--text-primary);">${order.phone || "+91 (On File)"}</strong> <span style="background: rgba(46,125,50,0.12); color: #2e7d32; font-size: 0.72rem; padding: 2px 8px; border-radius: 999px; font-weight: 600; margin-left: 6px;">✓ Order Placed SMS Sent</span></span>
                    </div>
                    <button type="button" class="btn-secondary" onclick="openInvoiceModal(${idx})" style="padding: 0.45rem 1rem; font-size: 0.82rem;">
                        🧾 View & Print Invoice
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// Invoice Modal Open
window.openInvoiceModal = function(index) {
    const order = customerOrders[index];
    if (!order) return;

    const modal = document.getElementById("invoice-modal");
    if (!modal) return;

    const orderId = order.order_id ? `#SH-2026-${order.order_id}` : (order.orderId || `#SH-2026-${order.id || 1001}`);
    const total = Number(order.total) || 0;
    const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (order.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    
    document.getElementById("inv-order-id").textContent = orderId;
    document.getElementById("inv-date").textContent = `Date: ${dateStr}`;
    document.getElementById("inv-status").textContent = `Status: ${order.status || 'Confirmed'}`;
    document.getElementById("inv-customer-name").textContent = order.customer_name || order.name || "Customer";
    document.getElementById("inv-customer-address").textContent = order.address || "Standard Delivery";
    document.getElementById("inv-customer-phone").textContent = order.phone || "+91 98765 43210";
    document.getElementById("inv-customer-email").textContent = order.email || "";

    document.getElementById("inv-subtotal").textContent = `₹${total.toLocaleString()}`;
    document.getElementById("inv-grand-total").textContent = `₹${total.toLocaleString()}`;

    // Itemized table
    const tbody = document.getElementById("inv-items-body");
    if (tbody) {
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            tbody.innerHTML = order.items.map(item => {
                const qty = item.quantity || 1;
                const price = Number(item.price) || 0;
                return `
                    <tr>
                        <td>${item.name} ${item.size ? `(Size ${item.size})` : ''}</td>
                        <td style="text-align: center;">${qty}</td>
                        <td style="text-align: right;">₹${price.toLocaleString()}</td>
                        <td style="text-align: right;">₹${(price * qty).toLocaleString()}</td>
                    </tr>
                `;
            }).join("");
        } else {
            tbody.innerHTML = `
                <tr>
                    <td>Curated Atelier Selection • Order Package</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">₹${total.toLocaleString()}</td>
                    <td style="text-align: right;">₹${total.toLocaleString()}</td>
                </tr>
            `;
        }
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
};

window.closeInvoiceModal = function() {
    const modal = document.getElementById("invoice-modal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const user = checkAuth();
    if (user) {
        initProfileHeader(user);
        loadCustomerOrders(user);
    }
});
