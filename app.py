from distutils.ccompiler import new_compiler
from flask import *
from flask_cors import CORS
import jwt
import time
import requests
from dotenv import load_dotenv
# import json
# import datetime
import os
import re
from model.model import Products, Products_Photos, Members
from google.oauth2 import id_token
from google.auth.transport import requests

load_dotenv()
jwt_key = os.getenv("jwt_key")
partner_key = os.getenv("partner_key")
merchant_id = os.getenv("merchant_id")
tappay_details = os.getenv("tappay_details")
x_api_key = os.getenv("x_api_key")

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False  
CORS(app)

jwt_key = "a3a4q0xFI8t-NaiiNsyD63EPNp22lx6P9u6GmDYIEOo"

#商品展示首頁
@app.route("/")
def index():
    return render_template("index.html")

#個別商品頁面
@app.route("/product/<product_id>")
def product(product_id):
    return render_template("product.html")

#購物車頁面
@app.route("/cart")
def booking():
    return render_template("cart.html")

#結帳頁面    
@app.route("/checkout")
def checkout():
    return render_template("checkout.html")
# @app.route("/thankyou")
# def thankyou():
#     return render_template("thankyou.html")

# 登入頁面
@app.route("/login", methods=["GET", "POST"])
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


@app.route("/api/products", methods=["GET"])
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

@app.route("/api/product/<product_id>", methods=["GET"])
def api_product(product_id):
    try:
        data = Products.check_product_details(product_id)
        stock = Products.check_stock(product_id)
        res = {
        "id": data[0][0],
        "product_name":data[0][1],
        "price": data[0][2], 
        "description": data[0][3], 
        "content": data[0][4],
        "photo" : [x[7] for x in data],
        "stock": stock
        }
        status=200
    except:
        res = {
        "error":True
        }
        status=500
    return jsonify(res), status



@app.route('/api/googleuser', methods=["POST"])
def api_login():
    data = request.get_json()
    token = data["token"]
    
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        # 如果有時間差，用clock_skew_in_seconds來調整
        id_info = id_token.verify_oauth2_token(token, requests.Request(), "286685632918-hl2ehilfl64emfu0ost6r1let7kse4fd.apps.googleusercontent.com", clock_skew_in_seconds=34)

        if id_info:
            # ID token is valid. 
            # user_id = id_info['sub']
            user_name = id_info['name']
            user_email = id_info['email']
            count = Members.check_third_party_member(user_name, user_email)

            if count==0:
                Members.third_party_sign_up(user_name, user_email, "google")
            
            encoded_jwt = jwt.encode({"third_party": "google", "email": user_email}, jwt_key, algorithm="HS256")
            api = {
            "ok":True
            }
            res = make_response((api), 200)
            res.set_cookie(key="shopwear_user", value=encoded_jwt, expires=time.time()+3600)
        else:
            # Invalid token
            api = {
            "error": True,
            "message": "登入失敗，帳號錯誤或其他原因"
            }
            res = make_response((api), 400)

    except:
        # Invalid token
        api = {
        "error": True,
        "message": "伺服器內部錯誤"
        }
        res = make_response((api), 500)

    return res

@app.route("/api/user", methods=["GET", "POST", "PATCH", "DELETE", "PUT"])
def user():
    if request.method == "GET":
        try:
            if "shopwear_user" in request.cookies:
                user_token = request.cookies.get("shopwear_user")
                decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
                email = decoded_jwt["email"]
                third_party = decoded_jwt["third_party"]
                data = Members.member_info(email, third_party)
                loggedin_api = {
                    "data": {
                        "name": data[1],
                        "email": data[2],
                        "number": data[4],
                        "address": data[5]
                    }
                }
                status = 200
            else:
                loggedin_api = {
                    "error": True,
                    "msg": "會員未登入"
                }
                status = 400
        except:
            res = {
                "error": True,
                "message": "伺服器內部錯誤"
                }
            status = 500
        return jsonify(loggedin_api), status

# sign up
    elif request.method == "POST":
        request_data = request.get_json()
        name = request_data["name"]
        email = request_data["email"]
        password = request_data["password"]
        number = request_data["number"]
        address = request_data["address"]
        re_name = "^([\u4e00-\u9fa5]{2,20}|[a-zA-Z.\s]{2,20})$"
        re_email = "^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$"

        if (re.search(re_name, name)!=None) & (re.search(re_email, email)!=None):
            member_count = Members.count_member(email)
        else:
            signup_api = {
                "error": True,
                "message": "註冊失敗，輸入格式錯誤。"
            }
            status = 400

        if member_count == 0:
            Members.sign_up(name, email, password, number, address)
            signup_api = {
                "ok": True
            }
            status = 200

        elif member_count == 1:
            signup_api = {
                "error": True,
                "message": "註冊失敗，重複的 Email 或其他原因。"
            }
            status = 400

        else:
            signup_api = {
                "error": True,
                "message": "伺服器內部錯誤。"
            }
            status = 500
        res = make_response((signup_api), status)
        return res
        
