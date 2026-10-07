import re

from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from database import get_db_connection

auth = Blueprint("auth", __name__)

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


@auth.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if len(name) < 2:
        return jsonify({"message": "Name must contain at least 2 characters"}), 400
    if not EMAIL_PATTERN.fullmatch(email):
        return jsonify({"message": "Enter a valid email address"}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must contain at least 6 characters"}), 400
    password_hash = generate_password_hash(password)

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
                (name, email, password_hash),
            )
            new_user_id = cursor.lastrowid

        return jsonify({
            "message": "Account created successfully! Welcome to StyleHub Atelier.",
            "user": {
                "id": new_user_id,
                "name": name,
                "email": email
            }
        }), 201
    except Exception as error:
        err_str = str(error).lower()
        if "duplicate" in err_str or "unique" in err_str or "1062" in err_str:
            return jsonify({"message": "An account with this email already exists. Please sign in instead."}), 409
        return jsonify({"message": f"Registration failed: {str(error)}"}), 500
    finally:
        connection.close()



@auth.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if not EMAIL_PATTERN.fullmatch(email) or not password:
        return jsonify({"message": "Enter a valid email and password"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, role, password_hash FROM users WHERE email = %s",
                (email,),
            )
            user = cursor.fetchone()

        if user is None or not check_password_hash(user["password_hash"], password):
            return jsonify({"message": "Invalid email or password"}), 401

        role = user.get("role") or "customer"
        is_admin = (role == "admin")

        return jsonify({
            "message": "Login successful",
            "name": user["name"],
            "email": user["email"],
            "role": role,
            "is_admin": is_admin
        })
    finally:
        connection.close()


@auth.route("/api/admin/verify", methods=["POST"])
def verify_admin_access():
    import os
    data = request.get_json(silent=True) or {}
    passcode = str(data.get("passcode", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    admin_passcode = os.environ.get("ADMIN_PASSCODE", "atelier2026").strip()

    # Option A: Check Master Passcode
    if passcode and passcode == admin_passcode:
        return jsonify({
            "authorized": True,
            "method": "passcode",
            "name": "Kamlesh Bargal (Master Owner)",
            "role": "admin"
        })

    # Option B: Check Administrator Email & Password in MySQL
    if email and password:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name, email, role, password_hash FROM users WHERE email = %s",
                    (email,)
                )
                user = cursor.fetchone()
                if user and check_password_hash(user["password_hash"], password):
                    if user.get("role") == "admin":
                        return jsonify({
                            "authorized": True,
                            "method": "credentials",
                            "name": user["name"],
                            "email": user["email"],
                            "role": "admin"
                        })
                    return jsonify({
                        "authorized": False,
                        "message": "Access restricted: This account does not have store administrator privileges."
                    }), 403
        finally:
            connection.close()

    return jsonify({
        "authorized": False,
        "message": "Invalid administrator passcode or account credentials."
    }), 401


@auth.route("/api/users", methods=["GET"])
def get_users():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC")
            rows = cursor.fetchall()
        return jsonify(rows)
    finally:
        connection.close()
