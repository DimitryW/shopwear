from flask import *
import jwt
from dotenv import load_dotenv
import json
import datetime
import time
import os
import re
import boto3
import requests
import sys
sys.path.append('../shopwear')
import config
from model.model import Products, Products_Photos, Members, Orders, Wears, Likes
from google.oauth2 import id_token
import google.auth.transport.requests

load_dotenv()
jwt_key = os.getenv("JWT_KEY")
partner_key = os.getenv("PARTNER_KEY")
merchant_id = os.getenv("MERCHANT_ID")
tappay_details = os.getenv("TAPPAY_DETAILS")
x_api_key = os.getenv("X_API_KEY")


s3 = boto3.client(
    "s3",
    aws_access_key_id=config.aws_access_key_id,
    aws_secret_access_key=config.aws_secret_access_key
)

blueprints = Blueprint("usr_bp", __name__, static_folder="../static", template_folder="../templates")

@blueprints.route("/products", methods=["GET"])
def api_product_index():
    try:
        page = request.args.get("page", default=0, type=int)
        category = request.args.get("category", default="", type=str)
        subcategory = request.args.get("subcategory", default="", type=str)
        (data, total) = Products.show_products(category, subcategory, index=page*12)
        
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
        resp = make_response((res), status)
        resp.cache_control.max_age = 3600
        # resp.cache_control.max_age = "no-cache"
        
    except:
        res = {
        "error":True,
        "message": "內部伺服器錯誤"
        }
        status=500
        resp = make_response((res), status)

    return resp


# 篩選產品子類別
@blueprints.route("/selectproducts", methods=["GET"])
def api_select_product():
    try:
        subcategory = request.args.get("subcategory", default="", type=str)
        # print(subcategory)
        data = Products.show_subcategory(subcategory)
        
        res = {
            "data":[]
        }
        
        for i in range(len(data)):
            product={
                "id": data[i][0],
                "product_name":data[i][1],
                # "price": data[i][2], 
                # "description": data[i][3], 
                # "content": data[i][4],
                "photo" : data[i][1] + "/" + data[i][1] + "-1.jpg"
            }
            res["data"].append(product)
        status=200

    except:
        res = {
        "error":True,
        "message": "內部伺服器錯誤"
        }
        status=500

    return jsonify(res), status

# 單一產品詳細資料
@blueprints.route("/product/<product_id>", methods=["GET"])
def api_product(product_id):
    try:
        data, stock = Products.check_product_details(product_id)
        res = {
        "id": data[0][0],
        "product_name":data[0][1],
        "price": data[0][2], 
        "description": data[0][3], 
        "content": data[0][4],
        "photo" : [x[5] for x in data],
        "size_suggest": data[0][6],
        "stock": stock
        }
        status=200
        resp = make_response((res), status)
        resp.cache_control.max_age = 3600
    except:
        res = {
        "error":True,
        "message": "內部伺服器錯誤"
        }
        status=500
        resp = make_response((res), status)

    return resp


# Google登入
@blueprints.route('/googleuser', methods=["POST"])
def api_login():
    data = request.get_json()
    token = data["token"]
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        # 如果有時間差，用clock_skew_in_seconds來調整
        id_info = id_token.verify_oauth2_token(token, google.auth.transport.requests.Request(),\
                "286685632918-hl2ehilfl64emfu0ost6r1let7kse4fd.apps.googleusercontent.com", clock_skew_in_seconds=10)
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
            res.set_cookie(key="shopwear_user", value=encoded_jwt, domain=".dimalife.com", expires=time.time()+10800)
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
@blueprints.route("/user", methods=["GET", "POST", "PATCH", "DELETE"])
def user():
    # 會員登入狀態
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
                        "id": data[0],
                        "name": data[1],
                        "nickname": data[10],
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

# 註冊
    elif request.method == "POST":
        request_data = request.get_json()
        name = request_data["name"]
        email = request_data["email"]
        password = request_data["password"]
        cfm_password = request_data["cfmPassword"]
        number = request_data["number"]
        address = request_data["address"]
        re_name = "^([\u4e00-\u9fa5]{2,20}|[a-zA-Z.\s]{2,20})$"
        re_email = "^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$"

        if password != cfm_password:
            signup_api = {
                "error": True,
                "message": "註冊失敗，確認密碼不相符。"
            }
            status = 400
            res = make_response((signup_api), status)
            return res

        if (re.search(re_name, name)!=None) & (re.search(re_email, email)!=None):
            member_count = Members.count_member(email, False)
        else:
            signup_api = {
                "error": True,
                "message": "註冊失敗，輸入格式錯誤。"
            }
            status = 400
            res = make_response((signup_api), status)
            return res

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
        
# 登入
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
            res.set_cookie(key="shopwear_user", value=encoded_jwt, domain=".dimalife.com", expires=time.time()+10800)
            
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
        
