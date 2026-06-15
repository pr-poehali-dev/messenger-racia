import json
import os
import random
import time
import urllib.request
import urllib.parse

# Хранилище кодов: { phone: { code, expires } }
# Один инстанс функции живёт достаточно долго (> 5 минут)
_codes: dict = {}

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

def ok(data: dict) -> dict:
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(data, ensure_ascii=False)}

def err(msg: str, code: int = 400) -> dict:
    return {'statusCode': code, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def normalize_phone(phone: str) -> str | None:
    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    if len(digits) == 11 and digits.startswith('7'):
        return digits
    return None

def handler(event: dict, context) -> dict:
    """Отправка и проверка SMS-кода через СМС.ру. action=send|verify"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')
    phone_raw = body.get('phone', '').strip()

    phone = normalize_phone(phone_raw)
    if not phone:
        return err('Неверный формат номера телефона')

    # --- SEND ---
    if action == 'send':
        code = str(random.randint(1000, 9999))
        _codes[phone] = {'code': code, 'expires': time.time() + 300}

        api_key = os.environ.get('SMS_RU_API_KEY', '')
        message = f'Ваш код РАЦИИ: {code}'

        params = urllib.parse.urlencode({
            'api_id': api_key,
            'to': phone,
            'msg': message,
            'json': 1,
        })
        url = f'https://sms.ru/sms/send?{params}'

        try:
            with urllib.request.urlopen(url, timeout=10) as resp:
                result = json.loads(resp.read().decode())
        except Exception as e:
            return err(f'Ошибка отправки SMS: {str(e)}', 500)

        if result.get('status') != 'OK':
            status_code_sms = result.get('sms', {}).get(phone, {}).get('status_code', '?')
            return err(f'Ошибка СМС.ру: {status_code_sms}')

        return ok({'ok': True, 'message': f'Код отправлен на +{phone}'})

    # --- VERIFY ---
    if action == 'verify':
        code_input = body.get('code', '').strip()
        stored = _codes.get(phone)

        if not stored:
            return err('Сначала запросите код')

        if time.time() > stored['expires']:
            del _codes[phone]
            return err('Код истёк, запросите новый')

        if stored['code'] != code_input:
            return err('Неверный код')

        del _codes[phone]
        return ok({'ok': True})

    return err('Неизвестное действие')