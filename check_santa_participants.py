import sqlite3

print('=== ПРОВЕРКА УЧАСТНИКОВ В SANTA.DB ===')
conn = sqlite3.connect('backend/santa.db')
cursor = conn.cursor()

# Проверяем участников мероприятия 2
cursor.execute('''
    SELECT er.user_id, u.name, u.email, er.is_confirmed 
    FROM event_registrations er 
    JOIN users u ON er.user_id = u.id 
    WHERE er.event_id = 2
''')
participants = cursor.fetchall()

print(f'Участников мероприятия 2: {len(participants)}')
confirmed = [p for p in participants if p[3]]
print(f'Подтвержденных: {len(confirmed)}')

for i, participant in enumerate(participants[:5]):
    status = "Подтвержден" if participant[3] else "Не подтвержден"
    print(f'  {i+1}. {participant[1]} ({participant[2]}) - {status}')

conn.close()
