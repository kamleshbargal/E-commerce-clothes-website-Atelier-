/**
 * StyleHub Haute Atelier - Checkout Logic with Interactive Payment Simulation & Invoice
 */

const CHECKOUT_API_BASE = (window.location.port === "5500") 
    ? "http://127.0.0.1:5000" 
    : (window.location.origin.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000");

let selectedPayment = "card";
let checkoutDiscount = 0;
let checkoutCouponCode = "";
let currentCheckoutTotal = 0;
let upiCountdownInterval = null;
let lastPlacedOrderData = null;

function getCartItems() {
    return JSON.parse(localStorage.getItem("stylehub_cart")) || 
           JSON.parse(localStorage.getItem("cart")) || [];
}

function initCheckoutPage() {
    const cart = getCartItems();
    const itemsList = document.getElementById("checkout-items-list");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const discountRow = document.getElementById("checkout-discount-row");
    const discountEl = document.getElementById("checkout-discount");
    const shippingEl = document.getElementById("checkout-shipping");
    const totalEl = document.getElementById("checkout-total");
    const speedSelect = document.getElementById("delivery-speed");

    // Autofill user details if logged in
    const user = JSON.parse(localStorage.getItem("stylehub_user"));
    if (user) {
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        if (nameInput && !nameInput.value) nameInput.value = user.name || "";
        if (emailInput && !emailInput.value) emailInput.value = user.email || "";
    }

    if (!itemsList) return;

    if (cart.length === 0) {
        itemsList.innerHTML = `
            <div style="padding: 1.5rem 0; color: var(--text-secondary); text-align: center;">
                <p>Your shopping bag is empty.</p>
                <a href="index.html" class="btn-secondary" style="margin-top: 1rem; display: inline-block;">Return to Shop</a>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    itemsList.innerHTML = cart.map(item => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        subtotal += price * qty;

        return `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; font-size: 0.88rem;">
                <div style="display: flex; align-items: center; gap: 0.8rem;">
                    <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 58px; object-fit: cover; border-radius: var(--radius-xs);">
                    <div>
                        <strong style="display: block; font-size: 0.84rem;">${item.name}</strong>
                        <span style="font-size: 0.74rem; color: var(--text-muted);">Size: ${item.size || 'M'} × ${qty}</span>
                    </div>
                </div>
                <strong>₹${(price * qty).toLocaleString()}</strong>
            </div>
        `;
    }).join("");

    // Check saved coupon
    let discountAmt = 0;
    const savedCoupon = JSON.parse(localStorage.getItem("stylehub_coupon"));
    const activeBadge = document.getElementById("coupon-active-status");
    const feedback = document.getElementById("coupon-feedback");
    const input = document.getElementById("coupon-code-input");

    if (savedCoupon && savedCoupon.code) {
        checkoutCouponCode = savedCoupon.code;
        if (input) input.value = checkoutCouponCode;
        if (activeBadge) {
            activeBadge.style.display = "inline-block";
            activeBadge.textContent = `✓ ${checkoutCouponCode} Applied`;
        }
        if (feedback) {
            feedback.style.display = "block";
            feedback.style.color = "#15803d";
            const sv = savedCoupon.discount_amount ? ` (Saved ₹${Number(savedCoupon.discount_amount).toLocaleString()})` : "";
            feedback.innerHTML = `<strong>✓ Coupon ${checkoutCouponCode} active${sv}</strong> <a href="javascript:void(0)" onclick="removeCoupon()" style="color: #dc2626; margin-left: 0.6rem; text-decoration: underline; font-weight: 600;">Remove Coupon</a>`;
        }
    } else {
        checkoutCouponCode = "";
        if (activeBadge) activeBadge.style.display = "none";
        if (feedback) feedback.style.display = "none";
    }

    function recalculateTotals() {
        discountAmt = 0;
        const coupon = JSON.parse(localStorage.getItem("stylehub_coupon"));
        if (coupon) {
            if (coupon.type === "fixed" && coupon.discount_amount) {
                discountAmt = Math.min(Number(coupon.discount_amount), subtotal);
            } else if (coupon.discount_amount) {
                discountAmt = Math.min(Number(coupon.discount_amount), subtotal);
            } else if (coupon.discount) {
                discountAmt = Math.round(subtotal * (Number(coupon.discount) / 100));
            }
        }

        if (discountAmt > 0) {
            if (discountRow && discountEl) {
                discountRow.style.display = "flex";
                discountEl.textContent = `-₹${discountAmt.toLocaleString()}`;
            }
        } else {
            if (discountRow) discountRow.style.display = "none";
        }

        const isExpress = speedSelect && speedSelect.value === "express";
        let shippingCost = 0;
        if (isExpress) {
            shippingCost = 150;
            if (shippingEl) shippingEl.textContent = "₹150 (Express)";
        } else {
            shippingCost = subtotal >= 1999 ? 0 : 100;
            if (shippingEl) shippingEl.textContent = shippingCost === 0 ? "Complimentary Express" : "₹100";
        }

        currentCheckoutTotal = Math.max(0, subtotal - discountAmt + shippingCost);
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
        if (totalEl) totalEl.textContent = `₹${currentCheckoutTotal.toLocaleString()}`;
        
        updateUpiQrCode(currentCheckoutTotal);
        return currentCheckoutTotal;
    }

    if (speedSelect) {
        speedSelect.addEventListener("change", recalculateTotals);
    }

    recalculateTotals();

    // Render multiple coupons for customer shopping
    renderCheckoutCoupons(subtotal, savedCoupon);
}

// --------------------------------------------------------------------------
// MULTI-COUPONS RENDERER & SWITCHER
// --------------------------------------------------------------------------
async function renderCheckoutCoupons(subtotal, activeCoupon) {
    const deck = document.getElementById("available-coupons-deck");
    const countBadge = document.getElementById("coupons-counter-badge");
    if (!deck) return;

    let availableCoupons = [];
    let isFestiveActive = false;

    try {
        const res = await fetch(`${CHECKOUT_API_BASE}/api/festive-sale`);
        if (res.ok) {
            const data = await res.json();
            isFestiveActive = data.active;
            availableCoupons = data.available_coupons || [];
        }
    } catch (e) {
        console.warn("Using offline available coupons:", e);
    }

    // Comprehensive offline fallback if empty
    if (!availableCoupons || availableCoupons.length === 0) {
        availableCoupons = [
            { code: "NAVRATRI20", discount_type: "percent", discount_value: 20, min_order: 0, description: "🌸 Navratri Festive Special: Extra 20% OFF", is_festive: true },
            { code: "DIWALI25", discount_type: "percent", discount_value: 25, min_order: 0, description: "🪔 Extra 25% Diwali Dhamaka celebration discount", is_festive: true },
            { code: "WELCOME10", discount_type: "percent", discount_value: 10, min_order: 0, description: "10% Welcome bonus on all atelier orders", is_festive: false },
            { code: "ATELIER15", discount_type: "percent", discount_value: 15, min_order: 1499, description: "15% Off couture orders above ₹1,499", is_festive: false },
            { code: "FESTIVE500", discount_type: "fixed", discount_value: 500, min_order: 1999, description: "Flat ₹500 Off on grand orders above ₹1,999", is_festive: false },
            { code: "STYLE10", discount_type: "percent", discount_value: 10, min_order: 0, description: "10% Off everyday wardrobe essentials", is_festive: false }
        ];
    }

    if (countBadge) {
        countBadge.textContent = `${availableCoupons.length} Offers Available`;
    }

    const activeCode = (activeCoupon && activeCoupon.code) ? activeCoupon.code.toUpperCase() : "";

    deck.innerHTML = availableCoupons.map(c => {
        const isApplied = activeCode === c.code.toUpperCase();
        const minOrder = Number(c.min_order) || 0;
        const isEligible = subtotal >= minOrder;
        const isPercent = c.discount_type === "percent" || c.discount_type === "percentage";
        const valText = isPercent ? `${Math.round(c.discount_value)}% OFF` : `₹${Math.round(c.discount_value)} OFF`;
        const needed = Math.max(0, minOrder - subtotal);

        let cardClass = "coupon-card";
        if (isApplied) {
            cardClass += " applied";
        } else if (c.is_festive) {
            cardClass += " festive";
        } else if (!isEligible) {
            cardClass += " disabled";
        }

        let actionBtnHtml = "";
        if (isApplied) {
            actionBtnHtml = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: #15803d; display: flex; align-items: center; gap: 0.2rem;">
                        <span>✓</span> Applied
                    </span>
                    <button type="button" class="coupon-btn-remove" onclick="removeCoupon()">
                        ✕ Remove
                    </button>
                </div>
            `;
        } else if (isEligible) {
            actionBtnHtml = `
                <button type="button" class="coupon-btn-apply" onclick="applyCouponCode('${c.code}')">
                    Apply Coupon
                </button>
            `;
        } else {
            actionBtnHtml = `
                <div style="font-size: 0.7rem; color: var(--text-muted); text-align: right;">
                    🔒 Add ₹${needed.toLocaleString()} more
                </div>
            `;
        }

        const festiveTag = c.is_festive ? `<span style="font-size: 0.66rem; background: #ea580c; color: #ffffff; padding: 0.1rem 0.38rem; border-radius: 3px; font-weight: 700; margin-left: 0.3rem; text-transform: uppercase;">Festive Offer</span>` : "";

        return `
            <div class="${cardClass}">
                <div class="coupon-card-content">
                    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.2rem; margin-bottom: 0.2rem;">
                        <span class="coupon-card-badge">${c.code}</span>
                        <span class="coupon-card-discount">${valText}</span>
                        ${festiveTag}
                    </div>
                    <div class="coupon-card-desc">
                        ${c.description || "Special savings voucher"}
                        ${minOrder > 0 ? ` <span style="color: var(--text-secondary);">(Min. order ₹${minOrder.toLocaleString()})</span>` : ""}
                    </div>
                </div>
                <div class="coupon-card-action">
                    ${actionBtnHtml}
                </div>
            </div>
        `;
    }).join("");
}

