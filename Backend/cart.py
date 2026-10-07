from flask import Blueprint

cart = Blueprint("cart", __name__)


@cart.route("/api/cart", methods=["GET"])
def get_cart():
    return {
        "message": "Cart API is ready"
    }


@cart.route("/api/cart", methods=["POST"])
def add_to_cart():
    return {
        "message": "Product added to cart"
    }