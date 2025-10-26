#!/usr/bin/env python3
import os
import sqlite3

# Удаляем все файлы базы данных
db_files = ["santa.db", "santa_old.db"]
for db_file in db_files:
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"✅ Удален {db_file}")

print("✅ База данных полностью очищена")
print("Теперь запустите: python main.py")
