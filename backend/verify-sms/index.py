import json
import os
import time
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p40060251_messenger_racia')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Проверяет код подтверждения SMS для указанного номера"""

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
    code = body.get('code', '').strip()

    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('8'):
        digits = '7' + digits[1:]

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(f"SELECT code, expires_at FROM {SCHEMA}.sms_codes WHERE phone = '{digits}'")
            row = cur.fetchone()

        if not row:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Сначала запросите код'})
            }

        stored_code, expires_at = row

        if int(time.time()) > expires_at:
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {SCHEMA}.sms_codes WHERE phone = '{digits}'")
            conn.commit()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Код истёк, запросите новый'})
            }

        if stored_code != code:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный код'})
            }

        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM {SCHEMA}.sms_codes WHERE phone = '{digits}'")
        conn.commit()
    finally:
        conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }
