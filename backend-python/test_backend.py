import requests

BACKEND_URL = "http://localhost:5000"

def test_backend():
    try:
        # 1. Health endpoint testi
        resp = requests.get(f"{BACKEND_URL}/api/health")
        print(f"[Backend Test] Status: {resp.status_code}")
        print(f"[Backend Test] Response: {resp.text}")
    except requests.exceptions.ConnectionError:
        print("[Backend Test] ❌ Bağlantı yok! Backend çalışmıyor veya port yanlış.")
    except Exception as e:
        print(f"[Backend Test] ❌ Hata: {e}")

if __name__ == "__main__":
    test_backend()