window.removeCoupon = function() {
    localStorage.removeItem("stylehub_coupon");
    const input = document.getElementById("coupon-code-input");
    const feedback = document.getElementById("coupon-feedback");
    if (input) input.value = "";
    if (feedback) feedback.style.display = "none";
    if (typeof showToast === "function") showToast("Coupon removed. Choose a new offer below!", "🎟️");
    initCheckoutPage();
};

window.applyCouponCode = async function(explicitCode) {
    const input = document.getElementById("coupon-code-input");
    const feedback = document.getElementById("coupon-feedback");
    const code = (explicitCode || (input ? input.value : "")).trim().toUpperCase();

    if (!code) {
        if (feedback) {
            feedback.style.display = "block";
            feedback.style.color = "var(--accent-terracotta)";
            feedback.textContent = "Please enter or select a coupon code.";
        }
        return;
    }

    if (input) input.value = code;

    const cart = getCartItems();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

    try {
        const res = await fetch(`${CHECKOUT_API_BASE}/api/coupons/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, subtotal })
        });
        const data = await res.json();
        if (res.ok && data.valid) {
            localStorage.setItem("stylehub_coupon", JSON.stringify({
                code: data.code,
                discount: data.discount_value,
                discount_amount: data.discount_amount,
                type: data.discount_type
            }));
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.color = "#15803d";
                feedback.innerHTML = `✓ ${data.message} <a href="javascript:void(0)" onclick="removeCoupon()" style="color: #dc2626; margin-left: 0.5rem; text-decoration: underline;">Remove</a>`;
            }
            if (typeof showToast === "function") showToast(data.message, "🎉");
            initCheckoutPage();
            return;
        } else {
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.color = "var(--accent-terracotta)";
                feedback.textContent = data.message || "Invalid coupon code.";
            }
        }
    } catch (e) {
        // Fallback offline verification for all festive & standard coupons
        const offlineDic = {
            "WELCOME10": { type: "percent", val: 10, min: 0 },
            "ATELIER15": { type: "percent", val: 15, min: 1499 },
            "STYLE10": { type: "percent", val: 10, min: 0 },
            "FESTIVE500": { type: "fixed", val: 500, min: 1999 },
            "NAVRATRI20": { type: "percent", val: 20, min: 0 },
            "DIWALI25": { type: "percent", val: 25, min: 0 },
            "HOLI20": { type: "percent", val: 20, min: 0 },
            "EID20": { type: "percent", val: 20, min: 0 },
            "NEWYEAR30": { type: "percent", val: 30, min: 0 },
            "FREEDOM20": { type: "percent", val: 20, min: 0 }
        };

        if (code in offlineDic) {
            const conf = offlineDic[code];
            if (subtotal < conf.min) {
                const diff = conf.min - subtotal;
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.style.color = "var(--accent-terracotta)";
                    feedback.textContent = `Coupon ${code} requires minimum order of ₹${conf.min.toLocaleString()}. Add ₹${diff.toLocaleString()} more!`;
                }
                return;
            }
            const discAmt = conf.type === "percent" ? Math.round(subtotal * (conf.val / 100)) : Math.min(conf.val, subtotal);
            localStorage.setItem("stylehub_coupon", JSON.stringify({
                code: code,
                discount: conf.val,
                discount_amount: discAmt,
                type: conf.type
            }));
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.color = "#15803d";
                feedback.innerHTML = `✓ Coupon ${code} applied! Saved ₹${discAmt.toLocaleString()} <a href="javascript:void(0)" onclick="removeCoupon()" style="color: #dc2626; margin-left: 0.5rem; text-decoration: underline;">Remove</a>`;
            }
            if (typeof showToast === "function") showToast(`Coupon ${code} applied!`, "🎉");
            initCheckoutPage();
            return;
        } else {
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.color = "var(--accent-terracotta)";
                feedback.textContent = "Invalid or expired coupon code. Select one of the available offers below!";
            }
        }
    }
};

// --------------------------------------------------------------------------
// PAYMENT METHOD TABS & SIMULATION
// --------------------------------------------------------------------------
function initPaymentTabs() {
    const tabs = document.querySelectorAll(".payment-tab");
    const cardPanel = document.getElementById("payment-card-panel");
    const upiPanel = document.getElementById("payment-upi-panel");
    const codPanel = document.getElementById("payment-cod-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            selectedPayment = tab.dataset.payment;

            if (cardPanel) cardPanel.style.display = selectedPayment === "card" ? "block" : "none";
            if (upiPanel) {
                upiPanel.style.display = selectedPayment === "upi" ? "block" : "none";
                if (selectedPayment === "upi") {
                    startUpiTimer();
                    updateUpiQrCode(currentCheckoutTotal);
                }
            }
            if (codPanel) codPanel.style.display = selectedPayment === "cod" ? "block" : "none";
        });
    });

    initCardFormatters();
}

function updateUpiQrCode(amount) {
    const qrImg = document.getElementById("upi-qr-img");
    if (!qrImg) return;

    // Check if store owner configured custom PhonePe scanner in Admin
    const customQrImg = localStorage.getItem("stylehub_custom_qr_image");
    const customUpiId = localStorage.getItem("stylehub_custom_upi_id");

    const upiDisplay = document.getElementById("upi-id-val") || document.querySelector(".upi-id-pill span");
    if (upiDisplay) {
        upiDisplay.textContent = customUpiId || "stylehub@okhdfcbank";
    }

    if (customQrImg) {
        // Display uploaded personal PhonePe QR code scanner image from Admin
        qrImg.src = customQrImg;
    } else {
        // Check if an image file exists in the images folder
        const checkPng = new Image();
        checkPng.onload = () => {
            qrImg.src = "../images/phonepe-qr.png";
        };
        checkPng.onerror = () => {
            const checkJpg = new Image();
            checkJpg.onload = () => {
                qrImg.src = "../images/phonepe-qr.jpg";
            };
            checkJpg.onerror = () => {
                // Dynamically generate QR code pointing to custom UPI ID or default
                const cleanAmt = amount || 2499;
                const upiId = customUpiId || "stylehub@okhdfcbank";
                const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=StyleHub+Atelier&am=${cleanAmt}&cu=INR`;
                qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;
            };
            checkJpg.src = "../images/phonepe-qr.jpg";
        };
        checkPng.src = "../images/phonepe-qr.png";
    }
}

