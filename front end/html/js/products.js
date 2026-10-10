/**
 * StyleHub Haute Atelier - Main Product Catalog & Store Experience
 */

// Curated Luxury Collection
const defaultProducts = [
    {
        id: 1,
        name: "Artisanal Cashmere Knit Sweater",
        category: "Men",
        price: 2499,
        originalPrice: 3499,
        tag: "Bestseller",
        tagClass: "bestseller",
        rating: 4.9,
        reviewsCount: 84,
        sizes: ["S", "M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=85",
        description: "Spun from ultra-fine Mongolian cashmere with ribbed cuffs and a relaxed, structured silhouette. Effortless elegance for cooler days."
    },
    {
        id: 2,
        name: "Structured Minimalist Denim Jacket",
        category: "Men",
        price: 2899,
        originalPrice: 3999,
        tag: "New Drop",
        tagClass: "new",
        rating: 4.8,
        reviewsCount: 52,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=85",
        description: "Heavyweight 14oz Japanese selvedge denim tailored with matte silver hardware and clean, architectural lines."
    },
    {
        id: 3,
        name: "Silk-Blend Pleated Summer Maxi",
        category: "Women",
        price: 3299,
        originalPrice: 4599,
        tag: "Sale -30%",
        tagClass: "sale",
        rating: 5.0,
        reviewsCount: 114,
        sizes: ["XS", "S", "M", "L"],
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=85",
        description: "Breathable mulberry silk and modal blend with delicate sunray pleating and an adjustable sash tie waist."
    },
    {
        id: 4,
        name: "Tailored Organic Linen Shirt",
        category: "Men",
        price: 1699,
        originalPrice: 2199,
        tag: "Classic",
        tagClass: "new",
        rating: 4.7,
        reviewsCount: 39,
        sizes: ["S", "M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
        description: "Pure European certified linen woven for exceptional breathability with mother-of-pearl buttons."
    },
    {
        id: 5,
        name: "Sculpted Ribbed Mockneck Top",
        category: "Women",
        price: 1299,
        originalPrice: 1799,
        tag: "Trending",
        tagClass: "bestseller",
        rating: 4.8,
        reviewsCount: 68,
        sizes: ["XS", "S", "M"],
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=85",
        description: "Ultra-soft micro-modal rib knit designed to fit like a second skin. Perfect standalone or as a luxury layering base."
    },
    {
        id: 6,
        name: "Heirloom Cable Knit Cardigan",
        category: "Women",
        price: 2799,
        originalPrice: 3599,
        tag: "New Drop",
        tagClass: "new",
        rating: 4.9,
        reviewsCount: 47,
        sizes: ["S", "M", "L"],
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=85",
        description: "Intricately woven wool blend with antique horn buttons and slouchy dropped shoulders for warm, quiet luxury."
    },
    {
        id: 7,
        name: "Heritage Wool Overcoat",
        category: "Unisex",
        price: 4999,
        originalPrice: 6599,
        tag: "Limited Drop",
        tagClass: "new",
        rating: 5.0,
        reviewsCount: 29,
        sizes: ["S", "M", "L"],
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=85",
        description: "Double-faced virgin wool blend coat with sharp notch lapels and deep welt pockets. Built to last generations."
    },
    {
        id: 8,
        name: "Monochrome Heavyweight Hoodie",
        category: "Unisex",
        price: 1999,
        originalPrice: 2499,
        tag: "Essential",
        tagClass: "bestseller",
        rating: 4.8,
        reviewsCount: 93,
        sizes: ["S", "M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85",
        description: "480 GSM organic french terry cotton hoodie featuring a seamless double-layered hood and kangaroo front pocket."
    },
    {
        id: 9,
        name: "City Low-Top Italian Leather Sneakers",
        category: "Footwear",
        price: 3499,
        originalPrice: 4999,
        tag: "Bestseller",
        tagClass: "bestseller",
        rating: 4.9,
        reviewsCount: 76,
        sizes: ["40", "41", "42", "43", "44"],
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
        description: "Handcrafted calfskin leather sneaker with vulcanized Margom rubber cupsole and memory foam ergonomic insole."
    },
    {
        id: 10,
        name: "Handcrafted 18K Vermeil Choker",
        category: "Jewellery",
        price: 1899,
        originalPrice: 2699,
        tag: "Trending",
        tagClass: "sale",
        rating: 4.9,
        reviewsCount: 42,
        sizes: ["One Size"],
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85",
        description: "Recycled sterling silver plated in thick 18K yellow gold with a high-polish mirror finish. Hypoallergenic & tarnish-resistant."
    },
    {
        id: 11,
        name: "Little Prince Royal Silk Kurta & Churidar Set",
        category: "Kids",
        price: 1599,
        originalPrice: 2299,
        tag: "Festive Star",
        tagClass: "bestseller",
        rating: 4.9,
        reviewsCount: 54,
        sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
        image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=85",
        description: "Pure Chanderi silk kurta with intricate gold zari thread hand-embroidery on placket, soft cotton lining, and comfortable elasticated churidar."
    },
    {
        id: 12,
        name: "Natural Freshwater Baroque Pearl Earrings",
        category: "Jewellery",
        price: 1599,
        originalPrice: 2299,
        tag: "Handmade",
        tagClass: "bestseller",
        rating: 5.0,
        reviewsCount: 58,
        sizes: ["One Size"],
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85",
        description: "Sustainably cultivated genuine freshwater baroque pearls anchored to 14K gold-filled delicate French ear wires."
    },
    {
        id: 13,
        name: "Princess Rose Blossom Tulle Twirl Gown",
        category: "Kids",
        price: 1799,
        originalPrice: 2599,
        tag: "Party Edit",
        tagClass: "new",
        rating: 5.0,
        reviewsCount: 68,
        sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
        image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=85",
        description: "Multi-layered ethereal dusty rose tulle party gown with hand-sewn petal accents, soft organic cotton lining to prevent itching, and an elegant satin sash bow."
    },
    {
        id: 14,
        name: "Little Explorer Organic Fleece Hoodie & Jogger Set",
        category: "Kids",
        price: 1399,
        originalPrice: 1999,
        tag: "Organic GOTS",
        tagClass: "bestseller",
        rating: 4.8,
        reviewsCount: 43,
        sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=85",
        description: "100% GOTS certified organic combed fleece cotton hoodie & trackpants set. Plant-based non-toxic dyes, ribbed storm cuffs, and ultra-soft brushed interior."
    },
    {
        id: 15,
        name: "Mini Gentleman Linen Shirt & Suspenders Trouser Suit",
        category: "Kids",
        price: 1899,
        originalPrice: 2699,
        tag: "Ceremony Edition",
        tagClass: "new",
        rating: 4.9,
        reviewsCount: 37,
        sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"],
        image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=85",
        description: "Crisp breathable linen-cotton button-down shirt paired with tailored chinos, leather-accented clip suspenders, and an adjustable satin bowtie."
    },
    {
        id: 16,
        name: "Sunshine Garden Tiered Mulmul Twirl Frock",
        category: "Kids",
        price: 1199,
        originalPrice: 1699,
        tag: "Pure Mulmul",
        tagClass: "sale",
        rating: 4.8,
        reviewsCount: 51,
        sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
        image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=800&q=85",
        description: "Featherlight pure Jaipur mulmul cotton frock with hand-block floral print, tiered twirl skirt, and delicate tassel shoulder straps."
    },
    {
        id: 17,
        name: "Junior Aviator Sherpa-Lined Denim Trucker Jacket",
        category: "Kids",
        price: 1999,
        originalPrice: 2899,
        tag: "Winter Trend",
        tagClass: "bestseller",
        rating: 4.9,
        reviewsCount: 49,
        sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"],
        image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=85",
        description: "Heavyweight stone-washed denim lined with plush warm sherpa fleece. Features antique brass snap buttons and dual chest flap pockets."
    },
    {
        id: 18,
        name: "Cozy Woodland Hand-Knit Cable Cardigan",
        category: "Kids",
        price: 1499,
        originalPrice: 2199,
        tag: "Handmade Touch",
        tagClass: "new",
        rating: 5.0,
        reviewsCount: 32,
        sizes: ["1-2Y", "2-3Y", "4-5Y", "6-7Y"],
        image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=800&q=85",
        description: "Chunky honeycomb cable knit in natural oatmeal yarn with hand-carved olive wood buttons. Gentle on sensitive skin and exceptionally warm."
    },
    {
        id: 19,
        name: "Royal Heritage Embroidered Festive Anarkali & Sharara",
        category: "Kids",
        price: 2199,
        originalPrice: 3199,
        tag: "Festive Sparkle",
        tagClass: "bestseller",
        rating: 4.9,
        reviewsCount: 61,
        sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"],
        image: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=800&q=85",
        description: "Rich festive silk Anarkali kurti decorated with gota patti and sequin hand embroidery, paired with a flared flowy sharara and shimmering net dupatta."
    },
    {
        id: 20,
        name: "Vintage Corduroy Overalls & Breton Striped Tee",
        category: "Kids",
        price: 1599,
        originalPrice: 2299,
        tag: "Playwear Hit",
        tagClass: "sale",
        rating: 4.8,
        reviewsCount: 38,
        sizes: ["2-3Y", "4-5Y", "6-7Y"],
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=85",
        description: "Soft caramel baby-rib corduroy overalls with adjustable buckle straps and brass hardware, teamed with a 100% cotton maritime striped tee."
    },
    {
        id: 21,
        name: "Scarlet Celebration Ruffled Twirl Dress",
        category: "Kids",
        price: 1449,
        originalPrice: 2099,
        tag: "Celebration",
        tagClass: "new",
        rating: 4.9,
        reviewsCount: 45,
        sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
        image: "https://images.unsplash.com/photo-1577975882846-431adc8c2009?auto=format&fit=crop&w=800&q=85",
        description: "Vibrant ruby red celebration twirl dress with tiered flutter sleeves, smocked elastic bodice, and a full flare hem that swings delightfully with every spin."
    },
    {
        id: 22,
        name: "Little Parisian Trench Coat & Beret Ensemble",
        category: "Kids",
        price: 2399,
        originalPrice: 3499,
        tag: "Haute Edition",
        tagClass: "new",
        rating: 5.0,
        reviewsCount: 27,
        sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"],
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=85",
        description: "Classic double-breasted sand beige waterproof cotton gabardine trench coat featuring tortoiseshell buttons, storm flaps, and removable matching belt."
    },
    {
        id: 23,
        name: "Pastel Blossom Cotton Kurta & Pyjama Set",
        category: "Kids",
        price: 1299,
        originalPrice: 1799,
        tag: "Festive Casual",
        tagClass: "bestseller",
        rating: 4.8,
        reviewsCount: 36,
        sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
        image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85",
        description: "Delicate mint-green organic cotton mandarin collar kurta with intricate thread detailing on placket, paired with elasticated easy-pull white pyjamas."
    }
];

let catalogProducts = [...defaultProducts];
let selectedCategory = "All";
let searchQuery = "";
let selectedSort = "featured";
let activeHeroSlide = 0;
let heroSlideTimer = null;
let appliedDiscount = 0; // percentage
let appliedCouponCode = "";

// FREE Shipping Threshold
const FREE_SHIPPING_THRESHOLD = 1999;

// State management in localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("stylehub_cart")) || 
           JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("stylehub_cart", JSON.stringify(cart));
    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateHeaderBadges === "function") updateHeaderBadges(true);
    renderCartDrawer();
}

function getWishlist() {
    return JSON.parse(localStorage.getItem("stylehub_wishlist")) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem("stylehub_wishlist", JSON.stringify(wishlist));
    if (typeof updateHeaderBadges === "function") updateHeaderBadges();
    renderProducts();
}

// Category matching helper
function isMatchCategory(itemCategory, targetCategory) {
    if (!targetCategory || targetCategory === "All") return true;

    const itemCat = (itemCategory || "").trim().toLowerCase();
    const target = targetCategory.trim().toLowerCase();

    // 1. Kids target
    if (target === "kids") {
        return itemCat.includes("kid") || itemCat.includes("child") || itemCat.includes("baby") || itemCat.includes("infant") || itemCat.includes("junior");
    }

    // 2. Strict exclusion: If item is Kids, NEVER show under Men, Women, or Unisex
    if (itemCat.includes("kid") || itemCat.includes("child") || itemCat.includes("baby") || itemCat.includes("infant") || itemCat.includes("junior")) {
        return false;
    }

    if (target === "women") {
        return itemCat.includes("women") || itemCat.includes("saree") || itemCat.includes("dress") || itemCat.includes("anarkali") || itemCat.includes("gown") || itemCat.includes("skirt");
    }

    if (target === "men") {
        // STRICT: If it contains 'women', it is NEVER men!
        if (itemCat.includes("women")) return false;
        return itemCat === "men" || itemCat.startsWith("men ") || itemCat.startsWith("men-") || itemCat.includes(" men") || itemCat.includes("t-shirt") || itemCat.includes("jeans") || itemCat.includes("chino") || itemCat.includes("suit");
    }

    if (target === "unisex") {
        return itemCat.includes("unisex") || itemCat.includes("hoodie") || itemCat.includes("winterwear");
    }

    if (target === "footwear") {
        return itemCat.includes("footwear") || itemCat.includes("shoe") || itemCat.includes("sneaker") || itemCat.includes("sandal") || itemCat.includes("boot");
    }

    if (target === "jewellery") {
        return itemCat.includes("jewel") || itemCat.includes("watch") || itemCat.includes("earring") || itemCat.includes("chain") || itemCat.includes("ring");
    }

    return itemCat === target || itemCat.includes(target);
}

window.filterByCategory = function(categoryName) {
    selectedCategory = categoryName || "All";
    document.querySelectorAll(".filter-pill").forEach(p => {
        if (p.dataset.category && p.dataset.category.toLowerCase() === selectedCategory.toLowerCase()) {
            p.classList.add("active");
        } else if (selectedCategory === "All" && p.dataset.category === "All") {
            p.classList.add("active");
        } else {
            p.classList.remove("active");
        }
    });
    renderProducts();

    const collectionEl = document.getElementById("collection") || document.querySelector(".collection-section");
    if (collectionEl) {
        collectionEl.scrollIntoView({ behavior: "smooth" });
    }
};

// --------------------------------------------------------------------------
// RENDER CATALOG
// --------------------------------------------------------------------------
function renderProducts() {
    const container = document.getElementById("products-container");
    const countStatus = document.getElementById("search-status");
    if (!container) return;

    const wishlist = getWishlist();

    let filtered = catalogProducts.filter(item => {
        const catMatch = isMatchCategory(item.category, selectedCategory);

        // Search matching - resilient to query and common typos (e.g. 'swaet' -> 'sweat')
        const normalizedQuery = searchQuery.replace(/swaet/g, "sweat");
        const searchMatch = !searchQuery || 
            item.name.toLowerCase().includes(searchQuery) || 
            item.name.toLowerCase().includes(normalizedQuery) || 
            item.category.toLowerCase().includes(searchQuery) ||
            item.category.toLowerCase().includes(normalizedQuery) ||
            (item.description && (item.description.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(normalizedQuery)));

        return catMatch && searchMatch;
    });

    // Sorting
    if (selectedSort === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    if (countStatus) {
        countStatus.textContent = `Showing ${filtered.length} curated ${filtered.length === 1 ? 'piece' : 'pieces'}`;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-catalog">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </svg>
                <h3>No pieces matched your selection</h3>
                <p>Try exploring another category or clearing your search term.</p>
                <button class="btn-primary" onclick="resetFilters()">View All Collections</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((product, index) => {
        const isWishlisted = wishlist.includes(product.id);
        const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
        const staggerDelay = (index % 4) * 0.08;
        return `
            <article class="product-card reveal-on-scroll" data-id="${product.id}" style="transition-delay: ${staggerDelay}s;">
                <div class="product-thumb-wrap">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85';">
                    ${product.tag ? `<span class="badge-tag ${product.tagClass || 'new'}">${product.tag}</span>` : ''}
                    ${isLowStock ? `<span class="stock-low-badge">⚠️ Only ${product.stock} Left</span>` : ''}
                    <button class="wishlist-toggle-btn ${isWishlisted ? 'active' : ''}" 
                            title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                            onclick="toggleWishlist(${product.id}, event)">
                        ${isWishlisted ? '♥' : '♡'}
                    </button>
                    <button class="quick-view-overlay-btn" onclick="openQuickView(${product.id})">
                        Quick View <span>↗</span>
                    </button>
                </div>
                <div class="product-details">
                    <span class="product-category-sub">${product.category}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        ★ ${(product.rating || 4.8).toFixed(1)} <span>(${product.reviewsCount || 42})</span>
                    </div>
                    <div class="product-card-footer">
                        <div class="price-wrap">
                            <span class="current-price">₹${product.price.toLocaleString()}</span>
                            ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                        </div>
                        <div style="display: flex; gap: 0.4rem; align-items: center;">
                            <button type="button" class="btn-whatsapp-card" onclick="orderOnWhatsApp(${product.id}, event)" title="Order directly on WhatsApp">
                                💬 WhatsApp
                            </button>
                            <button class="btn-add-bag" onclick="quickAddToCart(${product.id}, event)">
                                + Add
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    // Re-observe revealed elements and re-bind interactive lighting sheen
    if (typeof initScrollReveal === "function") initScrollReveal();
    if (typeof initMouseLightingEffect === "function") initMouseLightingEffect();
}

function resetFilters() {
    selectedCategory = "All";
    searchQuery = "";
    selectedSort = "featured";

    document.querySelectorAll(".filter-pill").forEach(pill => {
        pill.classList.toggle("active", pill.dataset.category === "All");
    });
    const searchInput = document.getElementById("product-search");
    if (searchInput) searchInput.value = "";
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.value = "featured";

    renderProducts();
}

// --------------------------------------------------------------------------
// WISHLIST LOGIC
// --------------------------------------------------------------------------
function toggleWishlist(productId, event) {
    if (event) {
        event.stopPropagation();
        const btn = event.currentTarget;
        if (btn) {
            btn.classList.add("heart-popping");
            setTimeout(() => btn.classList.remove("heart-popping"), 420);
        }
    }
    let wishlist = getWishlist();
    const product = catalogProducts.find(p => p.id === productId);
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        if (typeof showToast === "function") showToast(`Removed from your wishlist`, "♡");
        if (typeof triggerFloatingParticle === "function") triggerFloatingParticle(event, "💔");
    } else {
        wishlist.push(productId);
        if (typeof showToast === "function") showToast(`Added to your wishlist`, "♥");
        if (typeof triggerFloatingParticle === "function") triggerFloatingParticle(event, "❤️");
    }
    saveWishlist(wishlist);
}

// --------------------------------------------------------------------------
// CART DRAWER & LOGIC
// --------------------------------------------------------------------------
function quickAddToCart(productId, event) {
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;
    if (typeof triggerFloatingParticle === "function") {
        triggerFloatingParticle(event, "+1 🛍️");
    }
    const defaultSize = (product.sizes && product.sizes.length) ? product.sizes[0] : "Standard";
    addItemToCart(product, defaultSize, 1);
}

function addItemToCart(product, size = "M", quantity = 1) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            size: size,
            quantity: quantity
        });
    }

    saveCart(cart);
    openCartDrawer();
    if (typeof showToast === "function") {
        showToast(`${product.name} added to your bag`, "🛍️");
    }
}

function openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-drawer-backdrop");
    if (drawer && backdrop) {
        drawer.classList.add("active");
        backdrop.classList.add("active");
        document.body.style.overflow = "hidden";
        renderCartDrawer();
    }
}

function closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const backdrop = document.getElementById("cart-drawer-backdrop");
    if (drawer && backdrop) {
        drawer.classList.remove("active");
        backdrop.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function renderCartDrawer() {
    const container = document.getElementById("cart-drawer-items");
    const subtotalEl = document.getElementById("drawer-subtotal");
    const shippingBar = document.getElementById("free-shipping-fill");
    const shippingText = document.getElementById("free-shipping-text");
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
                <p style="font-size: 2.2rem; margin-bottom: 0.8rem;">🛍️</p>
                <h4 style="font-size: 1.3rem; margin-bottom: 0.4rem; color: var(--text-primary);">Your bag is empty</h4>
                <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Explore our curated collection to discover your new everyday signature.</p>
                <button class="btn-primary" onclick="closeCartDrawer()">Explore Pieces</button>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = "₹0";
        if (shippingBar) shippingBar.style.width = "0%";
        if (shippingText) shippingText.innerHTML = `Add <strong>₹${FREE_SHIPPING_THRESHOLD}</strong> more for complimentary delivery.`;
        return;
    }

    let subtotal = 0;
    container.innerHTML = cart.map((item, idx) => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;
        return `
            <div class="cart-drawer-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-variant">Size: ${item.size || 'M'}</span>
                    <span class="cart-item-price">₹${Number(item.price).toLocaleString()}</span>
                    <div class="cart-item-qty-row">
                        <div class="qty-stepper">
                            <button class="qty-btn" onclick="updateItemQuantity(${idx}, -1)">−</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateItemQuantity(${idx}, 1)">+</button>
                        </div>
                        <button class="btn-remove-item" onclick="removeItemFromCart(${idx})">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Promo Discount calculation
    let finalTotal = subtotal;
    if (appliedDiscount > 0) {
        finalTotal = Math.round(subtotal * (1 - appliedDiscount / 100));
    }

    if (subtotalEl) {
        if (appliedDiscount > 0) {
            subtotalEl.innerHTML = `
                <span style="text-decoration: line-through; color: var(--text-muted); font-size: 0.85rem; margin-right: 0.5rem;">₹${subtotal.toLocaleString()}</span>
                <span>₹${finalTotal.toLocaleString()}</span>
                <small style="color: var(--accent-emerald); font-size: 0.75rem; margin-left: 0.4rem;">(${appliedDiscount}% OFF applied)</small>
            `;
        } else {
            subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
        }
    }

    // Free shipping progress bar
    if (shippingBar && shippingText) {
        const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        shippingBar.style.width = `${percent}%`;
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
            shippingText.innerHTML = `✨ <strong>Complimentary Express Delivery unlocked!</strong>`;
        } else {
            const needed = FREE_SHIPPING_THRESHOLD - subtotal;
            shippingText.innerHTML = `Add <strong>₹${needed.toLocaleString()}</strong> more to unlock FREE Express Delivery.`;
        }
    }
}

function updateItemQuantity(index, delta) {
    const cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
}

function removeItemFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    if (typeof showToast === "function") showToast("Item removed from your bag", "🗑️");
}

async function applyCouponCode(codeOverride) {
    const input = document.getElementById("promo-input");
    const code = (codeOverride || (input ? input.value : "")).trim().toUpperCase();
    if (!code) return;

    if (input) input.value = code;

    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

    try {
        const res = await fetch(`/api/coupons/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, subtotal })
        });
        const data = await res.json();
        if (res.ok && data.valid) {
            appliedDiscount = Number(data.discount_value) || 0;
            appliedCouponCode = data.code;
            localStorage.setItem("stylehub_coupon", JSON.stringify({
                code: data.code,
                discount: data.discount_value,
                discount_amount: data.discount_amount,
                type: data.discount_type
            }));
            renderCartDrawer();
            if (typeof showToast === "function") showToast(data.message, "🎉");
            return;
        } else {
            if (typeof showToast === "function") showToast(data.message || "Invalid coupon code", "⚠️");
            return;
        }
    } catch (e) {
        // Fallback offline verification
        const dic = {
            "WELCOME10": 10, "STYLE10": 10, "ATELIER15": 15, "WELCOME15": 15,
            "NAVRATRI20": 20, "DIWALI25": 25, "HOLI20": 20, "EID20": 20, "NEWYEAR30": 30, "FREEDOM20": 20
        };
        if (code in dic) {
            const disc = dic[code];
            appliedDiscount = disc;
            appliedCouponCode = code;
            localStorage.setItem("stylehub_coupon", JSON.stringify({ code, discount: disc, type: "percent" }));
            renderCartDrawer();
            if (typeof showToast === "function") showToast(`${disc}% discount applied for ${code}!`, "🎉");
        } else {
            if (typeof showToast === "function") showToast(`Invalid voucher. Try NAVRATRI20 or WELCOME10`, "⚠️");
        }
    }
}

// --------------------------------------------------------------------------
// QUICK VIEW MODAL
// --------------------------------------------------------------------------
let activeQuickViewProduct = null;
let selectedQuickViewSize = "M";

function openQuickView(productId) {
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;
    activeQuickViewProduct = product;
    selectedQuickViewSize = (product.sizes && product.sizes[0]) || "M";

    const modal = document.getElementById("quick-view-modal");
    if (!modal) return;

    const img = modal.querySelector(".quick-view-image img");
    const title = modal.querySelector(".quick-view-info h2");
    const cat = modal.querySelector(".product-category-sub");
    const currentPrice = modal.querySelector(".current-price");
    const originalPrice = modal.querySelector(".original-price");
    const desc = modal.querySelector(".quick-view-desc");
    const sizesContainer = modal.querySelector(".size-options");

    if (img) img.src = product.image;
    if (title) title.textContent = product.name;
    if (cat) cat.textContent = product.category;
    if (currentPrice) currentPrice.textContent = `₹${product.price.toLocaleString()}`;
    if (originalPrice) {
        originalPrice.textContent = product.originalPrice ? `₹${product.originalPrice.toLocaleString()}` : '';
    }
    if (desc) desc.textContent = product.description;

    if (sizesContainer) {
        sizesContainer.innerHTML = (product.sizes || ["S", "M", "L", "XL"]).map((sz, idx) => `
            <button type="button" class="size-btn ${idx === 0 ? 'active' : ''}" 
                    onclick="selectQuickViewSize('${sz}', this)">
                ${sz}
            </button>
        `).join("");
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function selectQuickViewSize(size, element) {
    selectedQuickViewSize = size;
    document.querySelectorAll("#quick-view-modal .size-btn").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");
}

function closeQuickView() {
    const modal = document.getElementById("quick-view-modal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function addQuickViewToBag() {
    if (activeQuickViewProduct) {
        addItemToCart(activeQuickViewProduct, selectedQuickViewSize, 1);
        closeQuickView();
    }
}

window.orderOnWhatsApp = function(productId, event) {
    if (event) event.stopPropagation();
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;
    const msg = `Hello StyleHub Haute Atelier! I would like to order "${product.name}" for ₹${product.price.toLocaleString()}. Please confirm availability.`;
    window.open(`https://wa.me/919209962961?text=${encodeURIComponent(msg)}`, '_blank');
};

window.orderQuickViewOnWhatsApp = function() {
    if (activeQuickViewProduct) {
        const msg = `Hello StyleHub Haute Atelier! I would like to order "${activeQuickViewProduct.name}" (Size: ${selectedQuickViewSize}) for ₹${activeQuickViewProduct.price.toLocaleString()}. Please confirm availability.`;
        window.open(`https://wa.me/919209962961?text=${encodeURIComponent(msg)}`, '_blank');
    }
};

window.openSizeGuide = function(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById("size-guide-modal");
    if (modal) modal.classList.add("active");
};

window.closeSizeGuide = function() {
    const modal = document.getElementById("size-guide-modal");
    if (modal) modal.classList.remove("active");
};

window.switchSizeTab = function(type) {
    const menTable = document.getElementById("size-table-men");
    const womenTable = document.getElementById("size-table-women");
    const btnMen = document.getElementById("btn-size-men");
    const btnWomen = document.getElementById("btn-size-women");

    if (type === "men") {
        if (menTable) menTable.style.display = "block";
        if (womenTable) womenTable.style.display = "none";
        if (btnMen) btnMen.classList.add("active");
        if (btnWomen) btnWomen.classList.remove("active");
    } else {
        if (menTable) menTable.style.display = "none";
        if (womenTable) womenTable.style.display = "block";
        if (btnMen) btnMen.classList.remove("active");
        if (btnWomen) btnWomen.classList.add("active");
    }
};

// --------------------------------------------------------------------------
// HERO SLIDER CONTROLS
// --------------------------------------------------------------------------
function initHeroSlider() {
    const track = document.getElementById("hero-slider-track");
    const slides = document.querySelectorAll(".hero-slide");
    const dotsContainer = document.getElementById("hero-slider-dots");
    if (!track || slides.length === 0) return;

    if (dotsContainer) {
        dotsContainer.innerHTML = Array.from(slides).map((_, idx) => `
            <div class="slider-dot ${idx === 0 ? 'active' : ''}" onclick="goToHeroSlide(${idx})"></div>
        `).join("");
    }

    startHeroSliderTimer();
}

function goToHeroSlide(index) {
    const track = document.getElementById("hero-slider-track");
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".slider-dot");
    if (!track || slides.length === 0) return;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    activeHeroSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === index);
    });

    resetHeroSliderTimer();
}

function changeHeroSlide(delta) {
    goToHeroSlide(activeHeroSlide + delta);
}

function startHeroSliderTimer() {
    clearInterval(heroSlideTimer);
    heroSlideTimer = setInterval(() => {
        changeHeroSlide(1);
    }, 6000);
}

function resetHeroSliderTimer() {
    clearInterval(heroSlideTimer);
    startHeroSliderTimer();
}

// --------------------------------------------------------------------------
// "STYLE THE LOOK" OUTFIT BUNDLE 1-CLICK ADD
// --------------------------------------------------------------------------
function addFullOutfitBundle() {
    // Adds the 3 complementary outfit pieces
    const itemsToAdd = [
        catalogProducts[0], // Cashmere Knit
        catalogProducts[1], // Selvedge Denim
        catalogProducts[8]  // Italian Sneakers
    ];

    itemsToAdd.forEach(item => {
        if (item) {
            addItemToCart(item, (item.sizes && item.sizes[0]) || "M", 1);
        }
    });

    if (typeof showToast === "function") {
        showToast("Complete Signature Look added to your bag!", "✨");
    }
}

// --------------------------------------------------------------------------
// BACKEND API SYNC (GRACEFUL HYBRID)
// --------------------------------------------------------------------------
async function syncWithBackend() {
    let backendProducts = null;

    // Try primary 127.0.0.1:5000 first, fallback to localhost:5000
    const endpoints = [
        `${window.location.origin}/api/products`,
        "http://127.0.0.1:5000/api/products",
        "http://localhost:5000/api/products"
    ];

    for (const ep of endpoints) {
        try {
            const response = await fetch(ep, {
                headers: { "Accept": "application/json" }
            });
            if (response.ok) {
                backendProducts = await response.json();
                if (Array.isArray(backendProducts) && backendProducts.length > 0) {
                    break;
                }
            }
        } catch (err) {
            // try next
        }
    }

    if (Array.isArray(backendProducts) && backendProducts.length > 0) {
        // Merge backend products with fallback rich fields
        catalogProducts = backendProducts.map((p, idx) => {
            const fallback = defaultProducts[idx % defaultProducts.length];
            const hasValidImage = p.image && (
                p.image.startsWith("http") || 
                p.image.startsWith("data:") || 
                p.image.startsWith("./") || 
                p.image.startsWith("../") || 
                p.image.startsWith("/")
            );

            return {
                id: p.id,
                name: p.name || fallback.name,
                category: p.category || fallback.category,
                price: Number(p.price) || fallback.price,
                originalPrice: p.originalPrice || Math.round(Number(p.price) * 1.35),
                image: hasValidImage ? p.image : fallback.image,
                tag: p.tag || (idx >= defaultProducts.length ? "New Drop" : fallback.tag),
                tagClass: p.tagClass || (idx >= defaultProducts.length ? "new" : fallback.tagClass),
                rating: p.rating || fallback.rating,
                reviewsCount: p.reviewsCount || fallback.reviewsCount,
                sizes: p.sizes || fallback.sizes || ["S", "M", "L", "XL"],
                description: p.description || `${p.name} - Handcrafted luxury essential from the StyleHub Atelier Collection.`
            };
        });
        renderProducts();
    }
}

// --------------------------------------------------------------------------
// INITIALIZATION
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initHeroSlider();
    renderProducts();
    renderCartDrawer();

    // Check saved coupon
    const savedCoupon = JSON.parse(localStorage.getItem("stylehub_coupon"));
    if (savedCoupon && savedCoupon.discount) {
        appliedDiscount = savedCoupon.discount;
        appliedCouponCode = savedCoupon.code;
    }

    // Category filter click delegation
    const catList = document.querySelector(".category-pills");
    if (catList) {
        catList.addEventListener("click", event => {
            const btn = event.target.closest(".filter-pill");
            if (!btn) return;
            document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
            btn.classList.add("active");
            selectedCategory = btn.dataset.category || "All";
            renderProducts();
        });
    }

    // Search bar listener with debounce
    const searchInput = document.getElementById("product-search");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener("input", e => {
            clearTimeout(debounceTimer);
            searchQuery = e.target.value.trim().toLowerCase();
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchQuery.length > 0 ? "block" : "none";
            }
            debounceTimer = setTimeout(() => {
                renderProducts();
            }, 180);
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener("click", () => {
            searchInput.value = "";
            searchQuery = "";
            clearSearchBtn.style.display = "none";
            renderProducts();
        });
    }

    // Sort selector
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", e => {
            selectedSort = e.target.value;
            renderProducts();
        });
    }

    // Promo code button
    const promoBtn = document.getElementById("apply-promo-btn");
    if (promoBtn) {
        promoBtn.addEventListener("click", applyCouponCode);
    }

    // Backdrop clicks for cart drawer & modal
    const cartBackdrop = document.getElementById("cart-drawer-backdrop");
    if (cartBackdrop) {
        cartBackdrop.addEventListener("click", closeCartDrawer);
    }

    const modalBackdrop = document.getElementById("quick-view-modal");
    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", e => {
            if (e.target === modalBackdrop) closeQuickView();
        });
    }

    // VIP Newsletter Subscription
    const vipForm = document.getElementById("vip-newsletter-form");
    if (vipForm) {
        vipForm.addEventListener("submit", e => {
            e.preventDefault();
            const emailInput = vipForm.querySelector("input[type='email']");
            if (emailInput && emailInput.value) {
                if (typeof showToast === "function") {
                    showToast(`Welcome to the Atelier VIP! Your 15% code is ATELIER15`, "🎁");
                }
                appliedDiscount = 15;
                appliedCouponCode = "ATELIER15";
                localStorage.setItem("stylehub_coupon", JSON.stringify({ code: "ATELIER15", discount: 15 }));
                renderCartDrawer();
                vipForm.reset();
            }
        });
    }

    // Attempt backend sync
    syncWithBackend();
});