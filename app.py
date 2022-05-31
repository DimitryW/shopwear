from distutils.ccompiler import new_compiler
from flask import *
from flask_cors import CORS
import jwt
import time
import requests
from dotenv import load_dotenv
import json
import datetime
import os
import re
import boto3
import config


from model.model import Products, Products_Photos, Members, Orders, Wears
from google.oauth2 import id_token
import google.auth.transport.requests
import requests

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

s3 = boto3.client(
    "s3",
    aws_access_key_id=config.aws_access_key_id,
    aws_secret_access_key=config.aws_secret_access_key
)


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

#結帳完成頁面
@app.route("/thankyou")
def thankyou():
    order_no = request.args.get("order")
    return render_template("thankyou.html", order_no=order_no)

# 登入頁面
@app.route("/login", methods=["GET", "POST"])
def login():
    return render_template("login.html")

#會員頁面
@app.route("/member")
def member():
    return render_template("member.html")

#更改密碼
@app.route("/password")
def password():
    return render_template("password.html")

#個人頁面
@app.route("/mywear/<member_id>")
def mywear(member_id):
    return render_template("mywear.html")

#個人頁面
@app.route("/wear")
def wear():
    return render_template("wear.html")

#全部產品資料
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

# 單一產品資料
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


# Google登入
@app.route('/api/googleuser', methods=["POST"])
def api_login():
    data = request.get_json()
    token = data["token"]
    
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        # 如果有時間差，用clock_skew_in_seconds來調整
        id_info = id_token.verify_oauth2_token(token, google.auth.transport.requests.Request(), "286685632918-hl2ehilfl64emfu0ost6r1let7kse4fd.apps.googleusercontent.com", clock_skew_in_seconds=37)

        if id_info:
            # ID token is valid. 
            # user_id = id_info['sub']
            user_name = id_info['name']
            user_email = id_info['email']
            
            count = Members.check_member(user_name, user_email, "google")

            if count==0:
                Members.sign_up(user_name, user_email, "google", "", "", "google")
            
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

