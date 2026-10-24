"""CR-10 (GAP-28 ปิดใน EV-048): AC-00-02 ส่งข้อความถึงคนเวรผ่าน webhook ของบริการที่ Ops lead เลือก
AC-00-02 ไม่เปลี่ยนข้อความ test นี้ตรวจช่องทางจริงที่ใช้ในระบบ (Pager ตัวจริง ไม่ใช่ FakePager)"""
import json
import threading
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from app.ops import alerts
from app.ops.metrics import Metrics


class _Receiver(BaseHTTPRequestHandler):
    got: list = []
    fail_first = 0

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if _Receiver.fail_first > 0:
            _Receiver.fail_first -= 1
            self.send_response(503); self.end_headers(); return
        _Receiver.got.append(body)
        self.send_response(200); self.end_headers()

    def log_message(self, *a):
        pass


@pytest.fixture()
def webhook(monkeypatch):
    srv = HTTPServer(("127.0.0.1", 0), _Receiver)
    t = threading.Thread(target=srv.serve_forever, daemon=True); t.start()
    _Receiver.got, _Receiver.fail_first = [], 0
    monkeypatch.setenv("PAGER_WEBHOOK_URL", f"http://127.0.0.1:{srv.server_port}/page")
    alerts.state.clear()
    yield _Receiver
    srv.shutdown(); alerts.state.clear()


def _failing(m, start, minutes):
    for minute in range(minutes):
        for i in range(100):
            m.record("POST /bookings", 500 if i < 10 else 201, 50.0, start + timedelta(minutes=minute))


# รองรับ AC-00-02 (REQ-OP-005 บรรทัดที่ 2) ช่องทางจริง
def test_AC_00_02_webhook_pager_reaches_on_call(db, webhook):
    m, start = Metrics(), datetime(2026, 11, 5, 9, 0)
    # Given endpoint ตอบล้มเหลว 10 ใน 100 ทุกนาที นาน 5 นาที
    _failing(m, start, 5)
    # When งานเบื้องหลังตรวจเกณฑ์ต้นนาทีที่ 6 ด้วย Pager ตัวจริง
    pages = alerts.evaluate(db, m, start + timedelta(minutes=5), alerts.Pager())
    # Then บริการเวรได้รับข้อความ 1 ข้อความ มีชนิดเหตุ ไม่มีข้อมูลลูกค้า
    assert len(pages) == 1 and len(webhook.got) == 1
    assert webhook.got[0]["kind"] == "failure_rate" and "operations.md" in webhook.got[0]["text"]


def test_AC_00_02_webhook_pager_retries_next_minute_when_service_fails(db, webhook):
    m, start = Metrics(), datetime(2026, 11, 5, 9, 0)
    webhook.fail_first = 1
    _failing(m, start, 6)
    # When บริการเวรตอบผิดพลาดครั้งแรก
    alerts.evaluate(db, m, start + timedelta(minutes=5), alerts.Pager())
    assert webhook.got == []
    # Then นาทีถัดไปส่งใหม่และถึง ยังอยู่ในกรอบ 2 นาทีหลังครบเกณฑ์
    alerts.evaluate(db, m, start + timedelta(minutes=6), alerts.Pager())
    assert len(webhook.got) == 1