# 登出
    elif request.method == "DELETE":
        loggedout_api = {
            "ok": True
        }
        res = make_response((loggedout_api), 200)
        res.set_cookie("shopwear_user", "", domain=".dimalife.com", expires=0)
        return res

#更新會員資料
@blueprints.route("/member", methods=["PATCH"])
def api_member():
    try:
        if "shopwear_user" in request.cookies:
                user_token = request.cookies.get("shopwear_user")
                decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
                email = decoded_jwt["email"]
                third_party = decoded_jwt["third_party"]
                data = request.get_json()
                Members.update_member(data["nickname"], data["gender"], data["number"], data["address"], email, third_party)
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

#更新會員密碼
@blueprints.route("/password", methods=["PATCH"])
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

#建立訂單與確認付款
@blueprints.route("/orders", methods=["POST"])
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
            date = datetime.datetime.now().strftime("%Y/%m/%d-%H:%M:%S")
            member_data = Members.member_info(email, third_party)
            member_id = member_data[0]
            name = order_data["name"]
            phone = order_data["phone"]
            order_no = str(member_id) + "-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

            # 資料庫建立訂單
            Orders.create_order(order_no, member_id, date, amount, address)
            for i in range(len(items)):
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
            # 確認 Tappay請求結果
            if tappay_response["status"]==0:
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

# 查歷史訂單
@blueprints.route("/orders", methods=["GET"])
def check_orders():
    if "shopwear_user" in request.cookies:
        user_token = request.cookies.get("shopwear_user")
        decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
        email = decoded_jwt["email"]
        third_party = decoded_jwt["third_party"]
        member_data = Members.member_info(email, third_party)
        data = Orders.check_orders(member_data[0])
        res = {
            "data":[]
        }
        for i in range(len(data)):
            order={
                "id": data[i][0],
                "order_no":data[i][1],
                "date" : data[i][3],
                "amount": data[i][4],
                "payment": data[i][5],
                "address": data[i][6]
            }
            res["data"].append(order)
        status=200
    else:
        res = {
                "error": True,
                "message": "請先登入會員"
            }
        status = 400
    return jsonify(res), status

#查詳細訂單資料
@blueprints.route("/order_details/<order_no>", methods=["GET"])
def check_order_details(order_no): 
    try:
        data = Orders.check_order_details(order_no)
        res = {
            "data":[]
        }
        for i in range(len(data)):
            details={
                "product_name": data[i][0],
                "color": data[i][1],
                "size": data[i][2],
                "price": data[i][3],
                "qty": data[i][4]
            }
            res["data"].append(details)
        status=200
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status=500

    return jsonify(res), status

