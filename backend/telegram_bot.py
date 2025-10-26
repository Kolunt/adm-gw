#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import logging
from typing import Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class TelegramBot:
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
        self.bot_info = None
        
    def get_bot_info(self) -> Optional[dict]:
        """Получить информацию о боте"""
        try:
            response = requests.get(f"{self.base_url}/getMe")
            if response.status_code == 200:
                self.bot_info = response.json()["result"]
                return self.bot_info
            else:
                logger.error(f"Ошибка получения информации о боте: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Исключение при получении информации о боте: {e}")
            return None
    
    def send_message(self, chat_id: str, text: str, parse_mode: str = "HTML") -> bool:
        """Отправить сообщение пользователю"""
        try:
            data = {
                "chat_id": chat_id,
                "text": text,
                "parse_mode": parse_mode
            }
            
            response = requests.post(f"{self.base_url}/sendMessage", json=data)
            
            if response.status_code == 200:
                logger.info(f"Сообщение отправлено пользователю {chat_id}")
                return True
            else:
                logger.error(f"Ошибка отправки сообщения: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Исключение при отправке сообщения: {e}")
            return False
    
    def send_notification_to_user(self, telegram_id: str, message: str) -> bool:
        """Отправить уведомление конкретному пользователю"""
        return self.send_message(telegram_id, message)
    
    def send_notification_to_all(self, telegram_users: List[dict], message: str) -> dict:
        """Отправить уведомление всем подписанным пользователям"""
        results = {
            "success": 0,
            "failed": 0,
            "errors": []
        }
        
        for user in telegram_users:
            if user.get("is_active", True):
                success = self.send_notification_to_user(
                    user["telegram_id"], 
                    message
                )
                
                if success:
                    results["success"] += 1
                else:
                    results["failed"] += 1
                    results["errors"].append({
                        "user_id": user.get("user_id"),
                        "telegram_id": user["telegram_id"],
                        "error": "Failed to send message"
                    })
        
        return results
    
    def send_event_notification(self, telegram_users: List[dict], event: dict, notification_type: str) -> dict:
        """Отправить уведомление о мероприятии"""
        
        # Формируем сообщение в зависимости от типа уведомления
        if notification_type == "event_created":
            message = f"""
🎅 <b>Новое мероприятие создано!</b>

📝 <b>Название:</b> {event.get('name', 'Не указано')}
📅 <b>Описание:</b> {event.get('description', 'Не указано')}

🔔 Регистрация скоро откроется!
"""
        elif notification_type == "preregistration_started":
            message = f"""
🎅 <b>Началась предварительная регистрация!</b>

📝 <b>Мероприятие:</b> {event.get('name', 'Не указано')}
📅 <b>Дата начала:</b> {event.get('preregistration_start', 'Не указано')}

⚡ Успейте зарегистрироваться первыми!
"""
        elif notification_type == "registration_started":
            message = f"""
🎅 <b>Началась основная регистрация!</b>

📝 <b>Мероприятие:</b> {event.get('name', 'Не указано')}
📅 <b>Дата начала:</b> {event.get('registration_start', 'Не указано')}
📅 <b>Дата окончания:</b> {event.get('registration_end', 'Не указано')}

🎁 Регистрируйтесь и участвуйте в обмене подарками!
"""
        elif notification_type == "registration_ending_soon":
            message = f"""
⚠️ <b>Регистрация заканчивается скоро!</b>

📝 <b>Мероприятие:</b> {event.get('name', 'Не указано')}
📅 <b>Окончание регистрации:</b> {event.get('registration_end', 'Не указано')}

⏰ Успейте зарегистрироваться!
"""
        elif notification_type == "event_ended":
            message = f"""
🎅 <b>Мероприятие завершено!</b>

📝 <b>Название:</b> {event.get('name', 'Не указано')}
📅 <b>Дата окончания:</b> {event.get('registration_end', 'Не указано')}

🎁 Спасибо за участие! Ждите следующих мероприятий!
"""
        else:
            message = f"""
🎅 <b>Уведомление о мероприятии</b>

📝 <b>Мероприятие:</b> {event.get('name', 'Не указано')}
📅 <b>Тип уведомления:</b> {notification_type}
"""
        
        return self.send_notification_to_all(telegram_users, message)
    
    def validate_token(self) -> bool:
        """Проверить валидность токена бота"""
        bot_info = self.get_bot_info()
        return bot_info is not None


def create_telegram_bot(bot_token: str) -> Optional[TelegramBot]:
    """Создать экземпляр Telegram бота с проверкой токена"""
    try:
        bot = TelegramBot(bot_token)
        if bot.validate_token():
            return bot
        else:
            logger.error("Неверный токен Telegram бота")
            return None
    except Exception as e:
        logger.error(f"Ошибка создания Telegram бота: {e}")
        return None
