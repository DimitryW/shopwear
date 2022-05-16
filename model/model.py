from config import dbconfig
import mysql.connector
import mysql.connector.pooling



cnxpool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mypool", pool_size = 5, pool_reset_session=True, **dbconfig)



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
    def check_product_details(id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT id, product_name, price, description, content from products WHERE id=%s"
        cursor.execute(sql, (id,) )
        data = cursor.fetchone()
        cursor.close()
        cnx.close()
        return data

class Products_Photos:
    @staticmethod
    def show_photos(product_id):
        cnx = cnxpool.get_connection()
        cursor = cnx.cursor()
        sql = "SELECT src from products_photos where product_id = %s"
        cursor.execute(sql, (product_id,))
        data = cursor.fetchall()
        list_of_data = []
        for i in range(len(data)):
            list_of_data.append(data[i][0])
        cursor.close()
        cnx.close()
        return list_of_data

