import os
import json
import urllib.request
import urllib.parse

FAST2SMS_API_KEY = os.environ.get("FAST2SMS_API_KEY", "").strip()
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "").strip()
WHATSAPP_API_TOKEN = os.environ.get("WHATSAPP_API_TOKEN", "").strip()
WHATSAPP_PHONE_NUMBER_ID = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "").strip()


def send_sms(phone, message):
    """
    Sends an SMS using Fast2SMS (India), Twilio (Global), or simulated console dispatch.
    """
    clean_phone = "".join(filter(str.isdigit, phone))
    if len(clean_phone) > 10 and clean_phone.startswith("91"):
        clean_phone = clean_phone[-10:]

    # 1. Fast2SMS Integration (India)
    if FAST2SMS_API_KEY:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            headers = {
                "authorization": FAST2SMS_API_KEY,
                "Content-Type": "application/x-www-form-urlencoded"
            }
            data = urllib.parse.urlencode({
                "route": "q",
                "message": message,
                "language": "english",
                "flash": 0,
                "numbers": clean_phone
            }).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                print(f"[FAST2SMS SUCCESS] Sent to {clean_phone}: {resp_data}")
                return {"success": True, "gateway": "fast2sms", "data": resp_data}
        except Exception as e:
            print(f"[FAST2SMS ERROR] Failed to send SMS: {e}")

    # 2. Twilio Integration (Global)
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
        try:
            import base64
            url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
            credentials = f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}"
            encoded_credentials = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
            headers = {
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            target_phone = f"+91{clean_phone}" if not phone.startswith("+") else phone
            data = urllib.parse.urlencode({
                "From": TWILIO_PHONE_NUMBER,
                "To": target_phone,
                "Body": message
            }).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                print(f"[TWILIO SUCCESS] Sent to {target_phone}: {resp_data.get('sid')}")
                return {"success": True, "gateway": "twilio", "data": resp_data}
        except Exception as e:
            print(f"[TWILIO ERROR] Failed to send SMS: {e}")

    # 3. Default Simulation (Ready out-of-the-box)
    print(f"[SMS DISPATCH (Simulation)] To: +91 {clean_phone} | Message: \"{message}\"")
    return {"success": True, "gateway": "simulation", "message": message}


def send_whatsapp_order_confirmation(phone, order_id, customer_name, total):
    """
    Sends WhatsApp message via Meta Cloud API or returns Click-to-Chat URL.
    """
    clean_phone = "".join(filter(str.isdigit, phone))
    intl_phone = f"91{clean_phone[-10:]}" if len(clean_phone) >= 10 else clean_phone

    text_msg = (
        f"StyleHub Atelier: Hello {customer_name}! "
        f"Your Order #SH-2026-{order_id} for INR {total:,.0f} has been received! "
        f"We are tailoring your garments with utmost care. "
        f"Track your order live at: http://localhost:5500/track.html?query={order_id}"
    )

    # 1. Meta WhatsApp Cloud API (If credentials configured)
    if WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID:
        try:
            url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
            headers = {
                "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
                "Content-Type": "application/json"
            }
            payload = {
                "messaging_product": "whatsapp",
                "to": intl_phone,
                "type": "text",
                "text": {"body": text_msg}
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                print(f"[WHATSAPP CLOUD API SUCCESS] Sent to {intl_phone}: {resp_data}")
                return {"success": True, "gateway": "whatsapp_cloud_api", "data": resp_data}
        except Exception as e:
            print(f"[WHATSAPP CLOUD API ERROR] Failed: {e}")

    # 2. Click-to-Chat Link Fallback
    wa_url = f"https://wa.me/{intl_phone}?text={urllib.parse.quote(text_msg)}"
    print(f"[WHATSAPP DISPATCH (Click-to-Chat)] Link: {wa_url}")
    return {
        "success": True,
        "gateway": "click_to_chat",
        "whatsapp_url": wa_url,
        "text": text_msg
    }
