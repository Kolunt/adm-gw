import sqlite3

def check_table_structure(db_path, table_name):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    print(f"\n{db_path} - таблица {table_name}:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    conn.close()

print("=== СТРУКТУРА ТАБЛИЦ ===")
check_table_structure('backend/adm.db', 'users')
check_table_structure('backend/santa.db', 'users')
