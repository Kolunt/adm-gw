import sqlite3

print('=== ПРОВЕРКА SANTA.DB ===')
conn = sqlite3.connect('backend/santa.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Таблицы в santa.db:')
for table in tables:
    print(f'  - {table[0]}')

if 'events' in [t[0] for t in tables]:
    cursor.execute('SELECT id, name FROM events')
    events = cursor.fetchall()
    print(f'\nМероприятия в santa.db: {len(events)}')
    for event in events:
        print(f'  ID: {event[0]}, Name: {event[1]}')

conn.close()

print('\n=== ПРОВЕРКА ADM.DB ===')
conn = sqlite3.connect('backend/adm.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Таблицы в adm.db:')
for table in tables:
    print(f'  - {table[0]}')

if 'events' in [t[0] for t in tables]:
    cursor.execute('SELECT id, name FROM events')
    events = cursor.fetchall()
    print(f'\nМероприятия в adm.db: {len(events)}')
    for event in events:
        print(f'  ID: {event[0]}, Name: {event[1]}')

conn.close()
