import sqlite3

conn = sqlite3.connect('backend/adm.db')
cursor = conn.cursor()

print('=== ПРОВЕРКА УЧАСТНИКОВ МЕРОПРИЯТИЯ ===')

# Проверяем мероприятие
cursor.execute('SELECT id, name, registration_end FROM events WHERE id = 1')
event = cursor.fetchone()
if event:
    print(f'Мероприятие: {event[1]} (ID: {event[0]})')
    print(f'Регистрация закончилась: {event[2]}')
else:
    print('Мероприятие не найдено!')
    exit()

# Проверяем участников
cursor.execute('''
    SELECT er.user_id, u.name, u.email, er.is_confirmed 
    FROM event_registrations er 
    JOIN users u ON er.user_id = u.id 
    WHERE er.event_id = 1
''')
participants = cursor.fetchall()

print(f'\nВсего участников: {len(participants)}')
print('Участники:')
for i, participant in enumerate(participants):
    status = "Подтвержден" if participant[3] else "Не подтвержден"
    print(f'  {i+1}. {participant[1]} ({participant[2]}) - {status}')

# Проверяем подтвержденных участников
confirmed_participants = [p for p in participants if p[3]]
print(f'\nПодтвержденных участников: {len(confirmed_participants)}')

if len(confirmed_participants) < 2:
    print('ОШИБКА: Недостаточно подтвержденных участников для назначения подарков!')
    print('Нужно минимум 2 участника.')
else:
    print('Достаточно участников для назначения подарков.')

conn.close()
