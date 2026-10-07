import os
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from auth import auth
from cart import cart
from database import get_db_connection, init_db, seed_products
from models import get_all_products, get_product as find_product
from orders import orders

_frontend_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "front end")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "front end")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "frontend")),
]
FRONTEND_DIR = next((p for p in _frontend_candidates if os.path.isdir(p)), _frontend_candidates[0])

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)
init_db()

app.register_blueprint(auth)
app.register_blueprint(cart)
app.register_blueprint(orders)

# Temporary product data
products = [
    {
        "id": 1,
        "name": "Classic T-Shirt",
        "category": "Men",
        "price": 599,
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 2,
        "name": "Blue Jeans",
        "category": "Men",
        "price": 1299,
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 3,
        "name": "Women Casual Top",
        "category": "Women",
        "price": 799,
        "image": "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 4,
        "name": "Winter Jacket",
        "category": "Men",
        "price": 1999,
        "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 5,
        "name": "Linen Shirt",
        "category": "Men",
        "price": 899,
        "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 6,
        "name": "Floral Summer Dress",
        "category": "Women",
        "price": 1499,
        "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 7,
        "name": "Knit Cardigan",
        "category": "Women",
        "price": 1199,
        "image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 8,
        "name": "Everyday Hoodie",
        "category": "Unisex",
        "price": 1099,
        "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 9,
        "name": "Essential Crewneck Sweatshirt",
        "category": "Men",
        "price": 999,
        "image": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 10,
        "name": "Soft Fleece Sweatshirt",
        "category": "Women",
        "price": 1099,
        "image": "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 11,
        "name": "Cable Knit Sweater",
        "category": "Women",
        "price": 1399,
        "image": "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 12,
        "name": "Relaxed Wool Sweater",
        "category": "Men",
        "price": 1599,
        "image": "https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 13,
        "name": "Street Varsity Jacket",
        "category": "Unisex",
        "price": 1799,
        "image": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 14,
        "name": "Quilted Puffer Jacket",
        "category": "Women",
        "price": 2199,
        "image": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 15,
        "name": "Mini Explorer Hoodie",
        "category": "Kids",
        "price": 699,
        "image": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 16,
        "name": "Rainbow Play Dress",
        "category": "Kids",
        "price": 849,
        "image": "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 17,
        "name": "City Runner Sneakers",
        "category": "Footwear",
        "price": 1899,
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 18,
        "name": "Everyday Canvas Shoes",
        "category": "Footwear",
        "price": 1499,
        "image": "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 19,
        "name": "Strappy Summer Sandals",
        "category": "Footwear",
        "price": 999,
        "image": "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 20,
        "name": "Pearl Drop Earrings",
        "category": "Jewellery",
        "price": 799,
        "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 21,
        "name": "Minimal Gold Chain",
        "category": "Jewellery",
        "price": 999,
        "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 22,
        "name": "Classic Steel Watch",
        "category": "Jewellery",
        "price": 1299,
        "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 23,
        "name": "Little Prince Royal Silk Kurta Set",
        "category": "Kids",
        "price": 1599,
        "image": "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 24,
        "name": "Princess Rose Blossom Tulle Gown",
        "category": "Kids",
        "price": 1799,
        "image": "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 25,
        "name": "Little Explorer Organic Fleece Set",
        "category": "Kids",
        "price": 1399,
        "image": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 26,
        "name": "Mini Gentleman Suspenders Suit",
        "category": "Kids",
        "price": 1899,
        "image": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 27,
        "name": "Sunshine Tiered Mulmul Twirl Frock",
        "category": "Kids",
        "price": 1199,
        "image": "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 28,
        "name": "Junior Aviator Sherpa Denim Jacket",
        "category": "Kids",
        "price": 1999,
        "image": "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 29,
        "name": "Cozy Woodland Hand-Knit Cardigan",
        "category": "Kids",
        "price": 1499,
        "image": "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 30,
        "name": "Royal Heritage Festive Sharara Set",
        "category": "Kids",
        "price": 2199,
        "image": "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 31,
        "name": "Vintage Corduroy Overalls & Striped Tee",
        "category": "Kids",
        "price": 1599,
        "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=85"
    },
    {
        "id": 32,
        "name": "Little Parisian Trench Coat & Beret",
        "category": "Kids",
        "price": 2399,
        "image": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=700&q=85"
    }
]

