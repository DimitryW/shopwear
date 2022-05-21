from config import dbconfig
import mysql.connector
import mysql.connector.pooling



cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mypool", pool_size = 10, pool_reset_session=True, **dbconfig)



class Products:
    @staticmethod
    def show_products(index=0, limit=12):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        cursor.execute("SELECT COUNT(*) from products")
        count = cursor.fetchone()[0]
        sql = "SELECT id, product_name, price, description, content from products LIMIT %s, %s"
        cursor.execute(sql, (index, limit))
        data = cursor.fetchall()
        cursor.close()
        cnx.close()
        return (data, count)


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
    def check_third_party_member(name, email):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT COUNT(*) from third_party_members WHERE name=%s AND email=%s"
        val = (name, email)
        cursor.execute(sql, val)
        count = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
        return count

    @staticmethod
    def member_info(email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        if third_party:
            sql = "SELECT * FROM third_party_members WHERE email=%s"
        else:
            sql = "SELECT * FROM members WHERE email=%s"
        val = (email,)
        cursor.execute(sql, val)
        data = cursor.fetchone()
        cursor.close()
        cnx.close()
        return data

    @staticmethod
    def verify_member(email, password):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT COUNT(*) from members WHERE email=%s AND password=%s"
        val = (email, password)
        cursor.execute(sql, val)
        count = cursor.fetchone()
        cursor.close()
        cnx.close()
        return count

    @staticmethod
    def count_member(email):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT COUNT(*) from members WHERE email=%s"
        val = (email,)
        cursor.execute(sql, val)
        count = cursor.fetchone()[0]
        cursor.close()
        cnx.close()
        return count

    @staticmethod
    def sign_up(name, email, password, number, address):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO members(name, email, password, number, address) VALUES(%s, %s, %s, %s, %s)"
        val = (name, email, password, number, address)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return

    @staticmethod
    def third_party_sign_up(name, email, third_party):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "INSERT INTO third_party_members(name, email, third_party) VALUES(%s, %s, %s)"
        val = (name, email, third_party)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return

    @staticmethod
    def update_pw(email, old_pw, new_pw):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "UPDATE members SET password=%s WHERE email=%s AND password=%s"
        val = (new_pw, email, old_pw)
        cursor.execute(sql, val)
        cnx.commit()
        cursor.close()
        cnx.close()
        return




# import os
# path = "D:\Coding\WeHelp\dimalife\shopwear photos\product photos"
# cnx = cnxpool.get_connection()
# cursor = cnx.cursor()
# for i in os.listdir(path):
#   for j in os.listdir(path + "\\" + i):
#     src = f"https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/{i}/{j}"
#     new_src = f"{i}/{j}"
#     sql = "UPDATE products_photos SET src = %s WHERE src = %s"
#     cursor.execute(sql, (new_src, src))
#     cnx.commit()

# cursor.close()
# cnx.close()

# cnx = cnxpool.get_connection()
# cursor = cnx.cursor()
# sql = "SELECT id, product_id, src FROM products_photos"
# cursor.execute(sql)
# data = cursor.fetchall()
# for i in data:
#     cursor.execute("INSERT INTO p_photos(id, product_id, src) VALUES(%s, %s, %s)", (i[0], i[1], i[2]))
#     cnx.commit()
# cursor.close()
# cnx.close()