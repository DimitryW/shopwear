from flask import *
from flask_cors import CORS
import sys
sys.path.append('../shopwear')
from api import blueprints


app = Flask(__name__, static_folder="../static", template_folder="../templates")
app.register_blueprint(blueprints, url_prefix="/api")
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

#結帳頁面    
@app.route("/order")
def orders():
    return render_template("order.html")

# 登入頁面
@app.route("/login")
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

#WEAR頁面
@app.route("/wear")
def wear():
    return render_template("wear.html")

#WEAR單頁
@app.route("/wear/<wear_id>")
def wear_single_page(wear_id):
    return render_template("wear_single.html")




if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=3000)
    app.run(debug=True, port=5000)