function startUpiTimer() {
    if (upiCountdownInterval) clearInterval(upiCountdownInterval);
    let secondsLeft = 300; // 5 minutes
    const timerEl = document.getElementById("upi-timer");

    upiCountdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            clearInterval(upiCountdownInterval);
            if (timerEl) timerEl.textContent = "Expired. Regenerating...";
            updateUpiQrCode(currentCheckoutTotal);
            startUpiTimer();
            return;
        }

        const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
        const secs = String(secondsLeft % 60).padStart(2, "0");
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
}

window.copyUpiId = function() {
    const customUpiId = localStorage.getItem("stylehub_custom_upi_id") || "stylehub@okhdfcbank";
    navigator.clipboard.writeText(customUpiId).then(() => {
        showToast("UPI VPA copied to clipboard!", "📋");
    }).catch(() => {
        showToast(`UPI ID: ${customUpiId}`, "📋");
    });
};

window.simulateUpiApproval = function() {
    showToast("UPI Payment Approved by Bank!", "✓");
    selectedPayment = "upi";
    const form = document.getElementById("checkout-form");
    if (form) {
        // Trigger submit
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
};

function initCardFormatters() {
    const cardNum = document.getElementById("card-num");
    const cardExp = document.getElementById("card-exp");
    const cardBrand = document.getElementById("card-brand");

    if (cardNum) {
        cardNum.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "").substring(0, 16);
            let formatted = val.match(/.{1,4}/g)?.join("  ") || val;
            e.target.value = formatted;

            // Brand detection
            if (cardBrand) {
                if (val.startsWith("4")) {
                    cardBrand.textContent = "VISA";
                    cardBrand.style.color = "#1a1f71";
                } else if (/^5[1-5]/.test(val)) {
                    cardBrand.textContent = "MASTERCARD";
                    cardBrand.style.color = "#eb001b";
                } else if (/^60|^65|^81/.test(val)) {
                    cardBrand.textContent = "RUPAY";
                    cardBrand.style.color = "#107c41";
                } else if (/^3[47]/.test(val)) {
                    cardBrand.textContent = "AMEX";
                    cardBrand.style.color = "#007bc1";
                } else {
                    cardBrand.textContent = "CARD";
                    cardBrand.style.color = "var(--text-secondary)";
                }
            }
        });
    }

    if (cardExp) {
        cardExp.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "").substring(0, 4);
            if (val.length >= 3) {
                e.target.value = `${val.substring(0, 2)}/${val.substring(2)}`;
            } else {
                e.target.value = val;
            }
        });
    }
}

