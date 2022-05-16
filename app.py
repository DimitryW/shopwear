from flask import *
from flask_cors import CORS
# import jwt
# import time
# import requests
# import json
# import datetime
# import os
# import re
from model.model import Products, Products_Photos

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False  
CORS(app)

#商品展示首頁
@app.route("/")
def index():
    return render_template("index.html")

#個別商品頁面
@app.route("/product/<product_id>")
def product(product_id):
    return render_template("product.html")

#購物車頁面
@app.route("/order")
def booking():
    return render_template("order.html")

#結帳頁面    

# @app.route("/thankyou")
# def thankyou():
#     return render_template("thankyou.html")

# 登入頁面
@app.route("/login")
def login():
    return render_template("login.html")
#會員頁面
@app.route("/member")
def member():
    return render_template("member.html")

#分享平台頁面
@app.route("/wear")
def wear():
    return render_template("wear.html")


@app.route("/api/products")
def api_index():
    page = request.args.get("page", default=0, type=int)
    (data, total) = Products.show_products(index=page*12)
    res = {
        "nextPage": page+1 if page < (total//12) else None,
        "data":[]
    }
    
    for i in range(len(data)):
        product={
            "id": data[i][0],
            "product_name":data[i][1],
            "price": data[i][2], 
            "description": data[i][3], 
            "content": data[i][4],
            "photo" :Products_Photos.show_photos(data[i][0])
        }
        res["data"].append(product)
    status=200

    return jsonify(res), status

@app.route("/api/product/<product_id>")
def api_product(product_id):
    try:
        data = Products.check_product_details(product_id)
        res = {
        "id": data[0],
        "product_name":data[1],
        "price": data[2], 
        "description": data[3], 
        "content": data[4],
        "photo" : Products_Photos.show_photos(product_id)
        }
        status=200
    except:
        res = {
        "error":True
        }
        status=500
    return jsonify(res), status


if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=80)
    app.run(debug=True, port=80)