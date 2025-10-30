#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Простой скрипт для запуска backend сервера"""
import os
import sys

# Добавляем путь к backend
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Импортируем и запускаем сервер
from main import app
import uvicorn

if __name__ == "__main__":
    print("Starting backend server on http://localhost:8006")
    uvicorn.run(app, host="127.0.0.1", port=8006, reload=True)