// --------------------------------------------------------------------------
// REGISTERED MOBILE SMS NOTIFICATION & CHIME
// --------------------------------------------------------------------------
function playSmsChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === "suspended") {
            ctx.resume();
        }
        const now = ctx.currentTime;

        // Note 1: Clean crisp bell (830 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(830, now);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.28);

        // Note 2: Melodic finish (1250 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1250, now + 0.1);
        gain2.gain.setValueAtTime(0.25, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.55);
    } catch (e) {
        // AudioContext silent fallback
    }
}

let smsBannerTimeout = null;

function formatDisplayPhone(raw) {
    if (!raw) return "+91 98765 43210";
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) {
        return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
    }
    if (digits.length === 12 && digits.startsWith("91")) {
        return `+${digits.substring(0, 2)} ${digits.substring(2, 7)} ${digits.substring(7)}`;
    }
    return raw.startsWith("+") ? raw : `+91 ${raw}`;
}

function showSmsPushNotification(phone, orderId, total) {
    const banner = document.getElementById("sms-push-banner");
    const phoneEl = document.getElementById("sms-push-phone");
    const textEl = document.getElementById("sms-push-text");

    const formattedPhone = formatDisplayPhone(phone);
    if (phoneEl) phoneEl.textContent = formattedPhone;
    if (textEl) {
        textEl.textContent = `Order ${orderId} (₹${Number(total).toLocaleString()}) is successfully placed!`;
    }

    if (banner) {
        banner.classList.add("active");
        playSmsChime();

        if (smsBannerTimeout) clearTimeout(smsBannerTimeout);
        smsBannerTimeout = setTimeout(() => {
            banner.classList.remove("active");
        }, 6500);
    }
}

