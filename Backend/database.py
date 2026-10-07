import os
import ssl
from urllib.parse import urlparse, unquote
import pymysql
from pymysql.cursors import DictCursor

db_url = os.environ.get("DATABASE_URL") or os.environ.get("MYSQL_URL")
if db_url:
    parsed = urlparse(db_url)
    DB_CONFIG = {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": parsed.username or "root",
        "password": unquote(parsed.password) if parsed.password else "",
        "charset": "utf8mb4"
    }
    raw_path = parsed.path.lstrip("/")
    DB_NAME = (raw_path.split("?")[0] if raw_path else None) or os.environ.get("DB_NAME", "stylehub")
else:
    DB_CONFIG = {
        "host": os.environ.get("DB_HOST", "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"),
        "port": int(os.environ.get("DB_PORT", 4000)),
        "user": os.environ.get("DB_USER", "3h3aniMuvaJk2Gf.root"),
        "password": os.environ.get("DB_PASSWORD", "X4Ea8UiTK7HV4P6H"),
        "charset": "utf8mb4"
    }
    DB_NAME = os.environ.get("DB_NAME", "stylehub")

# Enable SSL automatically if requested or required by cloud providers (TiDB Cloud, Aiven, etc.)
db_ssl = os.environ.get("DB_SSL", "").lower()
if (
    db_ssl in ("1", "true", "yes", "required")
    or (db_url and "ssl" in db_url.lower())
    or ("tidbcloud.com" in DB_CONFIG["host"].lower())
    or ("aivencloud.com" in DB_CONFIG["host"].lower())
):
    DB_CONFIG["ssl"] = ssl.create_default_context()



def get_server_connection():
    """Connect to MySQL server without selecting a database."""
    try:
        return pymysql.connect(**DB_CONFIG)
    except pymysql.MySQLError as e:
        print(f"[MySQL Connection Error]: Could not connect to MySQL server at {DB_CONFIG['host']}:{DB_CONFIG['port']}.")
        raise e


def get_db_connection():
    """Connect to MySQL database with autocommit enabled."""
    try:
        return pymysql.connect(
            database=DB_NAME,
            cursorclass=DictCursor,
            autocommit=True,
            **DB_CONFIG
        )
    except pymysql.MySQLError as e:
        print(f"[MySQL Database Error]: Could not connect to database '{DB_NAME}' at {DB_CONFIG['host']}:{DB_CONFIG['port']}.")
        raise e