seed_products(products)




@app.route("/api/products", methods=["GET"])
def get_products():
    return jsonify([dict(product) for product in get_all_products()])


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = find_product(product_id)
    if product is None:
        return jsonify({"message": "Product not found"}), 404
    return jsonify(dict(product))


@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    category = str(data.get("category", "Unisex")).strip()
    price = data.get("price", 0)
    image = str(data.get("image", "")).strip()
    stock = int(data.get("stock", 25))

    if not name or not price:
        return jsonify({"error": "Product name and price are required"}), 400

    # Auto-assign smart high-resolution apparel image if none provided
    if not image:
        cat_lower = (category + " " + name).lower()
        if "sweat" in cat_lower or "hoodie" in cat_lower or "fleece" in cat_lower:
            image = "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=85"
        elif "jacket" in cat_lower or "coat" in cat_lower:
            image = "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85"
        elif "saree" in cat_lower or "kurti" in cat_lower:
            image = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85"
        elif "dress" in cat_lower or "women" in cat_lower:
            image = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=85"
        elif "kid" in cat_lower or "child" in cat_lower:
            image = "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=85"
        elif "jewel" in cat_lower or "watch" in cat_lower:
            image = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85"
        elif "shoe" in cat_lower or "sneaker" in cat_lower or "footwear" in cat_lower:
            image = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85"
        elif "jean" in cat_lower or "pant" in cat_lower or "trouser" in cat_lower:
            image = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=85"
        elif "shirt" in cat_lower:
            image = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85"
        else:
            image = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=85"

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM products")
            next_id = cursor.fetchone()["next_id"]
            cursor.execute(
                """
                INSERT INTO products (id, name, category, price, image, stock)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (next_id, name, category, price, image, stock)
            )
        return jsonify({
            "message": "Product added successfully",
            "product": {
                "id": next_id,
                "name": name,
                "category": category,
                "price": price,
                "image": image,
                "stock": stock
            }
        }), 201
    finally:
        connection.close()


@app.route("/api/products/bulk", methods=["POST"])
def add_products_bulk():
    data = request.get_json(silent=True) or {}
    items = data.get("products", [])
    if not items or not isinstance(items, list):
        return jsonify({"error": "A list of products is required"}), 400

    connection = get_db_connection()
    inserted_count = 0
    default_images = {
        "men": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85",
        "women": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=85",
        "kids": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=85",
        "default": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=85"
    }

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COALESCE(MAX(id), 0) AS max_id FROM products")
            current_id = cursor.fetchone()["max_id"]

            for item in items:
                name = str(item.get("name", "")).strip()
                category = str(item.get("category", "Men")).strip()
                try:
                    price = int(float(item.get("price", 999)))
                except (ValueError, TypeError):
                    price = 999
                image = str(item.get("image", "")).strip()

                if not image:
                    cat_lower = category.lower()
                    if "women" in cat_lower or "saree" in cat_lower or "kurti" in cat_lower or "dress" in cat_lower:
                        image = default_images["women"]
                    elif "kid" in cat_lower or "child" in cat_lower or "baby" in cat_lower:
                        image = default_images["kids"]
                    elif "men" in cat_lower or "shirt" in cat_lower:
                        image = default_images["men"]
                    else:
                        image = default_images["default"]

                stock = int(item.get("stock", 25))
                if name and price:
                    current_id += 1
                    cursor.execute(
                        """
                        INSERT INTO products (id, name, category, price, image, stock)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (current_id, name, category, price, image, stock)
                    )
                    inserted_count += 1
        return jsonify({
            "message": f"Successfully added {inserted_count} products in bulk!",
            "inserted_count": inserted_count
        }), 201
    finally:
        connection.close()


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        return jsonify({"message": f"Product #{product_id} deleted successfully"})
    finally:
        connection.close()


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json(silent=True) or {}
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
            product = cursor.fetchone()
            if not product:
                return jsonify({"error": "Product not found"}), 404

            name = data.get("name", product["name"])
            category = data.get("category", product["category"])
            price = data.get("price", product["price"])
            image = data.get("image", product["image"])
            stock = data.get("stock", product.get("stock", 25))

            cursor.execute(
                """
                UPDATE products 
                SET name = %s, category = %s, price = %s, image = %s, stock = %s
                WHERE id = %s
                """,
                (name, category, price, image, stock, product_id)
            )
        return jsonify({"message": f"Product #{product_id} updated successfully"})
    finally:
        connection.close()