window.closeSmsBanner = function() {
    const banner = document.getElementById("sms-push-banner");
    if (banner) banner.classList.remove("active");
    if (smsBannerTimeout) clearTimeout(smsBannerTimeout);
};

window.resendOrderSMS = function() {
    const order = lastPlacedOrderData || JSON.parse(localStorage.getItem("lastOrder"));
    if (!order) return;

    if (typeof showToast === "function") {
        showToast(`SMS re-dispatched to ${order.phone}!`, "📲");
    }
    showSmsPushNotification(order.phone, order.orderId, order.total);

    const timeEl = document.getElementById("modal-sms-time");
    if (timeEl) {
        timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

// --------------------------------------------------------------------------
// PINCODE AUTO-LOOKUP & ADDRESS AUTO-FILL
// --------------------------------------------------------------------------
function initPincodeLookup() {
    const pinInput = document.getElementById("pincode");
    const cityInput = document.getElementById("city");
    const stateInput = document.getElementById("state");
    const statusEl = document.getElementById("pincode-status");
    const hintEl = document.getElementById("pincode-hint");
    if (!pinInput) return;

    let lastLookedUpPin = "";

    pinInput.addEventListener("input", async e => {
        let val = e.target.value.replace(/\D/g, "").slice(0, 6);
        e.target.value = val;

        if (val.length < 6) {
            if (statusEl) statusEl.style.display = "none";
            if (hintEl) hintEl.style.display = "none";
            return;
        }

        if (val === lastLookedUpPin) return;
        lastLookedUpPin = val;

        if (statusEl) {
            statusEl.style.display = "block";
            statusEl.style.color = "var(--accent-gold, #c5a059)";
            statusEl.textContent = "Locating...";
        }

        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
            if (!res.ok) throw new Error("Lookup failed");
            const data = await res.json();

            if (Array.isArray(data) && data[0] && data[0].Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
                const po = data[0].PostOffice[0];
                const district = po.District || po.Block || po.Division || "";
                const state = po.State || "";
                const area = po.Name || "";

                if (cityInput && district) {
                    cityInput.value = district;
                    cityInput.style.borderColor = "#10b981";
                    setTimeout(() => { cityInput.style.borderColor = ""; }, 2500);
                }
                if (stateInput && state) {
                    stateInput.value = state;
                    stateInput.style.borderColor = "#10b981";
                    setTimeout(() => { stateInput.style.borderColor = ""; }, 2500);
                }

                if (statusEl) {
                    statusEl.style.color = "#10b981";
                    statusEl.textContent = "✓ Verified";
                }

                if (hintEl) {
                    hintEl.style.display = "block";
                    hintEl.style.color = "#10b981";
                    hintEl.textContent = `📍 ${area ? area + ", " : ""}${district}, ${state}`;
                }

                if (typeof showToast === "function") {
                    showToast(`Delivery area verified: ${district}, ${state}`, "📍");
                }
            } else {
                if (statusEl) {
                    statusEl.style.color = "#f59e0b";
                    statusEl.textContent = "⚠️ Unverified";
                }
                if (hintEl) {
                    hintEl.style.display = "block";
                    hintEl.style.color = "#f59e0b";
                    hintEl.textContent = "Could not auto-detect area. Please type your City & State manually.";
                }
            }
        } catch (err) {
            if (statusEl) {
                statusEl.style.color = "#888";
                statusEl.textContent = "Manual";
            }
        }
    });
}

// --------------------------------------------------------------------------
// ORDER FORM SUBMISSION & INVOICE GENERATION
// --------------------------------------------------------------------------
function initOrderSubmission() {
    const form = document.getElementById("checkout-form");
    const messageEl = document.getElementById("message");
    const phoneInput = document.getElementById("phone");

    // Strictly enforce 10 digits only
    if (phoneInput) {
        phoneInput.addEventListener("input", e => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
        });
    }

    if (!form) return;

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const cart = getCartItems();

        if (cart.length === 0) {
            if (messageEl) {
                messageEl.textContent = "Your shopping bag is empty. Please add pieces before checking out.";
                messageEl.style.color = "var(--accent-terracotta)";
            }
            return;
        }

        const rawPhone = (document.getElementById("phone").value || "").replace(/\D/g, "").trim();
        if (rawPhone.length !== 10) {
            if (messageEl) {
                messageEl.textContent = "Please enter a valid 10-digit mobile number.";
                messageEl.style.color = "var(--accent-terracotta)";
            }
            document.getElementById("phone").focus();
            return;
        }
        const fullPhone = `+91 ${rawPhone}`;

        const totalDisplay = document.getElementById("checkout-total");
        const totalNum = totalDisplay ? Number(totalDisplay.textContent.replace(/[^\d]/g, "")) : 0;

        const orderData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: fullPhone,
            address: `${document.getElementById("address").value.trim()}, ${document.getElementById("city").value.trim()}${document.getElementById("state") && document.getElementById("state").value.trim() ? ', ' + document.getElementById("state").value.trim() : ''} - ${document.getElementById("pincode").value.trim()}`,
            paymentMethod: selectedPayment,
            total: totalNum,
            items: cart,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };

        if (messageEl) {
            messageEl.textContent = "Securing transaction with Atelier Bank...";
            messageEl.style.color = "var(--accent-gold-hover)";
        }

        let orderId = `#SH-2026-${Math.floor(10000 + Math.random() * 90000)}`;

        try {
            const response = await fetch(`${CHECKOUT_API_BASE}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: orderData.name,
                    email: orderData.email,
                    phone: orderData.phone,
                    address: orderData.address,
                    total: orderData.total
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.order_id) {
                    orderId = `#SH-2026-${result.order_id}`;
                }
            }
        } catch (error) {
            console.log("Recorded in local offline store.");
        }

        lastPlacedOrderData = {
            ...orderData,
            orderId: orderId,
            status: "Pending"
        };

        // Save into local store for profile & admin
        localStorage.setItem("lastOrder", JSON.stringify(lastPlacedOrderData));
        const existingOrders = JSON.parse(localStorage.getItem("stylehub_orders")) || [];
        existingOrders.unshift(lastPlacedOrderData);
        localStorage.setItem("stylehub_orders", JSON.stringify(existingOrders));

        // Clear Cart & Coupon
        localStorage.removeItem("stylehub_cart");
        localStorage.removeItem("cart");
        localStorage.removeItem("stylehub_coupon");
        if (typeof updateHeaderBadges === "function") updateHeaderBadges();

        // Show Success Modal
        const modal = document.getElementById("order-success-modal");
        const orderIdEl = document.getElementById("modal-order-id");
        const orderTotalEl = document.getElementById("modal-order-total");

        if (orderIdEl) orderIdEl.textContent = orderId;
        if (orderTotalEl) orderTotalEl.textContent = `₹${totalNum.toLocaleString()}`;

        // Populate Registered Mobile SMS Alert Card
        const phoneFormatted = formatDisplayPhone(orderData.phone);
        const modalPhoneEl = document.getElementById("modal-registered-phone");
        const modalSmsOrderEl = document.getElementById("modal-sms-order-id");
        const modalSmsTotalEl = document.getElementById("modal-sms-order-total");
        const modalSmsTimeEl = document.getElementById("modal-sms-time");
        const modalWhatsappBtn = document.getElementById("modal-whatsapp-btn");

        if (modalPhoneEl) modalPhoneEl.textContent = phoneFormatted;
        if (modalSmsOrderEl) modalSmsOrderEl.textContent = orderId;
        if (modalSmsTotalEl) modalSmsTotalEl.textContent = `₹${totalNum.toLocaleString()}`;
        if (modalSmsTimeEl) {
            modalSmsTimeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // WhatsApp Confirmation Link
        if (modalWhatsappBtn) {
            const digits = orderData.phone.replace(/\D/g, "");
            const intl = digits.length === 10 ? `91${digits}` : digits;
            const waText = `StyleHub Atelier: Hello ${orderData.name}! Your Order ${orderId} for ₹${totalNum.toLocaleString()} is successfully placed! We are carefully tailoring and preparing your shipment. Track updates anytime at StyleHub.`;
            modalWhatsappBtn.href = `https://api.whatsapp.com/send?phone=${intl}&text=${encodeURIComponent(waText)}`;
        }

        if (modal) {
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        // Trigger realistic SMS Push notification banner
        showSmsPushNotification(orderData.phone, orderId, totalNum);

        if (messageEl) messageEl.textContent = "";
        form.reset();
    });
}

