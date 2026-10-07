from flask import Blueprint

products = Blueprint("products", __name__)


@products.route("/api/products", methods=["GET"])
def get_products():
    return {
        "message": "Products API is ready"
    }