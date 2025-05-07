from flask import Flask, request, jsonify
from flask_cors import CORS
from config import get_db_connection
from datetime import date
import traceback 
import json

app = Flask(__name__)
CORS(app)

#Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
 
    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400
 
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
        result = cursor.fetchone()
        cursor.close()
 
        if result:
            # You can return more user info if needed (like role, designation, etc.)
            return jsonify({"success": True, "message": "Login successful"})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
 
    except Exception as e:
        print("Login error:", str(e))
        return jsonify({"success": False, "message": "Server error"}), 500

#AddCategoryproduct page
# Fetch all categories
@app.route('/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM categories")
    categories = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify({"categories": categories}), 200

@app.route('/addCategory', methods=['POST'])
def add_category():
    data = request.json
    category = data.get('category', '').strip()

    if not category:
        return jsonify({"error": "Category is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM categories WHERE name = %s", (category,))
    if cursor.fetchone():
        return jsonify({"message": "Category already exists"}), 409

    cursor.execute("INSERT INTO categories (name) VALUES (%s)", (category,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Category added successfully"}), 201

@app.route('/addProduct', methods=['POST'])
def add_product():
    data = request.json
    category = data.get('category', '').strip()
    product = data.get('product', '').strip()

    if not category or not product:
        return jsonify({"error": "Both category and product are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM categories WHERE name  = %s", (category,))
    category_row = cursor.fetchone()

    if not category_row:
        return jsonify({"error": "Category does not exist"}), 404

    category_id = category_row[0]

    cursor.execute("SELECT * FROM products WHERE product_name    = %s AND category_id = %s", (product, category_id))
    if cursor.fetchone():
        return jsonify({"message": "Product already exists in category"}), 409

    cursor.execute("INSERT INTO products (product_name   , category_id, name) VALUES (%s, %s, %s)", (product, category_id, category))
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Product added successfully",
        "products": [{
            "name": product,
            "category": category
        }]
    }), 201

@app.route('/getAllProducts', methods=['GET'])
def get_all_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT c.name, p.product_name FROM products p JOIN categories c ON p.category_id = c.id")
    rows = cursor.fetchall()
    conn.close()

    products_by_category = {}
    for category, product in rows:
        products_by_category.setdefault(category, []).append(product)

    return jsonify({"products": products_by_category}), 200

@app.route('/setPrice', methods=['POST'])
def set_product_price():
    data = request.json
    category = data.get('category', '').strip()
    product = data.get('product', '').strip()
    price = data.get('price')

    if not category or not product or price is None:
        return jsonify({"error": "Category, product, and price are required"}), 400

    try:
        price = float(price)
    except ValueError:
        return jsonify({"error": "Invalid price format"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM categories WHERE name = %s", (category,))
    category_row = cursor.fetchone()
    if not category_row:
        return jsonify({"error": "Category not found"}), 404

    category_id = category_row[0]

    cursor.execute(
        "SELECT id FROM products WHERE product_name = %s AND category_id = %s",
        (product, category_id)
    )
    product_row = cursor.fetchone()
    if not product_row:
        return jsonify({"error": "Product not found in category"}), 404

    product_id = product_row[0]

    cursor.execute(
        "UPDATE products SET price_per_kg = %s WHERE id = %s",
        (price, product_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": f"Price set to ₹{price:.2f} for {product} added successfully"}), 200

# AddPurchased Page
@app.route('/fetchAllProducts', methods=['GET'])
def fetch_all_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT name AS category, product_name AS product, price_per_kg FROM products")
    rows = cursor.fetchall()

    data = {}
    for row in rows:
        category = row['category']
        if category not in data:
            data[category] = []
        data[category].append({
            "name": row['product'],
            "price_per_kg": row['price_per_kg']
        })
    conn.commit()
    conn.close()
    return jsonify(data), 200

@app.route('/addProductEntry', methods=['POST'])
def add_product_entry():
    data = request.get_json()
    category = data.get('category')
    product = data.get('product')
    quantity = data.get('quantity')
    price = data.get('price')

    if not all([category, product, quantity, price]):
        return jsonify({'message': 'Missing fields'}), 400

    try:
        quantity = float(quantity)
        price = float(price)
        price_per_unit = price / quantity if quantity != 0 else 0
    except ValueError:
        return jsonify({'message': 'Invalid quantity or price'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    purchase_date = date.today()
    # Check if entry exists
    cursor.execute("""
        SELECT id, quantity, price FROM product_entries
        WHERE category = %s AND product = %s AND DATE(purchase_date) = %s
    """, (category, product, purchase_date))
    existing = cursor.fetchone()
 
    if existing:
        existing_id = existing[0]
        existing_quantity = existing[1]
        existing_price = existing[2]

        new_quantity = existing_quantity + quantity
        new_price = existing_price + price
        new_price_per_unit = new_price / new_quantity if new_quantity != 0 else 0

        cursor.execute("""
            UPDATE product_entries 
            SET quantity = %s, price = %s, price_per_unit = %s 
            WHERE id = %s
        """, (new_quantity, new_price, new_price_per_unit, existing_id))
    else:
        cursor.execute("""
            INSERT INTO product_entries (category, product, quantity, price, price_per_unit) 
            VALUES (%s, %s, %s, %s, %s)
        """, (category, product, quantity, price, price_per_unit))

    # Always insert into product_entry_history
    cursor.execute("""
        INSERT INTO product_entry_history (category, product, quantity, price, price_per_unit) 
        VALUES (%s, %s, %s, %s, %s)
    """, (category, product, quantity, price, price_per_unit))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Product entry added successfully'}), 201

#List screen(History page)
@app.route('/getProductHistory', methods=['GET'])
def get_product_history():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM product_entry_history ORDER BY created_at DESC")
    history = cursor.fetchall()
    conn.commit()
    conn.close()
    return jsonify(history), 200

#Inventory Page
@app.route('/getProductInventory',methods=['GET'])
def get_product_inventory():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # purchase_date = request.args.get('purchase_date')
    # if not purchase_date:
    #     return jsonify({'error':'purchase_date parameter is required'}), 400
    # cursor.execute("SELECT * FROM product_entries WHERE DATE(purchase_date) = %s",(purchase_date,))
    cursor.execute("""SELECT * FROM product_entries WHERE DATE(purchase_date) = CURDATE()""")
    inventory = cursor.fetchall()
    conn.commit()
    conn.close()
    return jsonify(inventory), 200

    

#Sell page
@app.route('/getInventory', methods=['GET'])
def get_inventory():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT category, product, quantity, price, price_per_unit 
        FROM product_entries WHERE DATE(purchase_date) = CURDATE()
    """)
    rows = cursor.fetchall()

    inventory = [{
        'category': row[0],
        'product': row[1],
        'quantity': row[2],
        'price': row[3],
        'price_per_unit': row[4]
    } for row in rows]

    conn.close()
    return jsonify(inventory), 200
@app.route('/sellProduct', methods=['POST'])
def sell_product():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Invalid or missing JSON'}), 400
 
        category = data.get('category')
        product = data.get('product')
        quantity = data.get('quantity')
 
        if not all([category, product, quantity]):
            return jsonify({'message': 'Missing fields'}), 400
 
        try:
            quantity = float(quantity)
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid quantity'}), 400
 
        conn = get_db_connection()
        cursor = conn.cursor(buffered=True)
 
        # Fetch from inventory
        cursor.execute("""
            SELECT quantity, price, price_per_unit
            FROM product_entries
            WHERE category = %s AND product = %s
        """, (category, product))
        item = cursor.fetchone()
 
        if not item:
            return jsonify({'message': 'Product not found'}), 404
 
        current_qty, current_price, price_per_unit = item
 
        if quantity > current_qty:
            return jsonify({'message': 'Insufficient stock'}), 400
 
        total_price = quantity * price_per_unit
 
        # Insert into sales table
        cursor.execute("""
            INSERT INTO sales (category, product, quantity, total_price)
            VALUES (%s, %s, %s, %s)
        """, (category, product, quantity, total_price))
 
        # Update inventory
        new_qty = current_qty - quantity
        new_total_price = current_price - total_price
        new_price_per_unit = new_total_price / new_qty if new_qty > 0 else 0
 
        cursor.execute("""
            UPDATE product_entries
            SET quantity = %s, price = %s, price_per_unit = %s
            WHERE category = %s AND product = %s
        """, (new_qty, new_total_price, new_price_per_unit, category, product))
 
        stock_alert = False
        threshold_qty = 0.2 * (current_qty + quantity)  # original qty before sale
        if new_qty <= threshold_qty:
            stock_alert = True
 
        conn.commit()
        conn.close()
 
        return jsonify({
            'message': 'Product sold successfully',
            'total_price': total_price,
            'stock_alert': stock_alert,
            'remaining_quantity': new_qty
        }), 200
 
    except Exception as e:
        print("Error in /sellProduct:", str(e))
        traceback.print_exc()
        return jsonify({'message': 'Internal server error'}), 500
  
#Sale History page
@app.route('/getSaleHistory', methods=['GET'])
def get_sale_history():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT product, category, quantity, total_price, sale_date FROM sales ORDER BY sale_date DESC")
        rows = cursor.fetchall()

        if not rows:
            print("No sales found.")
            return jsonify([]), 200

        sales = []
        for row in rows:
            sales.append({
                'name': row['product'],
                'category': row['category'],
                'quantity': float(row['quantity']),
                'price': float(row['total_price']),
                'created_at': row['sale_date'].strftime('%Y-%m-%d %H:%M:%S')
            })

        # print("Fetched sales:", sales)
        return jsonify(sales), 200

    except Exception as e:
        print("Error in /getSaleHistory:", str(e))
        traceback.print_exc()  # This will print full traceback in your terminal
        return jsonify({'message': 'Failed to retrieve sale history.'}), 500
    
#Reportspage
@app.route('/api/sales-report', methods=['GET'])
def sales_report():
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fix for inclusive date range
    query = """
        SELECT product, category, SUM(quantity) AS quantity, SUM(total_price) AS total_price
        FROM sales
        WHERE sale_date >= %s AND sale_date < DATE_ADD(%s, INTERVAL 1 DAY)
        GROUP BY category, product
    """
    cursor.execute(query, (from_date, to_date))
    results = cursor.fetchall()
    print(f"From date: {from_date}, To date: {to_date}")
    sanitized_sales = []
    for row in results:
        if row['quantity'] is not None and row['total_price'] is not None:
            sanitized_sales.append({
                'product': row['product'],
                'category': row['category'],
                'quantity': float(row['quantity']),
                'total_price': float(row['total_price']),
            })

    cursor.close()
    conn.close()
    return jsonify(sanitized_sales)

#Profit&Loss page
@app.route("/api/profitloss/today", methods=["GET"])
def get_today_data():
    today = date.today().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Total sale today
        cursor.execute("SELECT COALESCE(SUM(total_price), 0) AS total_sale FROM sales WHERE DATE(sale_date) = %s", (today,))
        sale_result = cursor.fetchone()
        print("Sales result:", sale_result)

        # Total loaded stock today
        cursor.execute("SELECT COALESCE(SUM(price), 0) AS loaded_stock FROM product_entry_history WHERE DATE(created_at) = %s", (today,))
        loaded_result = cursor.fetchone()
        print("Loaded stock result:", loaded_result)

        # Remaining stock in inventory (total value)
        cursor.execute("SELECT COALESCE(SUM(price), 0) AS remaining_stock FROM product_entries WHERE DATE(purchase_date) = %s",(today,))
        remaining_result = cursor.fetchone()
        print("Remaining stock result:", remaining_result)

        response = {
            'total_sale': float(sale_result['total_sale']),
            'loaded_stock': float(loaded_result['loaded_stock']),
            'remaining_stock': float(remaining_result['remaining_stock'])
        }

        return jsonify(response)

    except Exception as e:
        print("Error in /api/profitloss/today:", str(e))
        return jsonify({
            'total_sale': 0.0,
            'loaded_stock': 0.0,
            'remaining_stock': 0.0,
            'error': str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/api/profitloss/save', methods=['POST'])
def save_profit_loss():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO profit_loss 
        (date, total_sale, loaded_stock, remaining_stock, daily_expense, profit_or_loss)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        data['date'],
        data['total_sale'],
        data['loaded_stock'],
        data['remaining_stock'],
        data['daily_expense'],
        data['profit_or_loss']
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Profit or loss saved successfully'}), 201

#-----------------------------------------------------------

@app.route('/add-account', methods=['POST'])
def add_account():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            INSERT INTO seller_details (sellerName, phoneNumber, vehicleId, driverName)
            VALUES (%s, %s, %s, %s)
        """, (data['sellerName'], data['phoneNumber'], data['vehicleId'], data['driverName']))
        conn.commit()
        return jsonify({"message": "Account saved successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
 
@app.route('/get-accounts', methods=['GET'])
def get_accounts():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM seller_accounts")
    rows = cursor.fetchall()
    accounts = []
    for row in rows:
        accounts.append({
            "id": row[0],
            "sellerName": row[1],
            "phoneNumber": row[2],
            "vehicleId": row[3],
            "driverName": row[4]
        })
    return jsonify(accounts)
# ---------------------------------------------------

@app.route('/add-entry', methods=['POST'])
def add_entry():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    vehicle = data.get('vehicle', {})
    driver = data.get('driver', {})
 
    try:
        cursor.execute("""
            INSERT INTO vehicle_driver (
                vehicleID, vehicleName, vehicleCapacity,
                driverName, driverPhone, driverLicense, dailyWages
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            vehicle.get('vehicleID'),
            vehicle.get('vehicleName'),
            int(vehicle.get('vehicleCapacity')),
            driver.get('driverName'),
            driver.get('driverPhone'),
            driver.get('driverLicense'),
            float(driver.get('dailyWages'))
        ))
        conn.commit()
        return jsonify({'message': 'Entry added successfully'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
 
@app.route('/get-entries', methods=['GET'])
def get_entries():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM vehicle_driver")
        rows = cursor.fetchall()

        entries = []
        for row in rows:
            entry = {
                "id": row["id"],
                "driver": {
                    "driverName": row["driverName"],
                    "driverPhone": row["driverPhone"],
                    "driverLicense": row["driverLicense"],
                    "dailyWages": row["dailyWages"]
                },
                "vehicle": {
                    "vehicleID": row["vehicleID"],
                    "vehicleName": row["vehicleName"],
                    "vehicleCapacity": row["vehicleCapacity"]
                }
            }
            entries.append(entry)

        return jsonify(entries), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete-entry/<int:id>', methods=['DELETE'])
def remove_Entry(id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("delete from giri_bazar.vehicle_driver where id =  %s",(id,))
        conn.commit()
        return jsonify({"message": f"Entry with id {id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error":str(e)}),500
    finally:
        cursor.close()
        conn.close()

@app.route('/update-entry/<int:id>', methods=['PUT'])
def update_Entry(id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        vehicle = data.get('vehicle', {})
        driver = data.get('driver', {})

        vehicle_id = vehicle.get('vehicleID')
        vehicle_name = vehicle.get('vehicleName')
        vehicle_capacity = vehicle.get('vehicleCapacity')

        driver_name = driver.get('driverName')
        driver_phone = driver.get('driverPhone')
        driver_license = driver.get('driverLicense')
        daily_wages = driver.get('dailyWages')
        if not driver_phone or not driver_phone.isdigit() or len(driver_phone) != 10:
            return jsonify({"error": "Invalid phone number. Must be exactly 10 digits."}), 400
        query = """UPDATE vehicle_driver SET vehicleID = %s, vehicleName = %s,
                          vehicleCapacity = %s, driverName = %s, driverPhone = %s,
                          driverLicense = %s, dailyWages = %s WHERE id = %s"""
        values = (vehicle_id, vehicle_name, vehicle_capacity,
                  driver_name, driver_phone, driver_license,
                  daily_wages, id)
        cursor.execute(query, values)
        conn.commit()
        return jsonify({"message": f"Entry with id {id} Updated successfully"}), 200
    except Exception as e:
        return jsonify({"error":str(e)}),500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