@app.route("/api/admin/stats", methods=["GET"])
def get_admin_stats():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total_orders, COALESCE(SUM(total), 0) AS total_revenue FROM orders")
            orders_stat = cursor.fetchone() or {"total_orders": 0, "total_revenue": 0}

            cursor.execute("SELECT COUNT(*) AS pending_orders FROM orders WHERE status = 'Pending'")
            pending_stat = cursor.fetchone() or {"pending_orders": 0}

            cursor.execute("SELECT COUNT(*) AS total_users FROM users")
            users_stat = cursor.fetchone() or {"total_users": 0}

            cursor.execute("SELECT COUNT(*) AS total_products FROM products")
            products_stat = cursor.fetchone() or {"total_products": 0}

            # Category distribution
            cursor.execute("SELECT category, COUNT(*) AS count FROM products GROUP BY category")
            categories = cursor.fetchall() or []

            # Status breakdown
            cursor.execute("SELECT status, COUNT(*) AS count FROM orders GROUP BY status")
            status_dist = cursor.fetchall() or []

        return jsonify({
            "total_revenue": float(orders_stat["total_revenue"]),
            "total_orders": int(orders_stat["total_orders"]),
            "pending_orders": int(pending_stat["pending_orders"]),
            "total_users": int(users_stat["total_users"]),
            "total_products": int(products_stat["total_products"]),
            "categories": categories,
            "status_dist": status_dist
        })
    finally:
        connection.close()


# --------------------------------------------------------------------------
# FESTIVE CAMPAIGNS & MULTI-COUPONS ENGINE
# --------------------------------------------------------------------------
FALLBACK_COUPONS = {
    "WELCOME10": {"discount_type": "percent", "discount_value": 10.0, "min_order": 0.0, "description": "10% Welcome bonus for all atelier members"},
    "ATELIER15": {"discount_type": "percent", "discount_value": 15.0, "min_order": 1499.0, "description": "15% Off couture ensembles above ₹1,499"},
    "STYLE10": {"discount_type": "percent", "discount_value": 10.0, "min_order": 0.0, "description": "10% Off everyday wardrobe essentials"},
    "FESTIVE500": {"discount_type": "fixed", "discount_value": 500.0, "min_order": 1999.0, "description": "Flat ₹500 Off on grand festive orders above ₹1,999"},
    "DIWALI25": {"discount_type": "percent", "discount_value": 25.0, "min_order": 0.0, "description": "🪔 Extra 25% Diwali Dhamaka festive discount"},
    "HOLI20": {"discount_type": "percent", "discount_value": 20.0, "min_order": 0.0, "description": "🎨 Extra 20% Rang Barse Holi festival celebration"},
    "EID20": {"discount_type": "percent", "discount_value": 20.0, "min_order": 0.0, "description": "🌙 Extra 20% Eid Mubarak special couture discount"},
    "NAVRATRI20": {"discount_type": "percent", "discount_value": 20.0, "min_order": 0.0, "description": "🌸 Extra 20% Navratri & Garba festive edit"},
    "NEWYEAR30": {"discount_type": "percent", "discount_value": 30.0, "min_order": 0.0, "description": "❄️ Extra 30% New Year grand luxury gala discount"},
    "FREEDOM20": {"discount_type": "percent", "discount_value": 20.0, "min_order": 0.0, "description": "🇮🇳 Extra 20% Independence Day & Rakhi special"}
}

