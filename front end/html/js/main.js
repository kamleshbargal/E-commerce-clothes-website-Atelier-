/**
 * StyleHub Haute Atelier - Global Shared Utilities
 */

const API_URL = (window.location.port === "5500") 
    ? "http://127.0.0.1:5000" 
    : (window.location.origin.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000");

// Toast notification helper
function showToast(message, icon = "✨") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// Update header badges (Cart & Wishlist)
function updateHeaderBadges() {
    const cart = JSON.parse(localStorage.getItem("stylehub_cart")) || 
                 JSON.parse(localStorage.getItem("cart")) || [];
    const wishlist = JSON.parse(localStorage.getItem("stylehub_wishlist")) || [];

    const totalQty = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const cartBadges = document.querySelectorAll(".cart-count-badge");
    cartBadges.forEach(badge => {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? "flex" : "none";
    });

    const wishlistBadges = document.querySelectorAll(".wishlist-count-badge");
    wishlistBadges.forEach(badge => {
        badge.textContent = wishlist.length;
        badge.style.display = wishlist.length > 0 ? "flex" : "none";
    });
}

// Header scroll effect
function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 30) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

// Form message handler
function showFormMessage(form, message, isError = true) {
    let messageElement = form.querySelector(".form-message");
    if (!messageElement) {
        messageElement = document.createElement("p");
        messageElement.className = "form-message";
        form.appendChild(messageElement);
    }
    messageElement.textContent = message;
    messageElement.classList.toggle("error", isError);
    messageElement.classList.toggle("success", !isError);
}

// Unified Auth Form Submission
async function submitAuthForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const isRegister = form.id === "register-form";
    const email = form.querySelector("#email") ? form.querySelector("#email").value.trim() : "";
    const password = form.querySelector("#password") ? form.querySelector("#password").value : "";
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : "Submit";

    if (!email || !email.includes("@")) {
        showFormMessage(form, "Please enter a valid email address.", true);
        return;
    }
    if (password.length < 6) {
        showFormMessage(form, "Password must contain at least 6 characters.", true);
        return;
    }

    const payload = { email, password };
    if (isRegister) {
        const nameInput = form.querySelector("#name");
        payload.name = nameInput ? nameInput.value.trim() : "Valued Customer";
        if (payload.name.length < 2) {
            showFormMessage(form, "Name must contain at least 2 characters.", true);
            return;
        }
    }

    // Disable button & show loading indicator
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Processing...</span>`;
    }

    try {
        const endpoint = isRegister ? "/api/register" : "/api/login";
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        let result = {};
        try {
            result = await response.json();
        } catch (e) {
            result = { message: "Unexpected server response." };
        }

        if (!response.ok) {
            showFormMessage(form, result.message || "An error occurred. Please try again.", true);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
            return;
        }

        const successMsg = result.message || (isRegister ? "Account created successfully! Welcome to the Atelier." : "Welcome back!");
        showFormMessage(form, successMsg, false);
        showToast(successMsg, "✨");

        // Save session strictly as customer
        const userName = (result.user && result.user.name) || result.name || payload.name || "Customer";
        localStorage.setItem("stylehub_user", JSON.stringify({ email, name: userName, role: "customer" }));

        // Store into registered users directory
        const usersList = JSON.parse(localStorage.getItem("stylehub_users")) || [];
        if (!usersList.some(u => u.email === email)) {
            usersList.unshift({
                id: (result.user && result.user.id) || Date.now(),
                name: userName,
                email: email,
                role: userRole,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            localStorage.setItem("stylehub_users", JSON.stringify(usersList));
        }

        setTimeout(() => {
            window.location.href = "profile.html";
        }, 1200);
    } catch (error) {
        // Fallback for standalone preview when backend is not actively running
        console.warn("Backend offline, saving user locally:", error);
        const demoName = isRegister ? payload.name : (email.split("@")[0] || "Valued Customer");
        const userRole = "customer";
        localStorage.setItem("stylehub_user", JSON.stringify({ email, name: demoName, role: userRole }));
        showFormMessage(form, `${isRegister ? "Account created successfully" : "Welcome back, " + demoName}! (Atelier VIP Mode)`, false);
        showToast("Welcome to StyleHub Atelier!", "✨");
        setTimeout(() => {
            window.location.href = "profile.html";
        }, 1200);
    }
}


// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const nav = document.querySelector(".nav-desktop");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = nav.classList.toggle("mobile-active");
        toggle.setAttribute("aria-expanded", isOpen);
        toggle.innerHTML = isOpen ? `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        ` : `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains("mobile-active")) {
            nav.classList.remove("mobile-active");
            toggle.setAttribute("aria-expanded", "false");
            toggle.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;
        }
    });

    // Close when clicking any nav link
    nav.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("mobile-active");
            toggle.setAttribute("aria-expanded", "false");
            toggle.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;
        });
    });
}

// Update user header button and admin badge based on session
function initUserHeaderBtn() {
    const userBtn = document.getElementById("header-user-btn");
    const user = JSON.parse(localStorage.getItem("stylehub_user"));
    if (userBtn && user) {
        userBtn.href = "profile.html";
        userBtn.title = `Profile (${user.name || 'Member'})`;
        userBtn.style.position = "relative";
        
        let dot = userBtn.querySelector(".auth-active-dot");
        if (!dot) {
            dot = document.createElement("span");
            dot.className = "auth-active-dot";
            dot.style.cssText = "position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent-emerald); border: 2px solid var(--bg-surface);";
            userBtn.appendChild(dot);
        }
    }
}

// Custom announcement ticker support with Festive Sale Integration
async function initAnnouncementTicker() {
    const bar = document.querySelector(".announcement-bar");
    const items = document.querySelectorAll(".marquee-item");
    if (!items.length) return;

    let bannerText = localStorage.getItem("stylehub_announcement");
    let isFestive = false;

    try {
        const res = await fetch("/api/festive-sale");
        if (res.ok) {
            const data = await res.json();
            if (data.active && data.banner_text) {
                bannerText = data.banner_text;
                isFestive = true;
            }
        }
    } catch (e) {
        // Continue with localStorage or default
    }

    if (bannerText) {
        if (bar && isFestive) {
            bar.classList.add("festive-active");
        }
        items.forEach(item => {
            item.innerHTML = `
                <span>${bannerText}</span>
                <span class="highlight">•</span>
                <span>COMPLIMENTARY EXPRESS COURIER OVER ₹1,999</span>
                <span class="highlight">•</span>
                <span>USE CODE <strong class="highlight">WELCOME10</strong> FOR 10% OFF</span>
                <span class="highlight">•</span>
                <span>${bannerText}</span>
                <span class="highlight">•</span>
                <span>100% ETHICAL LUXURY FIBERS</span>
            `;
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateHeaderBadges();
    initHeaderScroll();
    initMobileMenu();
    initUserHeaderBtn();
    initAnnouncementTicker();

    document.querySelectorAll("#login-form, #register-form").forEach(form => {
        form.addEventListener("submit", submitAuthForm);
    });
});
