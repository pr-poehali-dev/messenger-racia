import json
import os
import urllib.request
import urllib.parse

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

def ok(data: dict) -> dict:
    return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(data, ensure_ascii=False)}

def err(msg: str, code: int = 400) -> dict:
    return {'statusCode': code, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def fetch_json(url: str, method: str = 'GET', data: dict = None, headers: dict = None) -> dict:
    req_headers = headers or {}
    if data:
        encoded = urllib.parse.urlencode(data).encode()
        req = urllib.request.Request(url, data=encoded, headers=req_headers, method=method)
    else:
        req = urllib.request.Request(url, headers=req_headers, method=method)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode())

def handler(event: dict, context) -> dict:
    """OAuth-обмен кода на профиль пользователя: provider=vk|yandex, code, redirect_uri"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    provider = body.get('provider', '')
    code = body.get('code', '')
    redirect_uri = body.get('redirect_uri', '')

    if not provider or not code:
        return err('provider и code обязательны')

    # ─── VK ID (MAX) ───────────────────────────────────────────────
    if provider == 'vk':
        client_id = os.environ.get('VK_CLIENT_ID', '')
        client_secret = os.environ.get('VK_CLIENT_SECRET', '')

        token_url = 'https://id.vk.com/oauth2/auth'
        token_params = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'code': code,
        }
        try:
            token_data = fetch_json(token_url, method='POST', data=token_params)
        except Exception as e:
            return err(f'Ошибка получения токена VK: {str(e)}', 500)

        access_token = token_data.get('access_token')
        if not access_token:
            return err(f'VK не вернул токен: {token_data.get("error_description", "unknown")}')

        # Получаем профиль
        try:
            profile_url = f'https://id.vk.com/oauth2/user_info'
            profile_data = fetch_json(profile_url, method='POST', data={'access_token': access_token, 'client_id': client_id})
        except Exception as e:
            return err(f'Ошибка получения профиля VK: {str(e)}', 500)

        user = profile_data.get('user', {})
        first = user.get('first_name', '')
        last = user.get('last_name', '')
        name = f'{first} {last}'.strip() or user.get('screen_name', 'Пользователь VK')
        avatar = user.get('avatar', '')

        return ok({'ok': True, 'name': name, 'avatar': avatar, 'provider': 'vk'})

    # ─── Яндекс ───────────────────────────────────────────────────
    if provider == 'yandex':
        client_id = os.environ.get('YANDEX_CLIENT_ID', '')
        client_secret = os.environ.get('YANDEX_CLIENT_SECRET', '')

        token_params = {
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
        }
        try:
            token_data = fetch_json('https://oauth.yandex.ru/token', method='POST', data=token_params)
        except Exception as e:
            return err(f'Ошибка получения токена Яндекс: {str(e)}', 500)

        access_token = token_data.get('access_token')
        if not access_token:
            return err(f'Яндекс не вернул токен: {token_data.get("error_description", "unknown")}')

        try:
            profile_data = fetch_json(
                'https://login.yandex.ru/info?format=json',
                headers={'Authorization': f'OAuth {access_token}'}
            )
        except Exception as e:
            return err(f'Ошибка получения профиля Яндекс: {str(e)}', 500)

        name = profile_data.get('real_name') or profile_data.get('display_name') or 'Пользователь Яндекс'
        uid = profile_data.get('id', '')
        avatar = f'https://avatars.yandex.net/get-yapic/{profile_data.get("default_avatar_id", "")}/islands-200' if profile_data.get('default_avatar_id') else ''

        return ok({'ok': True, 'name': name, 'avatar': avatar, 'provider': 'yandex', 'uid': uid})

    return err(f'Неизвестный провайдер: {provider}')