def get_calendar_festival():
    """Determine if today falls within an Indian/Global festival window."""
    now = datetime.now()
    m = now.month
    d = now.day

    # 1. Navratri & Dussehra (approx Sep 15 - Oct 15)
    if (m == 9 and d >= 15) or (m == 10 and d <= 15):
        return {
            "name": "Navratri & Dussehra Splendor",
            "code": "NAVRATRI20",
            "discount": 20,
            "banner": "🌸 Navratri & Dussehra Splendor Live! Extra 20% OFF with code NAVRATRI20 • Celebration Couture"
        }
    # 2. Diwali Grand Festive Season (approx Oct 16 - Nov 25)
    if (m == 10 and d >= 16) or (m == 11 and d <= 25):
        return {
            "name": "Diwali Grand Festive Dhamaka",
            "code": "DIWALI25",
            "discount": 25,
            "banner": "🪔 Grand Festive Dhamaka Live! Get Extra 25% OFF on all collections with code DIWALI25 • Complimentary Delivery on ₹1,999+"
        }
    # 3. New Year Luxury Gala (approx Dec 15 - Jan 10)
    if (m == 12 and d >= 15) or (m == 1 and d <= 10):
        return {
            "name": "New Year Grand Luxury Gala",
            "code": "NEWYEAR30",
            "discount": 30,
            "banner": "❄️ New Year Luxury Gala: Extra 30% OFF with code NEWYEAR30 • Shop Atelier Archive"
        }
    # 4. Valentine & Spring Edit (Feb 7 - Feb 16)
    if m == 2 and (7 <= d <= 16):
        return {
            "name": "Valentine Season Edit",
            "code": "LOVE15",
            "discount": 15,
            "banner": "💖 Valentine Special Edit: Extra 15% OFF with code LOVE15 • Handcrafted Luxury"
        }
    # 5. Holi Color Carnival (approx March 1 - March 31)
    if m == 3:
        return {
            "name": "Holi Rang Barse Festival",
            "code": "HOLI20",
            "discount": 20,
            "banner": "🎨 Rang Barse Holi Festive Sale! Extra 20% OFF with code HOLI20 • Free Express Delivery"
        }
    # 6. Eid Mubarak Special (approx April 1 - May 10)
    if (m == 4) or (m == 5 and d <= 10):
        return {
            "name": "Eid Mubarak Festive Edit",
            "code": "EID20",
            "discount": 20,
            "banner": "🌙 Eid Mubarak Special: Extra 20% OFF with code EID20 • Royal Atelier Couture"
        }
    # 7. Independence & Rakhi Festival (August 1 - August 31)
    if m == 8:
        return {
            "name": "Independence & Rakhi Special",
            "code": "FREEDOM20",
            "discount": 20,
            "banner": "🇮🇳 Freedom & Rakhi Festival: Extra 20% OFF with code FREEDOM20 • Atelier Handcrafted"
        }
    return None

