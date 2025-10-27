import sqlite3

conn = sqlite3.connect('backend/adm.db')
cursor = conn.cursor()

print('=== ПРОВЕРКА АДМИНИСТРАТОРА ===')

# Проверяем есть ли администратор
cursor.execute('SELECT id, email, name, role FROM users WHERE role = "admin"')
admins = cursor.fetchall()

if admins:
    print('Администраторы:')
    for admin in admins:
        print(f'  ID: {admin[0]}, Email: {admin[1]}, Name: {admin[2]}, Role: {admin[3]}')
else:
    print('Администраторы не найдены!')
    print('Создаем администратора...')
    
    # Создаем администратора
    import hashlib
    password_hash = hashlib.sha256("admin".encode()).hexdigest()
    
    cursor.execute('''
        INSERT INTO users (email, password_hash, name, full_name, role, is_verified)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', ("admin@example.com", password_hash, "Администратор", "Администратор системы", "admin", True))
    
    conn.commit()
    print('Администратор создан: admin@example.com / admin')

conn.close()
