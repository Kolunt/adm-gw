import sqlite3

conn = sqlite3.connect('backend/adm.db')
cursor = conn.cursor()

print('=== ПРОВЕРКА МЕРОПРИЯТИЙ ===')

# Проверяем все мероприятия
cursor.execute('SELECT id, name, registration_end FROM events')
events = cursor.fetchall()

print(f'Всего мероприятий: {len(events)}')
for event in events:
    print(f'  ID: {event[0]}, Name: {event[1]}, End: {event[2]}')

# Проверяем участников мероприятия 1
print('\n=== УЧАСТНИКИ МЕРОПРИЯТИЯ 1 ===')
cursor.execute('''
    SELECT er.user_id, u.name, u.email, er.is_confirmed 
    FROM event_registrations er 
    JOIN users u ON er.user_id = u.id 
    WHERE er.event_id = 1
''')
participants = cursor.fetchall()

print(f'Участников мероприятия 1: {len(participants)}')
confirmed = [p for p in participants if p[3]]
print(f'Подтвержденных: {len(confirmed)}')

for i, participant in enumerate(participants[:5]):
    status = "Подтвержден" if participant[3] else "Не подтвержден"
    print(f'  {i+1}. {participant[1]} ({participant[2]}) - {status}')

conn.close()