@app.route("/api/festive-sale", methods=["GET"])
def get_festive_sale():
    """Return active festival status, extra discount %, banner text, and all available coupons."""
    settings = {}
    db_coupons = []
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT setting_key, setting_value FROM store_settings")
                for row in cursor.fetchall() or []:
                    settings[row["setting_key"]] = row["setting_value"]
                cursor.execute("SELECT * FROM coupons WHERE is_active = 1 ORDER BY id DESC")
                db_coupons = cursor.fetchall() or []
        finally:
            connection.close()
    except Exception as e:
        print(f"⚠️ Store settings read fallback: {e}")

    mode = settings.get("festive_mode", "auto")
    active = False
    festival_name = settings.get("active_festival", "Diwali Dhamaka")
    code = settings.get("festival_code", "DIWALI25")
    discount = int(float(settings.get("festival_discount", "25")))
    banner = settings.get("festival_banner", "🪔 Grand Festive Dhamaka Live! Extra 25% OFF with code DIWALI25 • Complimentary Delivery on ₹1,999+")

    if mode == "auto":
        cal = get_calendar_festival()
        if cal:
            active = True
            festival_name = cal["name"]
            code = cal["code"]
            discount = cal["discount"]
            banner = cal["banner"]
        else:
            # Check if store settings explicitly has a festival active or fallback to Diwali showcase
            active = True
    elif mode == "manual" or mode == "active":
        active = True
    else:
        active = False

    # Build available coupons list for checkout customer shopping
    coupons_output = []
    seen_codes = set()

    for c in db_coupons:
        c_code = c["code"].upper()
        seen_codes.add(c_code)
        is_festive = bool(active and c_code == code)
        coupons_output.append({
            "id": c.get("id"),
            "code": c_code,
            "discount_type": c.get("discount_type", "percent"),
            "discount_value": float(c.get("discount_value", 0)),
            "min_order": float(c.get("min_order", 0)),
            "description": c.get("description") or f"{int(float(c.get('discount_value', 0)))}% off coupon",
            "is_festive": is_festive
        })

    # Add any missing fallback coupons if DB was empty
    for f_code, f_val in FALLBACK_COUPONS.items():
        if f_code not in seen_codes:
            coupons_output.append({
                "code": f_code,
                "discount_type": f_val["discount_type"],
                "discount_value": f_val["discount_value"],
                "min_order": f_val["min_order"],
                "description": f_val["description"],
                "is_festive": bool(active and f_code == code)
            })

    # Sort so active festive coupon is first, followed by highest discount
    coupons_output.sort(key=lambda x: (not x.get("is_festive", False), -x.get("discount_value", 0)))

    return jsonify({
        "active": active,
        "mode": mode,
        "festival_name": festival_name if active else None,
        "code": code if active else None,
        "discount": discount if active else 0,
        "banner_text": banner if active else "Complimentary Global Courier on Orders Over ₹1,999 • Atelier Spring/Summer 2026 Archive Live",
        "available_coupons": coupons_output
    })

@app.route("/api/festive-sale", methods=["POST"])
def update_festive_sale():
    """Admin endpoint to switch festival modes and set active campaign."""
    data = request.get_json(silent=True) or {}
    mode = str(data.get("mode", "manual")).strip().lower()
    festival_name = str(data.get("festival_name", "")).strip() or "Grand Festive Sale"
    code = str(data.get("code", "")).strip().upper()
    discount = float(data.get("discount", 20))
    banner = str(data.get("banner_text", "")).strip()

    if not banner and code:
        banner = f"🪔 {festival_name} Live! Extra {int(discount)}% OFF with code {code} • Free Express Shipping on ₹1,999+"

    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                settings_to_save = [
                    ("festive_mode", mode),
                    ("active_festival", festival_name),
                    ("festival_code", code),
                    ("festival_discount", str(int(discount))),
                    ("festival_banner", banner)
                ]
                for s_key, s_val in settings_to_save:
                    cursor.execute(
                        """
                        INSERT INTO store_settings (setting_key, setting_value)
                        VALUES (%s, %s)
                        ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)
                        """,
                        (s_key, s_val)
                    )

                # If coupon code provided, ensure it's in the coupons table
                if code and discount > 0:
                    cursor.execute(
                        """
                        INSERT INTO coupons (code, discount_type, discount_value, min_order, description, is_active)
                        VALUES (%s, 'percent', %s, 0, %s, 1)
                        ON DUPLICATE KEY UPDATE
                            discount_type='percent',
                            discount_value=VALUES(discount_value),
                            description=VALUES(description),
                            is_active=1
                        """,
                        (code, discount, f"🎉 {festival_name} special discount ({int(discount)}% OFF)")
                    )
        finally:
            connection.close()

        return jsonify({
            "success": True,
            "message": f"Festive campaign '{festival_name}' broadcasted successfully!",
            "mode": mode,
            "code": code,
            "discount": discount
        })
    except Exception as e:
        print(f"Error updating festive sale: {e}")
        return jsonify({"error": f"Database error updating festive sale: {e}"}), 500

@app.route("/api/coupons", methods=["GET"])
def get_coupons():
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM coupons WHERE is_active = 1 ORDER BY id DESC")
                coupons_list = cursor.fetchall() or []
            return jsonify(coupons_list)
        finally:
            connection.close()
    except Exception:
        # Fallback list
        fallback_list = [
            {"id": idx + 1, "code": k, "discount_type": v["discount_type"], "discount_value": v["discount_value"], "min_order": v["min_order"], "description": v["description"], "is_active": 1}
            for idx, (k, v) in enumerate(FALLBACK_COUPONS.items())
        ]
        return jsonify(fallback_list)


