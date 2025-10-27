import sqlite3

conn = sqlite3.connect('backend/adm.db')
cursor = conn.cursor()

print('=== ПОЛЬЗОВАТЕЛИ ===')
cursor.execute('SELECT id, email, name, is_verified FROM users')
users = cursor.fetchall()
print(f'Всего пользователей: {len(users)}')
for user in users[:5]:  # Показываем только первых 5
    print(f'ID: {user[0]}, Email: {user[1]}, Name: {user[2]}, Verified: {user[3]}')

print('\n=== МЕРОПРИЯТИЯ ===')
cursor.execute('SELECT id, name, preregistration_start, registration_start, registration_end FROM events')
events = cursor.fetchall()
print(f'Всего мероприятий: {len(events)}')
for event in events:
    print(f'ID: {event[0]}, Name: {event[1]}, Prereg: {event[2]}, Reg: {event[3]}, End: {event[4]}')

print('\n=== РЕГИСТРАЦИИ ===')
cursor.execute('SELECT event_id, user_id, is_confirmed FROM event_registrations')
registrations = cursor.fetchall()
print(f'Всего регистраций: {len(registrations)}')
for reg in registrations[:5]:  # Показываем только первых 5
    print(f'Event: {reg[0]}, User: {reg[1]}, Confirmed: {reg[2]}')

conn.close()
