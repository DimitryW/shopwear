from config import dbconfig
import mysql.connector
import mysql.connector.pooling




cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mypool", pool_size = 10, pool_reset_session=True, **dbconfig)



class Products:
    @staticmethod
    def show_products(category, subcategory, index=0, limit=12):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        if category=="" and subcategory=="":
            cursor.execute("SELECT COUNT(*) from products")
            count = cursor.fetchone()[0]
            sql = "SELECT id, product_name, price, description, content from products ORDER BY id DESC LIMIT %s, %s"
            val = (index, limit)
            # print(1)
        elif category!="" and subcategory=="":
            cursor.execute("SELECT COUNT(*) from products WHERE category=%s", (category,))
            count = cursor.fetchone()[0]
            sql = "SELECT id, product_name, price, description, content from products WHERE category=%s  ORDER BY id DESC LIMIT %s, %s"
            val = (category, index, limit)
            # print(2)
        elif category=="" and subcategory!="":
            cursor.execute("SELECT COUNT(*) from products WHERE subcategory=%s", (subcategory,))
            count = cursor.fetchone()[0]
            sql = "SELECT id, product_name, price, description, content from products WHERE subcategory=%s  ORDER BY id DESC LIMIT %s, %s"
            val = (subcategory, index, limit)
            # print(3)
        cursor.execute(sql, val)
        data = cursor.fetchall()
        cursor.close()
        cnx.close()
        return (data, count)

    @staticmethod
    def show_subcategory(subcategory):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT id, product_name FROM products WHERE subcategory=%s"
        cursor.execute(sql, (subcategory,) )
        data = cursor.fetchall()
        cursor.close()
        cnx.close()
        return data

    @staticmethod
    def check_product_details(product_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT * FROM products JOIN products_photos ON products.id = products_photos.product_id WHERE products.id=%s"
        cursor.execute(sql, (product_id,) )
        data = cursor.fetchall()
        cursor.close()
        cnx.close()
        return data
    
    @staticmethod
    def check_stock(product_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "select color from stock where product_id=%s group by color"
        cursor.execute(sql, (product_id,) )
        colors = cursor.fetchall()
        stock_list = {}
        for i in range(len(colors)):
            sql = "select size from stock where product_id=%s and color=%s"
            cursor.execute(sql, (product_id, colors[i][0]) )
            stock_list[colors[i][0]] = [size[0] for size in cursor.fetchall()]
        cursor.close()
        cnx.close()
        return stock_list

class Products_Photos:
    @staticmethod
    def show_photos(product_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT src FROM products_photos WHERE product_id = %s"
        cursor.execute(sql, (product_id,))
        data = cursor.fetchall()
        list_of_data = []
        for i in data:
            list_of_data += i
        cursor.close()
        cnx.close()
        return list_of_data

class Members:
    @staticmethod
    def check_member(name, email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT COUNT(*) from members WHERE name=%s AND email=%s AND third_party=%s"
        val = (name, email, third_party)
        cursor.execute(sql, val)
        count = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
        return count

    @staticmethod
    def member_info(email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT * FROM members WHERE email=%s AND third_party=%s"
        val = (email, third_party)
        cursor.execute(sql, val)
        data = cursor.fetchone()
        cursor.close()
        cnx.close()
        return data

    @staticmethod
    def verify_member(email, password, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT COUNT(*) from members WHERE email=%s AND password=%s AND third_party=%s"
        val = (email, password, third_party)
        cursor.execute(sql, val)
        count = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
        return count

    @staticmethod
    def count_member(email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT COUNT(*) from members WHERE email=%s AND third_party=%s"
        val = (email, third_party)
        cursor.execute(sql, val)
        count = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
        return count

    @staticmethod
    def sign_up(name, email, password, number, address, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO members(name, email, password, number, address, third_party) VALUES(%s, %s, %s, %s, %s, %s)"
        val = (name, email, password, number, address, third_party)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return

    @staticmethod
    def update_member(name, gender, number, address, email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "UPDATE members SET name=%s, gender=%s, number=%s, address=%s WHERE email=%s AND third_party=%s"
        val = (name, gender, number, address, email, third_party)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return

    @staticmethod
    def update_pw(new_pw, email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "UPDATE members SET password=%s WHERE email=%s AND third_party=%s"
        val = (new_pw, email, third_party)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return


class Orders:
    @staticmethod
    def create_order(order_no, member_id, amount, address):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO orders(order_no, member_id, amount, address) VALUES(%s, %s, %s, %s)"
        val = (order_no, member_id, amount, address)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return
    
    def create_order_details(order_no, product_id, color, size, price, qty):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO order_details(order_no, product_id, color, size, price, qty) VALUES(%s, %s, %s, %s, %s, %s)"
        val = (order_no, product_id, color, size, price, qty)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return
    
    @staticmethod
    def pay_order(order_no, status):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        cursor.execute("UPDATE orders SET payment='paid' Where order_no = %s", (order_no,))
        if status==0:
            cnx.commit()
        else:
            cnx.rollback()
        cursor.close()
        cnx.close()
        return

class Wears:
    @staticmethod
    def show_photos(index=0, limit=12):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        cursor.execute("SELECT COUNT(*) from products")
        count = cursor.fetchone()[0]
        sql = "SELECT id, photo, member_id, caption from wears LIMIT %s, %s"
        cursor.execute(sql, (index, limit))
        data = cursor.fetchall()
        cursor.close()
        cnx.close()
        return (data, count)

    @staticmethod
    def upload_wears(photo, member_id, product_id, caption):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO wears(photo, member_id,caption) VALUES(%s, %s, %s)"
        val = (photo, member_id, caption)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.execute("SELECT LAST_INSERT_ID()")
        wears_id = cursor.fetchone()[0]
        
        for i in range(len(product_id)):
            sql = "INSERT INTO wears_products(wears_id, product_id) VALUES(%s, %s)"
            val = (wears_id, product_id[i])
            cursor.execute(sql, val)
            cnx.commit()
            # print(product_id[i])
        
        cursor.close()
        cnx.close()
        return

    


#建立圖片路徑資料
# import os
# path = "D:/Coding/WeHelp/dimalife/shopwear photos/吳先生"
# cnx = cnxpool.get_connection()
# cursor = cnx.cursor()
# for i in os.listdir(path):
#     cursor.execute("SELECT id FROM products where product_name=%s", (i,))
#     pid = cursor.fetchone()[0]
#     for j in os.listdir(path + "\\" + i):
#         # print(i)
#         # print(j)
#         src = i+"/"+j
#         cursor.execute("INSERT INTO products_photos(product_id, src) VALUES(%s, %s)", (pid, src))
#         cnx.commit()
# cursor.close()
# cnx.close()


#更新RDS資料

# file_name = "D:/Coding/WeHelp/dimalife/stock - 複製.xlsx"
# sheet =  "Product"

# df = pd.read_excel(io=file_name, sheet_name=sheet)
#   # print first 5 rows of the dataframe
# # print(df)

# cnx = cnxpool.get_connection()
# cursor = cnx.cursor()

# for index, row in df.iterrows():
#     # print(row["product_name"])
#     # print(row["qty"])
#     cursor.execute("SELECT id FROM products where product_name=%s", (row["name"],))
#     pid = cursor.fetchone()[0]
#     cursor.execute("INSERT INTO stock(product_id, quantity, size,color) VALUES(%s,%s,%s,%s)", (pid, row["stock"],row["size"],row["color"]))
#     cnx.commit()

# cursor.close()
# cnx.close()