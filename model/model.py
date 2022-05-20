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

# class Members:
#     @staticmethod
#     def sign_up(name, email):
#         cnx = cnxpool.get_connection()
#         cursor = cnx.cursor()
#         sql = "INSERT INTO members('name', 'email') VALUES(%s, %s)"
#         val = (name, email)
#         cursor.execute(sql, val)
#         cnx.commit()
#         cursor.close()
#         cnx.close()
#         return

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