# sign in
    elif request.method == "PATCH":
        request_data = request.get_json()
        email = request_data["email"]
        password = request_data["password"]
        data = Members.verify_member(email, password)

        if data == 1:
            encoded_jwt = jwt.encode({"third_party": False, "email": email}, jwt_key, algorithm="HS256")
            signin_api = {
                "ok": True
            }
            res = make_response((signin_api),200)
            res.set_cookie(key="shopwear_user", value=encoded_jwt, expires=time.time()+3600)
            
        elif data == 0:
            signin_api = {
                "error": True,
                "message": "登入失敗，帳號或密碼錯誤或其他原因"
            }
            res = make_response((signin_api), 400)

        else:
            signin_api = {
                "error": True,
                "message": "伺服器內部錯誤"
            }
            res = make_response((signin_api), 500)

        return res
        
# log out
    elif request.method == "DELETE":
        loggedout_api = {
            "ok": True
        }
        res = make_response((loggedout_api), 200)
        res.set_cookie("shopwear_user", "", expires=0)
        return res

# change password
    elif request.method == "PUT":
        pws = request.get_json() #email, old_pw, new_pw, confirm_pw
        try:
            old_member_data = Members.verify_member(pws["email"], pws["old_pw"])
            if old_member_data == 1:
                if pws["old_pw"]==pws["new_pw"]:
                    res = {
                    "error": True,
                    "message": "新舊密碼不可相同"
                    }
                    status = 400
                elif (pws["old_pw"]!=pws["new_pw"]) & (pws["new_pw"]==pws["confirm_pw"]) & (pws["new_pw"]!=""):
                    Members.update_pw(pws["email"], pws["old_pw"], pws["new_pw"])
                    res = {
                    "ok": True
                    }
                    status = 200
                elif pws["new_pw"]!=pws["confirm_pw"]:
                    res = {
                    "error": True,
                    "message": "新密碼不相同"
                    }
                    status = 400
                elif pws["new_pw"]=="":
                    res = {
                    "error": True,
                    "message": "請輸入新密碼"
                    }
                    status = 400
            else:
                res = {
                    "error": True,
                    "message": "密碼輸入錯誤"
                    }
                status = 400
        except:
            res = {
                "error": True,
                "message": "伺服器內部錯誤"
                }
            status = 500
        return jsonify(res), status

# @app.route("/api/orders", methods=["POST"])
# def receive_order():
#     user_token = request.cookies.get("shopwear_user")
#     try:
#         if user_token:
#             decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
#             member_email = decoded_jwt["email"]
#             order_data = request.get_json()
#             prime = order_data["prime"]
#             amount = order_data["order"]["price"]
#             name = order_data["order"]["contact"]["name"]
#             email = order_data["order"]["contact"]["email"]
#             phone = order_data["order"]["contact"]["phone"]
#             member_id = MemberDB.search_member(member_email)[0]
#             attract_id = order_data["order"]["trip"]["attraction"]["id"]
#             attract_name = order_data["order"]["trip"]["attraction"]["name"]
#             date = order_data["order"]["trip"]["date"]
#             order_no = str(member_id) + "-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

#             re_name = "^([\u4e00-\u9fa5]{2,20}|[a-zA-Z.\s]{2,20})$"
#             re_email = "^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$"
#             re_phone = "^09[0-9]{8}$"
#             if (re.search(re_name, name)!=None) & (re.search(re_email, email)!=None) & (re.search(re_phone, phone)!=None):
#                 OrdersDB.create_order(member_id, attract_id, attract_name, date, amount, name, email, phone, order_no)
#             else:
#                 order_response = {
#                     "error": True,
#                     "message": "訂單建立失敗，輸入格式錯誤。"
#                     }
#                 return jsonify(order_response), 400

#             url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
#             myobj = {
#                 "prime": prime,
#                 "partner_key": partner_key,
#                 "merchant_id": merchant_id,
#                 "details": tappay_details,
#                 "amount": amount,
#                 "cardholder": {
#                     "phone_number": phone,
#                     "name": name,
#                     "email": email,
#                 },
#                 "remember": True
#             }
#             header = {
#                 "Content-Type": "application/json",
#                 "x-api-key": x_api_key}
#             response = requests.post(url, json=myobj, headers=header)
#             tappay_response = json.loads(response.text)

#             if tappay_response["status"]==0:
#                 OrdersDB.pay_order(order_no, tappay_response["status"])
#                 order_response = {
#                     "data": {
#                         "number": order_no,
#                         "payment": {
#                         "status": 0,
#                         "message": "付款成功"
#                         }
#                     }
#                     }
#                 return jsonify(order_response), 200
#             else:
#                 order_response = {
#                     "error": True,
#                     "message": "訂單建立失敗，輸入不正確或其他原因"
#                     }
#                 return jsonify(order_response), 400
#         else:
#             order_response = {
#                 "error": True,
#                 "message": "未登入系統，拒絕存取"
#                 }
#             return jsonify(order_response), 403
#     except:
#         order_response = {
#             "error": True,
#             "message": "伺服器內部錯誤"
#             }
#         return jsonify(order_response), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)
    # app.run(debug=True, port=5000)