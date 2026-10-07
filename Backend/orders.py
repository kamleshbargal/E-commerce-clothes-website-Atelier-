from flask import Blueprint, jsonify, request
from database import get_db_connection
from notifications import send_sms, send_whatsapp_order_confirmation

orders = Blueprint("orders", __name__)


@orders.route("/api/orders", methods=["GET"])
def get_orders():
    email = request.args.get("email", "").strip().lower()
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            if email:
                cursor.execute("SELECT * FROM orders WHERE LOWER(email) = %s ORDER BY id DESC", (email,))
            else:
                cursor.execute("SELECT * FROM orders ORDER BY id DESC")
            order_rows = cursor.fetchall()
        return jsonify(order_rows)
    finally:
        connection.close()



@orders.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    address = str(data.get("address", "")).strip()
    total = data.get("total", 0)

    if not name or not email or not phone or not address:
        return jsonify({"error": "All fields are required"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO orders (customer_name, email, phone, address, total)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (name, email, phone, address, total),
            )
            order_id = cursor.lastrowid

        # Dispatch SMS and WhatsApp Notifications
        sms_text = f"StyleHub Atelier: Order #SH-2026-{order_id} of INR {total} is successfully placed! Thank you for shopping with us."
        sms_res = send_sms(phone, sms_text)
        wa_res = send_whatsapp_order_confirmation(phone, order_id, name, total)

        return jsonify({
            "message": "Order created successfully",
            "order_id": order_id,
            "sms_status": "sent",
            "sms_gateway": sms_res.get("gateway", "simulation"),
            "whatsapp_status": "sent" if wa_res.get("gateway") == "whatsapp_cloud_api" else "ready",
            "whatsapp_url": wa_res.get("whatsapp_url", ""),
            "registered_phone": phone,
            "sms_message": sms_text
        }), 201
    finally:
        connection.close()


@orders.route("/api/orders/<int:order_id>", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status is required"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE orders SET status = %s WHERE id = %s",
                (status, order_id)
            )
        return jsonify({"message": f"Order #{order_id} status updated to {status}"})
    finally:
        connection.close()


@orders.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM orders WHERE id = %s", (order_id,))
        return jsonify({"message": f"Order #{order_id} deleted successfully"})
    finally:
        connection.close()

