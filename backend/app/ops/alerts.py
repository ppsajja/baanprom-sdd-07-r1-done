"""CR-07 REQ-OP-005 บรรทัดที่ 2: คำขอล้มเหลวเกิน 5 ใน 100 ติดต่อกัน 5 นาที ต้องส่งข้อความถึงคนเวรภายใน 2 นาที
และ REQ-SEC-010 บรรทัดที่ 3: ผู้ส่งคนเดียวถูกปฏิเสธสิทธิ์เกิน 20 ครั้งใน 10 นาที ต้องแจ้งคนเวร
evaluate() ถูกเรียกทุก 1 นาทีโดยงานเบื้องหลังใน main.py (ระบบจริง) หรือเรียกตรงใน test พร้อมเวลาจำลอง
เพราะเรียกทุก 1 นาที ข้อความจึงถึงคนเวรไม่เกิน 1 นาทีหลังนาทีที่ 5 จบ ซึ่งอยู่ในกรอบ 2 นาที"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta

from sqlalchemy import select, func

from app import config
from app.ops.metrics import Metrics, minute_of
from app.db.models import SecurityEvent
from app.privacy import get_logger, log_event

log = get_logger(__name__)


@dataclass
class Page:
    kind: str          # failure_rate / denials
    text: str
    at: datetime


class Pager:
    """ช่องทางถึงคนเวร CR-10 (GAP-28 ปิดใน EV-048): Ops lead เลือกบริการแจ้งเตือนเวรที่รับ webhook
    ถ้าตั้ง PAGER_WEBHOOK_URL ส่ง HTTPS POST แบบ JSON {kind, text, at} ถ้าไม่ตั้ง เขียน log อย่างเดียวเหมือนรุ่น B4
    ข้อความมีแค่ชนิดเหตุและตัวเลข ไม่มีข้อมูลลูกค้า (REQ-OP-005 บรรทัดที่ 3) คืน True เมื่อส่งถึง"""
    def send(self, page: Page) -> bool:
        log_event(log, "page_on_call", reason=page.kind)
        url = config.pager_webhook_url()
        if not url:
            return True
        import httpx
        try:
            r = httpx.post(url, json={"kind": page.kind, "text": page.text, "at": page.at.isoformat()},
                           timeout=config.PAGER_TIMEOUT_SECONDS)
            r.raise_for_status()
            return True
        except Exception:
            # ส่งไม่ถึง: บันทึกแล้วให้ evaluate รอบถัดไป (1 นาที) ส่งใหม่ ยังอยู่ในกรอบ 2 นาทีถ้ารอบถัดไปถึง
            log_event(log, "page_failed", reason=page.kind)
            return False


@dataclass
class FakePager(Pager):
    sent: list[Page] = field(default_factory=list)

    def send(self, page: Page) -> bool:
        self.sent.append(page)
        return True


_pager: Pager = Pager()


def get_pager() -> Pager:
    return _pager


def set_pager(p: Pager) -> None:
    global _pager
    _pager = p


class AlertState:
    """จำว่าเตือนเรื่องไหนไปแล้ว ไม่ส่งซ้ำทุกนาทีระหว่างเหตุการณ์เดียวกัน"""
    def __init__(self) -> None:
        self.failure_alert_open = False
        self.denial_alerted: set[tuple[str, int]] = set()

    def clear(self) -> None:
        self.failure_alert_open = False
        self.denial_alerted.clear()


state = AlertState()


def failing_minutes(m: Metrics, now: datetime) -> int:
    """นับนาทีที่จบแล้วติดต่อกันย้อนจากนาทีล่าสุด ที่ล้มเหลวเกิน ALERT_FAILURE_PER_100 ใน 100"""
    totals = m.per_minute_totals()
    current = minute_of(now)
    count, minute = 0, current - timedelta(minutes=1)
    while minute in totals:
        requests, failures = totals[minute]
        if requests == 0 or failures * 100 <= config.ALERT_FAILURE_PER_100 * requests:
            break
        count += 1
        minute -= timedelta(minutes=1)
    return count


def evaluate(db, m: Metrics, now: datetime, pager: Pager | None = None) -> list[Page]:
    pager = pager or get_pager()
    pages: list[Page] = []
    # REQ-OP-005: ล้มเหลวเกินเกณฑ์ติดต่อกันครบ 5 นาที
    if failing_minutes(m, now) >= config.ALERT_CONSECUTIVE_MINUTES:
        if not state.failure_alert_open:
            pages.append(Page("failure_rate", f"คำขอล้มเหลวเกิน {config.ALERT_FAILURE_PER_100} ใน 100 "
                                              f"ติดต่อกัน {config.ALERT_CONSECUTIVE_MINUTES} นาที เปิด docs/srs/operations.md", now))
            state.failure_alert_open = True
    else:
        state.failure_alert_open = False
    # REQ-SEC-010 บรรทัดที่ 3: ถูกปฏิเสธเกิน 20 ครั้งใน 10 นาทีจากผู้ส่งคนเดียว
    since = now - timedelta(minutes=config.DENIAL_ALERT_WINDOW_MINUTES)
    rows = db.execute(
        select(SecurityEvent.actor_role, SecurityEvent.actor_id, func.count())
        .where(SecurityEvent.kind == "denied", SecurityEvent.at > since, SecurityEvent.at <= now)
        .group_by(SecurityEvent.actor_role, SecurityEvent.actor_id)
    ).all()
    for role, actor_id, n in rows:
        if n > config.DENIAL_ALERT_COUNT and (role, actor_id) not in state.denial_alerted:
            pages.append(Page("denials", f"{role} รหัส {actor_id} ถูกปฏิเสธสิทธิ์ {n} ครั้งใน "
                                         f"{config.DENIAL_ALERT_WINDOW_MINUTES} นาที", now))
            state.denial_alerted.add((role, actor_id))
    for p in pages:
        delivered = pager.send(p)
        if delivered is False and p.kind == "failure_rate":
            state.failure_alert_open = False  # CR-10: ส่งไม่ถึง ส่งใหม่ในนาทีถัดไป
    return pages
