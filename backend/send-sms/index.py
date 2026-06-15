import json
import os
import random
import time
import urllib.request
import urllib.parse
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p40060251_messenger_racia')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Отправляет SMS с кодом подтверждения на указанный номер через СМС.ру"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    phone = body.get('phone', '').strip()

    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Укажите номер телефона'})
        }

    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    if len(digits) != 11 or not digits.startswith('7'):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный формат номера телефона'})
        }

    code = str(random.randint(1000, 9999))
    expires_at = int(time.time()) + 300
    now = int(time.time())

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.sms_codes (phone, code, expires_at, created_at) VALUES ('{digits}', '{code}', {expires_at}, {now}) "
                f"ON CONFLICT (phone) DO UPDATE SET code = '{code}', expires_at = {expires_at}, created_at = {now}"
            )
        conn.commit()
    finally:
        conn.close()

    api_key = os.environ.get('SMS_RU_API_KEY', '')
    message = f'Ваш код РАЦИИ: {code}. Никому не сообщайте этот код.'

    params = urllib.parse.urlencode({
        'api_id': api_key,
        'to': digits,
        'msg': message,
        'json': 1,
    })
    url = f'https://sms.ru/sms/send?{params}'

    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            result = json.loads(resp.read().decode())
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка отправки SMS: {str(e)}'})
        }

    sms_status = result.get('sms', {}).get(digits, {}).get('status')
    if result.get('status') != 'OK' or sms_status != 'OK':
        status_code_sms = result.get('sms', {}).get(digits, {}).get('status_code')
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка СМС.ру (код {status_code_sms})'})
        }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'message': f'Код отправлен на +{digits}'})
    }
