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
from google.oauth2 import id_token
from google.auth.transport import requests


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
@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")

@app.route('/hello', methods=["GET", "POST"])
def hello():
    return "HELLO"  

@app.route('/api/googleuser', methods=["POST"])
def api_login():
    data = request.get_json()
    token = data["token"]
    
    # try:
    # Specify the CLIENT_ID of the app that accesses the backend:
    idinfo = id_token.verify_oauth2_token(token, requests.Request(), "286685632918-hl2ehilfl64emfu0ost6r1let7kse4fd.apps.googleusercontent.com", clock_skew_in_seconds=32)

    # Or, if multiple clients access the backend server:
    # idinfo = id_token.verify_oauth2_token(token, requests.Request())
    # if idinfo['aud'] not in [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]:
    #     raise ValueError('Could not verify audience.')

    # If auth request is from a G Suite domain:
    # if idinfo['hd'] != GSUITE_DOMAIN_NAME:
    #     raise ValueError('Wrong hosted domain.')

    # ID token is valid. Get the user's Google Account ID from the decoded token.
    # user_id = idinfo['sub']
    user_name = idinfo['name']
    user_email = idinfo['email']
    print(idinfo)
    res = {
    "ok":True
    }
    # except ValueError:
    #     # Invalid token
    #     res = {
    #     "ok":False
    #     }
    #     print("error")
    return jsonify(res)

#會員頁面
@app.route("/member")
def member():
    return render_template("member.html")

#分享平台頁面
@app.route("/wear")
def wear():
    return render_template("wear.html")


@app.route("/api/products")
def api_product_index():
    page = request.args.get("page", default=0, type=int)
    (data, total) = Products.show_products(index=page*12)
    
    res = {
        "total_page": (total//12) if total%12==0 else (total//12)+1,
        "next_page": page+1 if page < (total//12) else None,
        "data":[]
    }
    
    for i in range(len(data)):
        product={
            "id": data[i][0],
            "product_name":data[i][1],
            "price": data[i][2], 
            "description": data[i][3], 
            "content": data[i][4],
            "photo" : data[i][1] + "/" + data[i][1] + "-1.jpg"
        }
        res["data"].append(product)
    status=200

    return jsonify(res), status

@app.route("/api/product/<product_id>")
def api_product(product_id):
    try:
        data = Products.check_product_details(product_id)
        res = {
        "id": data[0][0],
        "product_name":data[0][1],
        "price": data[0][2], 
        "description": data[0][3], 
        "content": data[0][4],
        "photo" : [x[7] for x in data]
        }
        status=200
    except:
        res = {
        "error":True
        }
        status=500
    return jsonify(res), status


if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=3000)
    app.run(debug=True, port=5000)