// --------------------------------------------------------------------------
// PRINTABLE LUXURY INVOICE MODAL
// --------------------------------------------------------------------------
window.openPrintableInvoiceModal = function() {
    const order = lastPlacedOrderData || JSON.parse(localStorage.getItem("lastOrder"));
    if (!order) return;

    const modal = document.getElementById("checkout-invoice-modal");
    if (!modal) return;

    document.getElementById("chk-inv-id").textContent = order.orderId || "#SH-2026-1001";
    document.getElementById("chk-inv-date").textContent = `Date: ${order.date || new Date().toLocaleDateString()}`;
    document.getElementById("chk-inv-name").textContent = order.name || "Customer";
    document.getElementById("chk-inv-address").textContent = order.address || "Standard Delivery";
    document.getElementById("chk-inv-phone").textContent = order.phone || "";
    document.getElementById("chk-inv-email").textContent = order.email || "";

    const total = Number(order.total) || 0;
    document.getElementById("chk-inv-subtotal").textContent = `₹${total.toLocaleString()}`;
    document.getElementById("chk-inv-total").textContent = `₹${total.toLocaleString()}`;

    const tbody = document.getElementById("chk-inv-items-body");
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
};

window.closePrintableInvoiceModal = function() {
    const modal = document.getElementById("checkout-invoice-modal");
    if (modal) {
        modal.classList.remove("active");
    }
};

window.resendOrderSMS = function() {
    const order = lastPlacedOrderData || JSON.parse(localStorage.getItem("lastOrder"));
    if (!order) {
        if (typeof showToast === "function") showToast("No recent order found to resend SMS", "ℹ️");
        return;
    }
    showSmsPushNotification(order.phone, order.orderId, Number(order.total) || 0);
    if (typeof showToast === "function") showToast(`Order confirmation SMS resent to ${order.phone}!`, "📱");
};

document.addEventListener("DOMContentLoaded", () => {
    initCheckoutPage();
    initPaymentTabs();
    initPincodeLookup();
    initOrderSubmission();
});