def init_db():
    """Initialize stylehub database and all tables in MySQL."""
    # 1. Create database if it does not exist (skip gracefully if user lacks CREATE DATABASE privilege on managed cloud)
    try:
        server_conn = get_server_connection()
        try:
            with server_conn.cursor() as cursor:
                cursor.execute(
                    f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            server_conn.commit()
        finally:
            server_conn.close()
    except Exception as e:
        print(f"[DB Notice] Skipping CREATE DATABASE step ({e}) - continuing with existing '{DB_NAME}' database.")

    # 2. Create tables
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'customer',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS products (
                    id INT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    price INT NOT NULL,
                    image TEXT NOT NULL
                )
                """
            )
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    customer_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    address TEXT NOT NULL,
                    total DECIMAL(10, 2) NOT NULL,
                    status VARCHAR(50) DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            # Add stock column to products if not exists
            try:
                cursor.execute("ALTER TABLE products ADD COLUMN stock INT DEFAULT 25")
            except Exception:
                pass

            # 3. Coupons Table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS coupons (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    code VARCHAR(50) NOT NULL UNIQUE,
                    discount_type VARCHAR(20) DEFAULT 'percent',
                    discount_value DECIMAL(10, 2) NOT NULL,
                    min_order DECIMAL(10, 2) DEFAULT 0,
                    description VARCHAR(255) DEFAULT '',
                    is_active TINYINT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            # Ensure description column exists in coupons
            try:
                cursor.execute("ALTER TABLE coupons ADD COLUMN description VARCHAR(255) DEFAULT ''")
            except Exception:
                pass

            # Seed standard year-round & festive coupons
            initial_coupons = [
                ('WELCOME10', 'percent', 10.00, 0, '10% Welcome bonus for all atelier members', 1),
                ('ATELIER15', 'percent', 15.00, 1499.00, '15% Off couture ensembles above ₹1,499', 1),
                ('STYLE10', 'percent', 10.00, 0, '10% Off everyday wardrobe essentials', 1),
                ('FESTIVE500', 'fixed', 500.00, 1999.00, 'Flat ₹500 Off on grand festive orders above ₹1,999', 1),
                ('DIWALI25', 'percent', 25.00, 0, '🪔 Extra 25% Diwali Dhamaka festive discount', 1),
                ('HOLI20', 'percent', 20.00, 0, '🎨 Extra 20% Rang Barse Holi festival celebration', 1),
                ('EID20', 'percent', 20.00, 0, '🌙 Extra 20% Eid Mubarak special couture discount', 1),
                ('NAVRATRI20', 'percent', 20.00, 0, '🌸 Extra 20% Navratri & Garba festive edit', 1),
                ('NEWYEAR30', 'percent', 30.00, 0, '❄️ Extra 30% New Year grand luxury gala discount', 1),
                ('FREEDOM20', 'percent', 20.00, 0, '🇮🇳 Extra 20% Independence Day & Rakhi special', 1)
            ]
            for c_code, c_type, c_val, c_min, c_desc, c_active in initial_coupons:
                cursor.execute(
                    """
                    INSERT INTO coupons (code, discount_type, discount_value, min_order, description, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        discount_type=VALUES(discount_type),
                        discount_value=VALUES(discount_value),
                        min_order=VALUES(min_order),
                        description=VALUES(description),
                        is_active=1
                    """,
                    (c_code, c_type, c_val, c_min, c_desc, c_active)
                )

            # 4. Store Settings Table (For Dynamic Festive Campaigns & Marquee)
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS store_settings (
                    setting_key VARCHAR(100) PRIMARY KEY,
                    setting_value TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
                """
            )
            default_settings = [
                ('festive_mode', 'auto'),
                ('active_festival', 'Diwali Dhamaka'),
                ('festival_code', 'DIWALI25'),
                ('festival_discount', '25'),
                ('festival_banner', '🪔 Grand Festive Dhamaka Live! Get Extra 25% OFF on all collections with code DIWALI25 • Complimentary Delivery on ₹1,999+')
            ]
            for s_key, s_val in default_settings:
                cursor.execute(
                    """
                    INSERT INTO store_settings (setting_key, setting_value)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE setting_key=setting_key
                    """,
                    (s_key, s_val)
                )

            # 5. Reviews Table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT NOT NULL,
                    customer_name VARCHAR(255) NOT NULL,
                    rating INT NOT NULL,
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

            cursor.execute("SELECT COUNT(*) AS cnt FROM reviews")
            if cursor.fetchone()["cnt"] == 0:
                cursor.execute(
                    """
                    INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES
                    (1, 'Akshay P.', 5, 'Exceptional organic cotton feel. Fits perfectly on shoulders!'),
                    (6, 'Pooja S.', 5, 'The floral print and flowy cut are mesmerizing. Highly recommended.'),
                    (4, 'Rajesh M.', 5, 'Warm, sleek, and premium zipper finish. Real luxury at honest pricing.')
                    """
                )
    except Exception as e:
        print(f"[DB Notice] Running with local/in-memory configuration: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()


def seed_products(products):
    """Seed initial luxury products into MySQL."""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                for product in products:
                    cursor.execute(
                        """
                        INSERT INTO products (id, name, category, price, image)
                        VALUES (%s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            name=VALUES(name),
                            category=VALUES(category),
                            price=VALUES(price),
                            image=VALUES(image)
                        """,
                        (
                            product["id"],
                            product["name"],
                            product["category"],
                            product["price"],
                            product["image"]
                        )
                    )
        finally:
            conn.close()
    except Exception as e:
        print(f"[DB Notice] Product seeding skipped: {e}")