# 會員註冊、登入與登出
@app.route("/api/user", methods=["GET", "POST", "PATCH", "DELETE"])
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
                        "gender":data[7],
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
            loggedin_api = {
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
            member_count = Members.count_member(email, False)
        else:
            signup_api = {
                "error": True,
                "message": "註冊失敗，輸入格式錯誤。"
            }
            status = 400

        if member_count == 0:
            Members.sign_up(name, email, password, number, address, False)
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
        data = Members.verify_member(email, password, False)
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


#更新會員資料API
@app.route("/api/member", methods=["PATCH"])
def api_member():
    try:
        if "shopwear_user" in request.cookies:
                user_token = request.cookies.get("shopwear_user")
                decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
                email = decoded_jwt["email"]
                third_party = decoded_jwt["third_party"]
                data = request.get_json()
                Members.update_member(data["name"], data["gender"], data["number"], data["address"], email, third_party)
                res = {
                    "ok": True
                    }
                status = 200
        else:
            res = {
                "error": True,
                "message": "請先登入會員"
            }
            status = 400

    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status = 500

    return jsonify(res), status

#更新會員密碼API
@app.route("/api/password", methods=["PATCH"])
def api_password():
    try:
        if "shopwear_user" in request.cookies:
                user_token = request.cookies.get("shopwear_user")
                decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
                email = decoded_jwt["email"]
                third_party = decoded_jwt["third_party"]
                data = request.get_json()
                old_data = Members.verify_member(email, data["old_pw"], third_party)
                if old_data == 1:
                    if data["old_pw"]==data["new_pw"]:
                        res = {
                        "error": True,
                        "message": "新舊密碼不可相同"
                        }
                        status = 400
                    elif (data["old_pw"]!=data["new_pw"]) & (data["new_pw"]==data["confirm_pw"]) & (data["new_pw"]!=""):
                        Members.update_pw(data["new_pw"], email, third_party)
                        res = {
                        "ok": True
                        }
                        status = 200
                    elif data["new_pw"]!=data["confirm_pw"]:
                        res = {
                        "error": True,
                        "message": "新密碼與確認密碼不相同"
                        }
                        status = 400
                    elif data["new_pw"]=="":
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
        else:
            res = {
                "error": True,
                "message": "請先登入會員"
            }
            status = 400
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status = 500

    return jsonify(res), status

#建立訂單與付款
@app.route("/api/orders", methods=["POST"])
def receive_order():
    user_token = request.cookies.get("shopwear_user")
    try:
        if user_token:
            decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"]) 
            email = decoded_jwt["email"]
            third_party = decoded_jwt["third_party"]
            #取得訂單資料
            order_data = request.get_json()  
            prime = order_data["prime"] #tappay prime
            amount = order_data["order"]["amount"]
            items = order_data["order"]["items"]
            address = order_data["order"]["address"]
            member_data = Members.member_info(email, third_party)
            member_id = member_data[0]
            name = member_data[1]
            phone = member_data[4]
            order_no = str(member_id) + "-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

            # 資料庫建立訂單
            Orders.create_order(order_no, member_id, amount, address)
            for i in range(len(items)):
                # print(items[i]["prod_id"])
                Orders.create_order_details(order_no, items[i]["prod_id"], items[i]["prod_color"], items[i]["prod_size"], items[i]["prod_price"], items[i]["prod_qty"])
            
            # Tappay請求
            url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
            myobj = {
                "prime": prime,
                "partner_key": partner_key,
                "merchant_id": merchant_id,
                "details": tappay_details,
                "amount": amount,
                "cardholder": {
                    "phone_number": phone,
                    "name": name,
                    "email": email,
                },
                "remember": True
            }
            header = {
                "Content-Type": "application/json",
                "x-api-key": x_api_key}
            response = requests.post(url, json=myobj, headers=header)
            tappay_response = json.loads(response.text)
            # print(tappay_response)
            if tappay_response["status"]==0:
                print("taypay payment ok")
                Orders.pay_order(order_no, tappay_response["status"])
                order_response = {
                    "data": {
                        "number": order_no,
                        "payment": {
                        "status": 0,
                        "message": "付款成功"
                        }
                    }
                    }
                return jsonify(order_response), 200
            else:
                order_response = {
                    "error": True,
                    "message": "訂單建立失敗，輸入不正確或其他原因"
                    }
                return jsonify(order_response), 400
        else:
            order_response = {
                "error": True,
                "message": "未登入系統，拒絕存取"
                }
            return jsonify(order_response), 403
    except:
            order_response = {
                "error": True,
                "message": "伺服器內部錯誤"
                }
            return jsonify(order_response), 500


# Wear資料API
@app.route("/api/wear")
def api_wear():
    page = request.args.get("page", default=0, type=int)
    (data, total) = Wears.show_photos(index=page*12)
    
    res = {
        "total_page": (total//12) if total%12==0 else (total//12)+1,
        "next_page": page+1 if page < (total//12) else None,
        "data":[]
    }
    
    for i in range(len(data)):
        photos={
            "id": data[i][0],
            "photo":data[i][1],
            "member_id": data[i][2], 
            "caption": data[i][3]
        }
        res["data"].append(photos)
    status=200

    return jsonify(res), status

# mywear上傳貼文
@app.route("/api/mywear/upload", methods=['POST'])
def upload_mywear():
    if "shopwear_user" in request.cookies:
        # message = request.form["text"]
        if "pic" not in request.files:
            # BoardMsg.SaveMsg(message)
            # print("save msg")
            res = {
                "error":True,
                "message": "沒有檔案"
                }
            status=400
            print("err")
            return jsonify(res), status
        else:
            user_token = request.cookies.get("shopwear_user")
            decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"]) 
            email = decoded_jwt["email"]
            third_party = decoded_jwt["third_party"]
            member_data = Members.member_info(email, third_party)
            member_id = member_data[0]
            file = request.files["pic"]
            file_name = str(member_id) + "-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            s3.upload_fileobj(file, "vaapadshopwear", f"mywear/{member_id}/{file_name}")
            Wears.upload_wears(file_name, member_id, "")
            print("uploaded")
            res = {
                "ok": True,
                "file_name": file_name
                }
            status = 200
            
    else:
            res = {
                "error": True,
                "message": "請先登入會員"
            }
            status = 400

    return jsonify(res), status

if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=3000)
    app.run(debug=True, port=5000)