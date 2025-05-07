import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='Jaya@2002',
        database='giri_bazar'
    )
    return connection
