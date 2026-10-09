/**
 * StyleHub Haute Atelier - AI Personal Fashion Stylist Widget
 * Powered by Atelier AI & Catalog Recommender
 */

(function() {
    // Do not mount on admin management consoles
    if (window.location.pathname.includes("admin") || window.location.href.includes("admin")) {
        return;
    }

    const STYLIST_API_BASE = (window.location.port === "5500") 
        ? "http://127.0.0.1:5000" 
        : (window.location.origin.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000");

    let isChatOpen = false;
    let chatHistory = [];

    // Inject CSS styles for the AI Stylist
    const styles = `
        /* AI Stylist Floating Trigger Button */
        #atelier-ai-trigger {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 999990;
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #182029 0%, #0e1319 100%);
            border: 1.5px solid rgba(197, 160, 89, 0.6);
            border-radius: 999px;
            color: #ffffff;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(197, 160, 89, 0.25);
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            font-size: 0.88rem;
            font-weight: 700;
            letter-spacing: 0.03em;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
        }
        #atelier-ai-trigger:hover {
            transform: translateY(-4px) scale(1.04);
            border-color: #f3e5ab;
            box-shadow: 0 16px 38px rgba(0, 0, 0, 0.55), 0 0 30px rgba(197, 160, 89, 0.45);
        }
        .ai-pulse-dot {
            width: 9px;
            height: 9px;
            background: #86efac;
            border-radius: 50%;
            box-shadow: 0 0 10px #86efac;
            display: inline-block;
            animation: aiPulse 2s infinite ease-in-out;
        }
        @keyframes aiPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.35); opacity: 0.7; }
        }

        /* Chat Window Container */
        #atelier-ai-chatbox {
            position: fixed;
            bottom: 92px;
            right: 28px;
            width: 390px;
            max-width: calc(100vw - 36px);
            height: 580px;
            max-height: calc(100vh - 120px);
            background: #0e1319;
            border: 1.5px solid rgba(197, 160, 89, 0.45);
            border-radius: 18px;
            z-index: 999995;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(197, 160, 89, 0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(12px);
        }
        #atelier-ai-chatbox.open {
            display: flex;
            animation: chatSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes chatSlideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Chat Header */
        .ai-chat-header {
            padding: 1rem 1.25rem;
            background: linear-gradient(135deg, #151b23 0%, #10151c 100%);
            border-bottom: 1px solid rgba(197, 160, 89, 0.25);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .ai-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .ai-avatar {
            width: 38px;
            height: 38px;
            border-radius: 11px;
            background: rgba(197, 160, 89, 0.15);
            border: 1.5px solid rgba(197, 160, 89, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
        }
        .ai-title-wrap h4 {
            margin: 0;
            font-size: 0.95rem;
            color: #ffffff;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .ai-title-wrap span {
            font-size: 0.72rem;
            color: #c5a059;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .ai-close-btn {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .ai-close-btn:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
        }

        /* Chat Messages Body */
        .ai-chat-body {
            flex: 1;
            overflow-y: auto;
            padding: 1.2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background: radial-gradient(circle at 50% 10%, rgba(197, 160, 89, 0.05) 0%, transparent 80%);
        }
        .ai-chat-body::-webkit-scrollbar {
            width: 5px;
        }
        .ai-chat-body::-webkit-scrollbar-thumb {
            background: rgba(197, 160, 89, 0.25);
            border-radius: 4px;
        }

        /* Message Bubbles */
        .ai-msg {
            display: flex;
            flex-direction: column;
            max-width: 86%;
            font-size: 0.86rem;
            line-height: 1.52;
            word-break: break-word;
        }
        .ai-msg.bot {
            align-self: flex-start;
        }
        .ai-msg.user {
            align-self: flex-end;
        }
        .ai-bubble {
            padding: 0.85rem 1.1rem;
            border-radius: 14px;
        }
        .ai-msg.bot .ai-bubble {
            background: #141b24;
            border: 1px solid rgba(197, 160, 89, 0.22);
            color: #e2e8f0;
            border-bottom-left-radius: 4px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }
        .ai-msg.user .ai-bubble {
            background: linear-gradient(135deg, #c5a059 0%, #aa8640 100%);
            color: #0b0f14;
            font-weight: 600;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 14px rgba(197, 160, 89, 0.2);
        }

        /* Quick Suggestion Chips */
        .ai-chips-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 0.6rem;
        }
        .ai-chip {
            background: rgba(197, 160, 89, 0.1);
            border: 1px solid rgba(197, 160, 89, 0.35);
            color: #f3e5ab;
            font-size: 0.74rem;
            padding: 5px 11px;
            border-radius: 999px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
        }
        .ai-chip:hover {
            background: var(--accent-gold, #c5a059);
            color: #0b0f14;
            transform: translateY(-2px);
        }

        /* Product Recommendation Cards in Chat */
        .ai-products-deck {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 0.75rem;
            width: 100%;
        }
        .ai-product-card {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #10161f;
            border: 1px solid rgba(197, 160, 89, 0.25);
            border-radius: 10px;
            padding: 8px 10px;
            transition: all 0.2s;
        }
        .ai-product-card:hover {
            border-color: #c5a059;
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
        }
        .ai-product-card img {
            width: 52px;
            height: 52px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            flex-shrink: 0;
        }
        .ai-prod-info {
            flex: 1;
            min-width: 0;
        }
        .ai-prod-title {
            font-size: 0.8rem;
            font-weight: 600;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
        }
        .ai-prod-price {
            font-size: 0.82rem;
            font-weight: 700;
            color: #c5a059;
            margin-top: 2px;
        }
        .ai-add-bag-btn {
            background: rgba(197, 160, 89, 0.15);
            border: 1px solid rgba(197, 160, 89, 0.45);
            color: #f3e5ab;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 5px 9px;
            border-radius: 6px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .ai-add-bag-btn:hover {
            background: #c5a059;
            color: #0b0f14;
        }

        /* Typing Indicator */
        .ai-typing {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 0.7rem 1rem;
            background: #141b24;
            border: 1px solid rgba(197, 160, 89, 0.2);
            border-radius: 14px;
            width: fit-content;
        }
        .ai-typing-dot {
            width: 6px;
            height: 6px;
            background: #c5a059;
            border-radius: 50%;
            animation: typingBounce 1.4s infinite ease-in-out;
        }
        .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
        }

        /* Chat Input Footer */
        .ai-chat-footer {
            padding: 0.85rem 1rem;
            background: #10151c;
            border-top: 1px solid rgba(197, 160, 89, 0.2);
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .ai-input {
            flex: 1;
            background: #090d12;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 999px;
            color: #ffffff;
            padding: 0.65rem 1.1rem;
            font-size: 0.84rem;
            outline: none;
            transition: all 0.2s;
        }
        .ai-input:focus {
            border-color: rgba(197, 160, 89, 0.7);
            box-shadow: 0 0 10px rgba(197, 160, 89, 0.15);
        }
        .ai-send-btn {
            background: linear-gradient(135deg, #c5a059 0%, #aa8640 100%);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            color: #0b0f14;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        .ai-send-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 0 12px rgba(197, 160, 89, 0.4);
        }

        /* Mobile full-width adjustments */
        @media (max-width: 480px) {
            #atelier-ai-trigger {
                bottom: 20px;
                right: 20px;
                padding: 10px 16px;
                font-size: 0.82rem;
            }
            #atelier-ai-chatbox {
                right: 14px;
                bottom: 80px;
                width: calc(100vw - 28px);
                height: 520px;
            }
        }
    `;

    // Append CSS to head
    const styleTag = document.createElement("style");
    styleTag.id = "atelier-ai-stylist-styles";
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    // Create Markup
    function mountWidget() {
        if (document.getElementById("atelier-ai-root")) return;

        const root = document.createElement("div");
        root.id = "atelier-ai-root";

        root.innerHTML = `
            <!-- Floating Trigger Button -->
            <div id="atelier-ai-trigger" title="Ask Atelier AI Stylist for recommendations">
                <span class="ai-pulse-dot"></span>
                <span>✨ AI Stylist</span>
            </div>

            <!-- Chat Window Drawer -->
            <div id="atelier-ai-chatbox">
                <div class="ai-chat-header">
                    <div class="ai-header-left">
                        <div class="ai-avatar">👑</div>
                        <div class="ai-title-wrap">
                            <h4>Atelier AI Stylist</h4>
                            <span><span class="ai-pulse-dot" style="width: 6px; height: 6px;"></span> Personal Fashion Advisor</span>
                        </div>
                    </div>
                    <button type="button" class="ai-close-btn" id="btn-close-ai-chat" title="Close Advisor">✕</button>
                </div>

                <div class="ai-chat-body" id="ai-chat-messages">
                    <!-- Initial Welcome Message -->
                    <div class="ai-msg bot">
                        <div class="ai-bubble">
                            <strong>Namaste! ✨ Welcome to StyleHub Atelier.</strong><br><br>
                            Main aapka personal AI fashion advisor hoon. Kisi bhi event, budget, ya style ke liye outfit advice chahiye toh mujhe batayein!
                        </div>
                        <div class="ai-chips-wrap">
                            <span class="ai-chip" onclick="window.sendStylistQuery('Party & Gala Look')">✨ Party & Festive</span>
                            <span class="ai-chip" onclick="window.sendStylistQuery('Casual Everyday Outfits')">👗 Casual Chic</span>
                            <span class="ai-chip" onclick="window.sendStylistQuery('Clothes under ₹2,000')">💰 Under ₹2,000</span>
                            <span class="ai-chip" onclick="window.sendStylistQuery('Winter Jackets & Outerwear')">❄️ Winter Jackets</span>
                        </div>
                    </div>
                </div>

                <form class="ai-chat-footer" id="ai-chat-form" onsubmit="window.handleStylistSubmit(event)">
                    <input type="text" id="ai-user-input" class="ai-input" placeholder="Ask styling advice (e.g. 'Party outfit under ₹2500')..." autocomplete="off">
                    <button type="submit" class="ai-send-btn" id="btn-ai-send" title="Send query">➔</button>
                </form>
            </div>
        `;

        document.body.appendChild(root);

        // Attach event listeners
        const triggerBtn = document.getElementById("atelier-ai-trigger");
        const closeBtn = document.getElementById("btn-close-ai-chat");
        const chatBox = document.getElementById("atelier-ai-chatbox");

        triggerBtn.addEventListener("click", () => {
            isChatOpen = !isChatOpen;
            if (isChatOpen) {
                chatBox.classList.add("open");
                document.getElementById("ai-user-input")?.focus();
            } else {
                chatBox.classList.remove("open");
            }
        });

        closeBtn.addEventListener("click", () => {
            isChatOpen = false;
            chatBox.classList.remove("open");
        });
    }

    // Add To Cart helper directly from AI Chat
    window.addGarmentFromAiChat = function(id, name, price, image, category) {
        let cart = JSON.parse(localStorage.getItem("stylehub_cart")) || 
                   JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find(it => String(it.id) === String(id));
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: Number(price),
                image: image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=85",
                category: category || "Apparel",
                quantity: 1,
                size: "M"
            });
        }

        localStorage.setItem("stylehub_cart", JSON.stringify(cart));
        localStorage.setItem("cart", JSON.stringify(cart));

        if (typeof updateHeaderBadges === "function") {
            updateHeaderBadges();
        }
        if (typeof showToast === "function") {
            showToast(`Added ${name} to your Bag! 🛍️`, "✨");
        } else {
            alert(`Added ${name} to your Bag! 🛍️`);
        }
    };

    // Send query to AI backend
    window.sendStylistQuery = async function(query) {
        const input = document.getElementById("ai-user-input");
        if (input) input.value = query;
        window.handleStylistSubmit();
    };

    window.handleStylistSubmit = async function(e) {
        if (e) e.preventDefault();
        const input = document.getElementById("ai-user-input");
        const messagesWrap = document.getElementById("ai-chat-messages");
        if (!input || !messagesWrap) return;

        const text = input.value.trim();
        if (!text) return;

        input.value = "";

        // Append user bubble
        const userMsg = document.createElement("div");
        userMsg.className = "ai-msg user";
        userMsg.innerHTML = `<div class="ai-bubble">${escapeHtml(text)}</div>`;
        messagesWrap.appendChild(userMsg);

        // Append typing indicator
        const typingEl = document.createElement("div");
        typingEl.className = "ai-typing";
        typingEl.id = "ai-active-typing";
        typingEl.innerHTML = `
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
        `;
        messagesWrap.appendChild(typingEl);
        messagesWrap.scrollTop = messagesWrap.scrollHeight;

        try {
            const res = await fetch(`${STYLIST_API_BASE}/api/ai/stylist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, history: chatHistory })
            });

            const data = await res.json();
            typingEl.remove();

            if (res.ok && data) {
                chatHistory.push({ user: text, reply: data.reply });

                const botMsg = document.createElement("div");
                botMsg.className = "ai-msg bot";

                let formattedReply = escapeHtml(data.reply).replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");

                // Build products cards deck
                let productsHtml = "";
                if (Array.isArray(data.products) && data.products.length > 0) {
                    productsHtml = `
                        <div class="ai-products-deck">
                            ${data.products.map(p => `
                                <div class="ai-product-card">
                                    <img src="${p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80'}" alt="${p.name}">
                                    <div class="ai-prod-info">
                                        <span class="ai-prod-title" title="${p.name}">${p.name}</span>
                                        <div class="ai-prod-price">₹${Number(p.price).toLocaleString()}</div>
                                    </div>
                                    <button type="button" class="ai-add-bag-btn" onclick="addGarmentFromAiChat('${p.id}', '${escapeAttr(p.name)}', ${p.price}, '${escapeAttr(p.image)}', '${escapeAttr(p.category)}')">
                                        + Add 🛍️
                                    </button>
                                </div>
                            `).join("")}
                        </div>
                    `;
                }

                // Build follow-up quick chips
                let chipsHtml = "";
                if (Array.isArray(data.suggested_chips) && data.suggested_chips.length > 0) {
                    chipsHtml = `
                        <div class="ai-chips-wrap">
                            ${data.suggested_chips.map(chip => `
                                <span class="ai-chip" onclick="window.sendStylistQuery('${escapeAttr(chip)}')">${chip}</span>
                            `).join("")}
                        </div>
                    `;
                }

                botMsg.innerHTML = `
                    <div class="ai-bubble">${formattedReply}</div>
                    ${productsHtml}
                    ${chipsHtml}
                `;

                messagesWrap.appendChild(botMsg);
            } else {
                throw new Error("Invalid response");
            }
        } catch (err) {
            typingEl.remove();
            const errorMsg = document.createElement("div");
            errorMsg.className = "ai-msg bot";
            errorMsg.innerHTML = `
                <div class="ai-bubble">
                    StyleHub catalog me look match kar raha hoon... ✨ Aap hamare collection me jackets, festive sarees, aur premium shirts dekh sakte hain!
                </div>
            `;
            messagesWrap.appendChild(errorMsg);
        }

        messagesWrap.scrollTop = messagesWrap.scrollHeight;
    };

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttr(str) {
        if (!str) return "";
        return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
    }

    // Auto mount when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountWidget);
    } else {
        mountWidget();
    }
})();