# Wear穿搭牆資料
@blueprints.route("/wears", methods=['GET'])
def api_wears():
    try:
        page = request.args.get("page", default=0, type=int)
        (data, total) = Wears.show_photos(index=page*12)
        total = (total//12) if total%12==0 else (total//12)+1
        
        res = {
            "total_page": total,
            "next_page": page+1 if page+1 < total else None,
            "data":[]
        }
        
        for i in range(len(data)):
            photos={
                "id": data[i][0],
                "photo":str(data[i][2]) + "/" + data[i][1],
                "member_id": data[i][2], 
                "caption": data[i][3],
                "member_nickname": None if (data[i][4]=="" or data[i][4]==None) else data[i][4],
                "member_name": data[i][5],
                "photo_sticker": data[i][6]
            }
            res["data"].append(photos)
        status=200
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status=500

    return jsonify(res), status

# MyWear資料
@blueprints.route("/mywear", methods=['GET'])
def api_mywear():
    try:
        page = request.args.get("page", default=0, type=int)
        member_id = request.args.get("member", type=int)
        (data, total) = Wears.show_mywear(member_id, index=page*3)
        total_page = (total//3) if total%3==0 else (total//3)+1
        if total==0:
            res = {
            "total_page": total_page,
            "next_page": page+1 if page+1 < total_page else None,
            "nickname": data[1],
            "member_name": data[0],
            "member_photo" : data[2],
            "total_post": total,
            "data":[]
        }
        else:
            res = {
                "total_page": total_page,
                "next_page": page+1 if page+1 < total_page else None,
                "nickname":data[0][4],
                "member_name":data[0][6],
                "member_photo" : data[0][5],
                "total_post": total,
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
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status=500

    return jsonify(res), status

# WEAR貼文資料
@blueprints.route("/wear/<wear_id>", methods=['GET'])
def api_wear_detail(wear_id):
    try:
        (data, member_data, product_photos, likes) = Wears.show_wear_detail(wear_id)
        # (data, product_photos) = Wears.show_wear_detail(wear_id)
        res = {
        "id": data[0][0],
        "photo":[str(data[0][2]) +"/"+ data[0][1]],
        "member_id":data[0][2],
        "member_nickname": None if (member_data[10]=="" or member_data[10]==None) else member_data[10],
        "member_name":member_data[1],
        "photo_sticker": member_data[9],
        "caption": data[0][3], 
        "product_id" : [x[6] for x in data],
        "product_photos":product_photos,
        "likes": likes,
        "user_like": None,
        "user_id": None
        }
        if "shopwear_user" in request.cookies:
            user_token = request.cookies.get("shopwear_user")
            decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"]) 
            email = decoded_jwt["email"]
            third_party = decoded_jwt["third_party"]
            user_data = Members.member_info(email, third_party)
            user_id = user_data[0]
            like_stat = Likes.check_like(email, third_party, wear_id)
            res["user_like"] = 1 if like_stat=="liked"  else 0
            res["user_id"] = user_id
        status=200
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status=500
    return jsonify(res), status

# 刪除Wear貼文
@blueprints.route("/wear/<wear_id>", methods=['DELETE'])
def delete_wear(wear_id):
    try:
        if "shopwear_user" in request.cookies:
            user_token = request.cookies.get("shopwear_user")
            decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
            email = decoded_jwt["email"]
            third_party = decoded_jwt["third_party"]
            Wears.delete_wear(wear_id, email, third_party)
            res = {
                "ok": True
            }
            status=200
        else:
            res = {
                    "error": True,
                    "message": "請先登入會員"
                }
            status = 401
    except:
        res = {
                "error": True,
                "message": "伺服器內部錯誤"
            }
        status = 500

    return jsonify(res), status


# mywear上傳貼文
@blueprints.route("/mywear/upload", methods=['POST'])
def upload_mywear():
    try:
        if "shopwear_user" in request.cookies:
            if "pic" not in request.files:
                res = {
                    "error":True,
                    "message": "沒有檔案"
                    }
                status=400
                return jsonify(res), status
            else:
                user_token = request.cookies.get("shopwear_user")
                decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"]) 
                email = decoded_jwt["email"]
                third_party = decoded_jwt["third_party"]
                member_data = Members.member_info(email, third_party)
                member_id = member_data[0]
                file = request.files["pic"]
                if "id" in request.form:
                    id_list = [int(x) for x in request.form["id"].split(",")]
                else:
                    id_list=[]
                caption = request.form["caption"]
                file_name = str(member_id) + "-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
                s3.upload_fileobj(file, "vaapadshopwear", f"mywear/{member_id}/{file_name}")
                Wears.upload_wears(file_name, member_id, id_list, caption)
                res = {
                    "ok": True,
                    "file_name": file_name,
                    "id":id_list,
                    "caption":caption
                    }
                status = 200
        else:
            res = {
                "error": True,
                "message": "請先登入會員"
            }
            status = 401
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status=500

    return jsonify(res), status

# mywear會員上傳大頭貼
@blueprints.route("/mywear/photo_sticker", methods=["POST"])
def photo_sticker():
    try:
        if "shopwear_user" in request.cookies:
            if "pic" not in request.files:
                res = {
                    "error": True,
                    "message": "沒有檔案"
                    }
                status=400
                return jsonify(res), status
            else:
                user_token = request.cookies.get("shopwear_user")
                decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"]) 
                email = decoded_jwt["email"]
                third_party = decoded_jwt["third_party"]
                member_data = Members.member_info(email, third_party)
                member_id = member_data[0]
                file = request.files["pic"]
                file_name =  str(member_id) + "-" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
                s3.upload_fileobj(file, "vaapadshopwear", f"mywear/photo_sticker/{file_name}")
                Wears.upload_photo_sticker(file_name, member_id)
                res = {
                    "ok": True,
                    "pic_src":file_name
                    }
                return jsonify(res)
        else:
            res = {
                    "error": True,
                    "message": "請先登入"}
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status=500
    return jsonify(res)

# 按讚資料
@blueprints.route("/like", methods=["POST"])
def update_like():
    try:
        if "shopwear_user" in request.cookies:
            user_token = request.cookies.get("shopwear_user")
            decoded_jwt = jwt.decode(user_token, jwt_key, algorithms=["HS256"])
            email = decoded_jwt["email"]
            third_party = decoded_jwt["third_party"]
            data = request.get_json()
            wear_id = data["wear_id"]
            like_stat=data["like_stat"]
            new_likes = Likes.update_like(wear_id, email, third_party, like_stat)
            res={
                "ok": True,
                "likes": new_likes
            }
            status=200
        else:
            res = {
                    "error": True,
                    "message": "請先登入"}
            status=400
    except:
        res = {
            "error": True,
            "message": "伺服器內部錯誤"
            }
        status=500
    return jsonify(res), status