@app.route("/api/coupons", methods=["POST"])
def add_coupon():
    data = request.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip().upper()
    discount_type = str(data.get("discount_type", "percent")).strip().lower()
    discount_value = float(data.get("discount_value", 0))
    min_order = float(data.get("min_order", 0))
    description = str(data.get("description", "")).strip()

    if not code or discount_value <= 0:
        return jsonify({"error": "Coupon code and positive discount value are required"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO coupons (code, discount_type, discount_value, min_order, description, is_active)
                VALUES (%s, %s, %s, %s, %s, 1)
                ON DUPLICATE KEY UPDATE
                    discount_type=VALUES(discount_type),
                    discount_value=VALUES(discount_value),
                    min_order=VALUES(min_order),
                    description=VALUES(description),
                    is_active=1
                """,
                (code, discount_type, discount_value, min_order, description)
            )
        return jsonify({"message": f"Coupon {code} created successfully!", "code": code}), 201
    finally:
        connection.close()


@app.route("/api/coupons/<int:coupon_id>", methods=["DELETE"])
def delete_coupon(coupon_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM coupons WHERE id = %s", (coupon_id,))
        return jsonify({"message": f"Coupon #{coupon_id} removed"})
    finally:
        connection.close()


@app.route("/api/coupons/verify", methods=["POST"])
def verify_coupon():
    data = request.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip().upper()
    subtotal = float(data.get("subtotal", 0))

    if not code:
        return jsonify({"valid": False, "message": "Please enter a coupon code"}), 400

    coupon = None
    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM coupons WHERE code = %s AND is_active = 1", (code,))
                coupon = cursor.fetchone()
        finally:
            connection.close()
    except Exception as e:
        print(f"⚠️ Coupon DB verify fallback: {e}")

    # Fallback to local dictionary if DB does not have it
    if not coupon and code in FALLBACK_COUPONS:
        fb = FALLBACK_COUPONS[code]
        coupon = {
            "code": code,
            "discount_type": fb["discount_type"],
            "discount_value": fb["discount_value"],
            "min_order": fb["min_order"],
            "description": fb["description"]
        }

    if not coupon:
        return jsonify({"valid": False, "message": f"Coupon '{code}' is invalid or expired."}), 404

    min_order = float(coupon.get("min_order") or 0)
    if subtotal < min_order:
        needed = int(min_order - subtotal)
        return jsonify({
            "valid": False,
            "message": f"Coupon '{code}' requires a minimum order of ₹{int(min_order):,}. Add ₹{needed:,} more to unlock!"
        }), 400

    discount_val = float(coupon["discount_value"])
    discount_type = coupon.get("discount_type", "percent")
    if discount_type == "percent" or discount_type == "percentage":
        discount_amount = round((subtotal * discount_val) / 100.0, 2)
        msg = f"Coupon '{code}' applied! You saved {int(discount_val)}% (₹{int(discount_amount):,})"
    else:
        discount_amount = min(discount_val, subtotal)
        msg = f"Coupon '{code}' applied! You saved ₹{int(discount_amount):,}"

    return jsonify({
        "valid": True,
        "code": code,
        "discount_type": discount_type,
        "discount_value": discount_val,
        "discount_amount": discount_amount,
        "description": coupon.get("description", ""),
        "message": msg
    })


# --------------------------------------------------------------------------
# PUBLIC LIVE ORDER TRACKING API
# --------------------------------------------------------------------------
@app.route("/api/orders/track", methods=["GET"])
def track_order():
    query = str(request.args.get("query", "")).strip()
    if not query:
        return jsonify({"error": "Please provide an Order ID or Mobile Number to track"}), 400

    # Clean query if format #SH-2026-X
    cleaned_id = query.upper().replace("#SH-2026-", "").replace("#SH-", "").replace("SH-", "").replace("#", "").strip()

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Try matching ID first if numeric
            order = None
            if cleaned_id.isdigit():
                cursor.execute("SELECT * FROM orders WHERE id = %s", (int(cleaned_id),))
                order = cursor.fetchone()

            # If not found by ID, try matching phone number or email
            if not order:
                cursor.execute(
                    "SELECT * FROM orders WHERE phone LIKE %s OR email = %s ORDER BY id DESC LIMIT 1",
                    (f"%{query}%", query)
                )
                order = cursor.fetchone()

        if not order:
            return jsonify({"error": f"No order found matching '{query}'. Please check your Order ID or phone number."}), 404

        # Mask email and phone for public tracker security
        raw_email = order.get("email", "")
        masked_email = (raw_email[:2] + "***@" + raw_email.split("@")[-1]) if "@" in raw_email else "cust***"
        raw_phone = order.get("phone", "")
        masked_phone = ("+91 " + raw_phone[:2] + "••••" + raw_phone[-4:]) if len(raw_phone) >= 10 else raw_phone

        return jsonify({
            "order_id": order["id"],
            "formatted_id": f"#SH-2026-{order['id']}",
            "customer_name": order["customer_name"],
            "masked_email": masked_email,
            "masked_phone": masked_phone,
            "total": float(order["total"]),
            "status": order["status"] or "Pending",
            "address": order["address"],
            "created_at": order["created_at"].strftime("%b %d, %Y • %I:%M %p") if order.get("created_at") else "Recent"
        })
    finally:
        connection.close()


# --------------------------------------------------------------------------
# PRODUCT REVIEWS & TESTIMONIALS API
# --------------------------------------------------------------------------
@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    product_id = request.args.get("product_id")
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            if product_id and product_id.isdigit():
                cursor.execute("SELECT * FROM reviews WHERE product_id = %s ORDER BY id DESC", (int(product_id),))
            else:
                cursor.execute("SELECT * FROM reviews ORDER BY id DESC LIMIT 20")
            reviews_list = cursor.fetchall() or []
        return jsonify(reviews_list)
    finally:
        connection.close()


@app.route("/api/reviews", methods=["POST"])
def add_review():
    data = request.get_json(silent=True) or {}
    product_id = int(data.get("product_id", 1))
    customer_name = str(data.get("customer_name", "Anonymous")).strip() or "Verified Buyer"
    rating = min(max(int(data.get("rating", 5)), 1), 5)
    comment = str(data.get("comment", "")).strip()

    if not comment:
        return jsonify({"error": "Review comment cannot be empty"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO reviews (product_id, customer_name, rating, comment)
                VALUES (%s, %s, %s, %s)
                """,
                (product_id, customer_name, rating, comment)
            )
        return jsonify({"message": "Review submitted successfully!", "rating": rating}), 201
    finally:
        connection.close()


@app.route("/")
def serve_index():
    if os.path.isdir(FRONTEND_DIR):
        return send_from_directory(FRONTEND_DIR, "index.html")
    return jsonify({"message": "StyleHub Atelier API is live!"})


@app.route("/admin")
def serve_admin_panel():
    if os.path.isdir(FRONTEND_DIR):
        return send_from_directory(FRONTEND_DIR, "admin.html")
    return jsonify({"error": "Admin panel not found"}), 404


@app.route("/admin-login")
def serve_admin_login():
    if os.path.isdir(FRONTEND_DIR):
        return send_from_directory(FRONTEND_DIR, "admin-login.html")
    return jsonify({"error": "Admin login not found"}), 404


@app.route("/login")
def serve_customer_login():
    if os.path.isdir(FRONTEND_DIR):
        return send_from_directory(FRONTEND_DIR, "login.html")
    return jsonify({"error": "Customer login not found"}), 404


@app.route("/<path:filename>")
def serve_static_pages(filename):
    if filename.startswith("api/"):
        return jsonify({"error": "API route not found"}), 404
    if os.path.isdir(FRONTEND_DIR):
        file_path = os.path.join(FRONTEND_DIR, filename)
        if os.path.isfile(file_path):
            return send_from_directory(FRONTEND_DIR, filename)
        mirror_path = os.path.join(FRONTEND_DIR, "html", filename)
        if os.path.isfile(mirror_path):
            return send_from_directory(os.path.join(FRONTEND_DIR, "html"), filename)
        return send_from_directory(FRONTEND_DIR, "index.html")
    return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

