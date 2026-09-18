import urllib.request
import urllib.error
import json
import sys

base = 'http://127.0.0.1:8000'

urls = [
    ('/', 200, 'text/html'),
    ('/index.html', 200, 'text/html'),
    ('/login', 200, 'text/html'),
    ('/login.html', 200, 'text/html'),
    ('/login.html?returnTo=index.html%23live-demo', 200, 'text/html'),
    ('/signup', 200, 'text/html'),
    ('/signup.html', 200, 'text/html'),
    ('/app', 200, 'text/html'),
    ('/demo', 200, 'text/html'),
    ('/profile', 200, 'text/html'),
]

print("=== PASS 13 ROUTING & AUTH SUITE ===")
all_pass = True

for path, expected_status, expected_ct in urls:
    try:
        url = base + path
        with urllib.request.urlopen(url) as res:
            if res.status != expected_status:
                print(f"[FAIL] {path} -> Status {res.status} != {expected_status}")
                all_pass = False
                continue
            ct = res.headers.get('Content-Type', '')
            if expected_ct not in ct:
                print(f"[FAIL] {path} -> Content-Type {ct} does not contain {expected_ct}")
                all_pass = False
                continue
            html = res.read().decode('utf-8')
            if len(html) < 500:
                print(f"[FAIL] {path} -> Response too short ({len(html)} bytes)")
                all_pass = False
                continue
            print(f"[PASS] {path} -> HTTP {res.status} | Content-Type: {ct} | Size: {len(html)} bytes")
    except Exception as e:
        print(f"[FAIL] {path} -> {e}")
        all_pass = False

print("\n=== TESTING AUTHENTICATION & POSTGRESQL APIS ===")

# Test 1: Invalid Signin
try:
    req = urllib.request.Request(
        base + '/api/auth/signin',
        data=json.dumps({'email': 'nonexistent@random.com', 'password': 'wrongpassword'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req)
    print("[FAIL] Invalid credentials did not return 401")
    all_pass = False
except urllib.error.HTTPError as e:
    if e.code == 401:
        print(f"[PASS] Invalid credentials correctly returned HTTP 401 ({e.reason})")
    else:
        print(f"[FAIL] Invalid credentials returned HTTP {e.code}")
        all_pass = False

# Test 2: Valid Signins
for email, pw in [
    ('admin@kivo.ai', 'admin123'),
    ('sarah@eldercare.ai', 'password123'),
    ('abc@kivo.ai', 'Vishal123')
]:
    try:
        req = urllib.request.Request(
            base + '/api/auth/signin',
            data=json.dumps({'email': email, 'password': pw}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            if data.get('status') == 'success':
                user = data.get('user', {})
                print(f"[PASS] Real Signin: {email} -> Logged in as {user.get('name')} | Role: {user.get('role')} | Badge: {user.get('subscription', {}).get('badge_text')}")
            else:
                print(f"[FAIL] Signin {email} -> {data}")
                all_pass = False
    except Exception as e:
        print(f"[FAIL] Signin {email} -> {e}")
        all_pass = False

# Test 3: Logout
try:
    req = urllib.request.Request(
        base + '/api/auth/logout',
        data=b'{}',
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode('utf-8'))
        if data.get('status') == 'success':
            print(f"[PASS] Logout endpoint -> {data.get('message')}")
        else:
            print(f"[FAIL] Logout endpoint -> {data}")
            all_pass = False
except Exception as e:
    print(f"[FAIL] Logout -> {e}")
    all_pass = False

print("\n" + ("=" * 40))
if all_pass:
    print("ALL PASS 13 VERIFICATION TESTS PASSED SUCCESSFULLY!")
else:
    print("SOME TESTS FAILED - CHECK LOGS ABOVE")
    sys.exit(1)

