from config import dbconfig
import mysql.connector
import mysql.connector.pooling


cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mypool", pool_size = 20, pool_reset_session=True, **dbconfig)

# 產品資料查詢
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
        sql = "SELECT products.id, product_name, price, description, content, src, size_suggest FROM products JOIN products_photos ON products.id = products_photos.product_id WHERE products.id=%s"
        cursor.execute(sql, (product_id,) )
        data = cursor.fetchall()

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
        return (data, stock_list)
    
    
# 產品照片
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

# 會員資料
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
    def update_member(nickname, gender, number, address, email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "UPDATE members SET nickname=%s, gender=%s, number=%s, address=%s WHERE email=%s AND third_party=%s"
        val = (nickname, gender, number, address, email, third_party)
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

# 訂單資料
class Orders:
    @staticmethod
    def create_order(order_no, member_id, date, amount, address):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO orders(order_no, member_id, date, amount, address) VALUES(%s, %s, %s, %s, %s)"
        val = (order_no, member_id, date, amount, address)
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

    @staticmethod
    def check_orders(member_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT * FROM orders WHERE member_id=%s"
        val = (member_id,)
        cursor.execute(sql, val)
        orders = cursor.fetchall()
        cursor.close()
        cnx.close()
        return orders

    @staticmethod
    def check_order_details(order_no):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT product_name, color, size, order_details.price, qty FROM order_details\
             JOIN products ON order_details.product_id=products.id WHERE order_no=%s"
        val = (order_no,)
        cursor.execute(sql, val)
        order_details = cursor.fetchall()
        cursor.close()
        cnx.close()
        return order_details

# 分享貼文資料
class Wears:
    @staticmethod
    def show_photos(index=0, limit=12):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        cursor.execute("SELECT COUNT(*) from wears")
        count = cursor.fetchone()[0]
        sql = "SELECT wears.id, wears.photo, member_id, caption, members.nickname, members.name, members.photo FROM wears JOIN members ON wears.member_id=members.id ORDER BY id DESC LIMIT %s, %s"
        cursor.execute(sql, (index, limit))
        data = cursor.fetchall()
        cursor.close()
        cnx.close()
        return (data, count)
    
    @staticmethod
    def show_mywear(member_id, index=0,  limit=3):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        cursor.execute("SELECT COUNT(*) FROM wears WHERE member_id=%s ORDER BY id DESC" , (member_id,))
        count = cursor.fetchone()[0]
        if count==0:
            sql = "SELECT name, nickname, photo FROM members WHERE id=%s"
            val = (member_id,)
            cursor.execute(sql, val)
            data = cursor.fetchone()
            # print(data)
        else:
            sql = "SELECT wears.id, wears.photo, member_id, caption, nickname, members.photo, members.name\
                FROM wears JOIN members ON wears.member_id=members.id WHERE member_id=%s ORDER BY wears.id DESC LIMIT %s, %s"
            val = (member_id, index, limit)
            cursor.execute(sql, val)
            data = cursor.fetchall()

        # print(data)
        cursor.close()
        cnx.close()
        return (data, count)

    @staticmethod
    def show_wear_detail(wear_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor(buffered=True)
        cursor.execute("SELECT * FROM wears JOIN wears_products ON wears.id=wears_products.wears_id WHERE wears.id=%s" , (wear_id,))
        data = cursor.fetchall()
        # print(cnx.is_connected() )
        cursor.execute("SELECT * FROM members WHERE id=%s" , (data[0][2],))
        member_data = cursor.fetchone()
        # print(cnx.is_connected() )
        product_photos=[]
        for i in range(len(data)):
            if data[i][6]!=None:
                cursor.execute("SELECT src FROM products_photos WHERE product_id=%s" , (data[i][6],))
                product_photos.append(cursor.fetchone()[0]) 
        cursor.execute("SELECT COUNT(*) FROM likes WHERE wear_id=%s and status='liked'" , (data[0][0],))
        likes = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
        return (data, member_data, product_photos, likes)
        
    @staticmethod
    def upload_photo_sticker(photo, member_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        cursor.execute("UPDATE members SET photo=%s WHERE id=%s" , (photo, member_id))
        cnx.commit()
        cursor.close()
        cnx.close()
        return

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
        
        if len(product_id)==0:
            sql = "INSERT INTO wears_products(wears_id, product_id) VALUES(%s, %s)"
            val = (wears_id, None)
            cursor.execute(sql, val)
            cnx.commit()
        else:
            for i in range(len(product_id)):
                sql = "INSERT INTO wears_products(wears_id, product_id) VALUES(%s, %s)"
                val = (wears_id, product_id[i])
                cursor.execute(sql, val)
                cnx.commit()
        
        cursor.close()
        cnx.close()
        return

    @staticmethod
    def delete_wear(wear_id, email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "DELETE FROM wears WHERE id=%s AND member_id=(SELECT id FROM members WHERE email=%s AND third_party=%s)"
        val=(wear_id, email, third_party)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return
    
# 案讚資料
class Likes:
    @staticmethod
    def update_like(wear_id, email, third_party, status):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO likes(wear_id, member_id, status)\
             VALUES(%s, (SELECT id FROM members WHERE email=%s AND third_party=%s), %s) ON DUPLICATE KEY UPDATE status=%s"
        val=(wear_id, email, third_party, status, status)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.execute("SELECT COUNT(*) FROM likes WHERE wear_id=%s and status='liked'" , (wear_id,))
        Likes = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
        return Likes

    @staticmethod
    def check_like(email, third_party, wear_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT COUNT(*), status FROM likes WHERE member_id=(SELECT id FROM members WHERE email=%s AND third_party=%s)\
            AND wear_id=%s"
        val=(email, third_party, wear_id)
        cursor.execute(sql, val)
        like_stat = cursor.fetchone()[1]
        cursor.close()
        cnx.close()
        return like_stat

