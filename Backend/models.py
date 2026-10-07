from database import get_db_connection


def get_all_products():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products ORDER BY id ASC")
            return cursor.fetchall()
    finally:
        connection.close()


def get_product(product_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
            return cursor.fetchone()
    finally:
        connection.close()