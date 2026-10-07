/**
 * StyleHub Haute Atelier - Dedicated Shopping Bag Page Logic
 */

let cartPageDiscount = 0;
let cartPageCoupon = "";

function getCartData() {
    return JSON.parse(localStorage.getItem("stylehub_cart")) || 
           JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCartData(cart) {
    localStorage.setItem("stylehub_cart", JSON.stringify(cart));
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateHeaderBadges === "function") updateHeaderBadges();
    renderCartPage();
}

function renderCartPage() {
    const container = document.getElementById("cart-items-container");
    const subtotalEl = document.getElementById("cart-subtotal-display");
    const discountRow = document.getElementById("cart-discount-row");
    const discountEl = document.getElementById("cart-discount-display");
    const shippingEl = document.getElementById("cart-shipping-display");
    const totalEl = document.getElementById("cart-total-display");
    const checkoutLink = document.getElementById("checkout-link");

    if (!container) return;

    const cart = getCartData();

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem;">
                <p style="font-size: 3rem; margin-bottom: 1rem;">🛍️</p>
                <h2 style="font-size: 2rem; margin-bottom: 0.6rem;">Your bag is currently empty</h2>
                <p style="color: var(--text-secondary); max-width: 420px; margin: 0 auto 2rem;">
                    Discover our newest arrivals crafted for texture, durability, and timeless presence.
                </p>
                <a href="index.html#collection" class="btn-primary">Explore Spring Drop <span>→</span></a>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = "₹0";
        if (discountRow) discountRow.style.display = "none";
        if (totalEl) totalEl.textContent = "₹0";
        if (checkoutLink) {
            checkoutLink.style.pointerEvents = "none";
            checkoutLink.style.opacity = "0.5";
        }
        return;
    }

    if (checkoutLink) {
        checkoutLink.style.pointerEvents = "auto";
        checkoutLink.style.opacity = "1";
    }

    let subtotal = 0;

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            ${cart.map((item, idx) => {
                const qty = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const lineTotal = price * qty;
                subtotal += lineTotal;

                return `
                    <article class="cart-item" style="border-radius: var(--radius-sm); justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 100px; object-fit: cover; border-radius: var(--radius-xs);">
                            <div>
                                <span style="font-size: 0.72rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">${item.category || 'Atelier'}</span>
                                <h3 style="font-size: 1.1rem; margin: 0.2rem 0 0.3rem;">${item.name}</h3>
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem;">Size: <strong>${item.size || 'M'}</strong></p>
                                <strong style="font-size: 1rem; color: var(--text-primary);">₹${price.toLocaleString()}</strong>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 2rem;">
                            <div class="qty-stepper">
                                <button class="qty-btn" onclick="modifyQuantity(${idx}, -1)">−</button>
                                <span class="qty-display">${qty}</span>
                                <button class="qty-btn" onclick="modifyQuantity(${idx}, 1)">+</button>
                            </div>

                            <div style="text-align: right; min-width: 80px;">
                                <div style="font-weight: 700; font-size: 1.05rem;">₹${lineTotal.toLocaleString()}</div>
                                <button class="btn-remove-item" onclick="deleteCartItem(${idx})" style="margin-top: 0.4rem;">Remove</button>
                            </div>
                        </div>
                    </article>
                `;
            }).join("")}
        </div>
    `;

    // Calculate Totals
    let discountAmount = 0;
    if (cartPageDiscount > 0) {
        discountAmount = Math.round(subtotal * (cartPageDiscount / 100));
        if (discountRow && discountEl) {
            discountRow.style.display = "flex";
            discountEl.textContent = `-₹${discountAmount.toLocaleString()}`;
        }
    } else {
        if (discountRow) discountRow.style.display = "none";
    }

    const shipping = subtotal >= 1999 ? 0 : 150;
    if (shippingEl) {
        shippingEl.textContent = shipping === 0 ? "Complimentary Express" : `₹${shipping}`;
    }

    const grandTotal = subtotal - discountAmount + shipping;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `₹${grandTotal.toLocaleString()}`;
}

function modifyQuantity(index, delta) {
    const cart = getCartData();
    if (!cart[index]) return;
    cart[index].quantity = (Number(cart[index].quantity) || 1) + delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCartData(cart);
}

function deleteCartItem(index) {
    const cart = getCartData();
    cart.splice(index, 1);
    saveCartData(cart);
    if (typeof showToast === "function") showToast("Item removed from your bag", "🗑️");
}

async function initCartPromo() {
    const btn = document.getElementById("apply-promo-btn-page");
    const input = document.getElementById("promo-input-page");
    const appliedRow = document.getElementById("cart-applied-coupon-row");
    const chipsContainer = document.getElementById("cart-quick-coupons");
    if (!btn || !input) return;

    // Check saved coupon
    const saved = JSON.parse(localStorage.getItem("stylehub_coupon"));
    if (saved && saved.code) {
        cartPageDiscount = Number(saved.discount) || 0;
        cartPageCoupon = saved.code;
        input.value = saved.code;
        if (appliedRow) {
            appliedRow.style.display = "block";
            appliedRow.innerHTML = `✓ Active: <strong>${saved.code}</strong> (${saved.discount}% off) <a href="javascript:void(0)" onclick="removeCartCoupon()" style="color: #dc2626; margin-left: 0.6rem; text-decoration: underline;">Remove</a>`;
        }
    } else {
        cartPageDiscount = 0;
        cartPageCoupon = null;
        if (appliedRow) appliedRow.style.display = "none";
    }

    // Render quick coupons
    if (chipsContainer) {
        let coupons = [
            { code: "NAVRATRI20", label: "🌸 NAVRATRI20 (20% OFF)", festive: true },
            { code: "DIWALI25", label: "🪔 DIWALI25 (25% OFF)", festive: true },
            { code: "WELCOME10", label: "🎟️ WELCOME10 (10% OFF)", festive: false },
            { code: "ATELIER15", label: "✨ ATELIER15 (15% OFF)", festive: false },
            { code: "STYLE10", label: "👗 STYLE10 (10% OFF)", festive: false }
        ];

        try {
            const res = await fetch("/api/festive-sale");
            if (res.ok) {
                const data = await res.json();
                if (data.available_coupons && data.available_coupons.length > 0) {
                    coupons = data.available_coupons.slice(0, 5).map(c => ({
                        code: c.code,
                        label: `${c.is_festive ? "🪔 " : "🎟️ "}${c.code} (${Math.round(c.discount_value)}% OFF)`,
                        festive: c.is_festive
                    }));
                }
            }
        } catch (e) {
            // Use defaults
        }

        chipsContainer.innerHTML = coupons.map(c => `
            <button type="button" onclick="applyCartCoupon('${c.code}')" style="font-size: 0.72rem; font-weight: 700; padding: 0.28rem 0.6rem; border-radius: 4px; border: 1px solid ${c.festive ? 'var(--accent-gold)' : 'var(--border-medium)'}; background: ${c.festive ? '#fffdf7' : '#ffffff'}; color: ${c.festive ? '#9a6b1f' : 'var(--text-primary)'}; cursor: pointer; transition: all 0.2s ease;">
                ${c.label}
            </button>
        `).join("");
    }

    btn.addEventListener("click", () => {
        applyCartCoupon(input.value.trim().toUpperCase());
    });
}

window.removeCartCoupon = function() {
    localStorage.removeItem("stylehub_coupon");
    cartPageDiscount = 0;
    cartPageCoupon = null;
    const input = document.getElementById("promo-input-page");
    if (input) input.value = "";
    if (typeof showToast === "function") showToast("Coupon removed", "🎟️");
    renderCartPage();
    initCartPromo();
};

window.applyCartCoupon = async function(code) {
    if (!code) return;
    const input = document.getElementById("promo-input-page");
    if (input) input.value = code;

    const cart = getCartData();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

    try {
        const res = await fetch("/api/coupons/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, subtotal })
        });
        const data = await res.json();
        if (res.ok && data.valid) {
            cartPageDiscount = Number(data.discount_value);
            cartPageCoupon = data.code;
            localStorage.setItem("stylehub_coupon", JSON.stringify({
                code: data.code,
                discount: data.discount_value,
                discount_amount: data.discount_amount,
                type: data.discount_type
            }));
            renderCartPage();
            initCartPromo();
            if (typeof showToast === "function") showToast(data.message, "🎉");
            return;
        } else {
            if (typeof showToast === "function") showToast(data.message || "Invalid coupon", "⚠️");
            return;
        }
    } catch (e) {
        // Fallback offline
        const dic = {
            "WELCOME10": 10, "STYLE10": 10, "ATELIER15": 15, "WELCOME15": 15,
            "NAVRATRI20": 20, "DIWALI25": 25, "HOLI20": 20, "EID20": 20, "NEWYEAR30": 30, "FREEDOM20": 20
        };
        if (code in dic) {
            cartPageDiscount = dic[code];
            cartPageCoupon = code;
            localStorage.setItem("stylehub_coupon", JSON.stringify({ code, discount: dic[code], type: "percent" }));
            renderCartPage();
            initCartPromo();
            if (typeof showToast === "function") showToast(`${dic[code]}% discount applied!`, "🎉");
        } else {
            if (typeof showToast === "function") showToast("Invalid voucher code", "⚠️");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    renderCartPage();
    initCartPromo();
});