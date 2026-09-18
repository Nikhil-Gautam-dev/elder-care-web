import os
import json
import asyncio
import hashlib
import secrets
import tempfile
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy.pool import NullPool
from sqlalchemy import String, Integer, Boolean, DateTime, Text, Float, select, text

load_dotenv(override=True)

# Configurable Trial Duration
TRIAL_DAYS = int(os.getenv("TRIAL_DAYS", "7"))

# Environment config
_db_user = os.getenv("DB_USER", "postgres")
_db_pass = os.getenv("DB_PASSWORD", "Vishal123")
_db_host = os.getenv("DB_HOST", "localhost")
_db_port = os.getenv("DB_PORT", "5432")
_db_name = os.getenv("DB_NAME", "kivo_db")
_default_pg_url = f"postgresql+asyncpg://{_db_user}:{_db_pass}@{_db_host}:{_db_port}/{_db_name}"

DATABASE_URL = os.getenv("DATABASE_URL", _default_pg_url)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

def get_sqlite_url():
    is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    if is_serverless:
        p = os.path.join(tempfile.gettempdir(), "kivo_local.db").replace("\\", "/")
        return f"sqlite+aiosqlite:///{p}"
    return "sqlite+aiosqlite:///./kivo_local.db"

SQLITE_FALLBACK_URL = os.getenv("SQLITE_FALLBACK_URL", get_sqlite_url())

Base = declarative_base()

# ==============================================================================
# 1. DATABASE MODELS
# ==============================================================================

class RuleModel(Base):
    __tablename__ = "kivo_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(50), default="General")
    prompt: Mapped[str] = mapped_column(Text)
    voice_response: Mapped[str] = mapped_column(Text)
    event_type: Mapped[str] = mapped_column(String(100))
    condition_expr: Mapped[str] = mapped_column(String(200))
    mcp_tools: Mapped[str] = mapped_column(String(200))
    recipients: Mapped[str] = mapped_column(String(200))
    risk_level: Mapped[str] = mapped_column(String(50), default="Medium")
    status: Mapped[str] = mapped_column(String(50), default="MONITORING")
    detected_value: Mapped[str] = mapped_column(String(100), nullable=True)
    threshold_value: Mapped[str] = mapped_column(String(100), nullable=True)
    eval_result: Mapped[str] = mapped_column(String(100), nullable=True)
    draft_recipient: Mapped[str] = mapped_column(String(200), nullable=True)
    draft_message: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "category": self.category,
            "prompt": self.prompt,
            "voice_response": self.voice_response,
            "event_type": self.event_type,
            "condition_expr": self.condition_expr,
            "mcp_tools": self.mcp_tools.split(", ") if self.mcp_tools else [],
            "recipients": self.recipients,
            "risk_level": self.risk_level,
            "status": self.status,
            "detected_value": self.detected_value,
            "threshold_value": self.threshold_value,
            "eval_result": self.eval_result,
            "draft_recipient": self.draft_recipient,
            "draft_message": self.draft_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class EventLogModel(Base):
    __tablename__ = "kivo_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rule_key: Mapped[str] = mapped_column(String(100), index=True)
    event_name: Mapped[str] = mapped_column(String(100))
    detected_value: Mapped[str] = mapped_column(String(100))
    threshold_value: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "rule_key": self.rule_key,
            "event_name": self.event_name,
            "detected_value": self.detected_value,
            "threshold_value": self.threshold_value,
            "status": self.status,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ApprovalModel(Base):
    __tablename__ = "kivo_approvals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rule_key: Mapped[str] = mapped_column(String(100), index=True)
    recipient: Mapped[str] = mapped_column(String(200))
    channel: Mapped[str] = mapped_column(String(100), default="message_tool")
    staged_message: Mapped[str] = mapped_column(Text)
    risk_level: Mapped[str] = mapped_column(String(50), default="Medium")
    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "rule_key": self.rule_key,
            "recipient": self.recipient,
            "channel": self.channel,
            "staged_message": self.staged_message,
            "risk_level": self.risk_level,
            "status": self.status,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class MCPToolModel(Base):
    __tablename__ = "kivo_mcp_tools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)
    endpoint: Mapped[str] = mapped_column(String(200))
    parameters_schema: Mapped[str] = mapped_column(Text)
    sample_response: Mapped[str] = mapped_column(Text)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "endpoint": self.endpoint,
            "parameters": json.loads(self.parameters_schema) if self.parameters_schema else {},
            "sample_response": json.loads(self.sample_response) if self.sample_response else {},
        }



class TaskModel(Base):
    __tablename__ = "kivo_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    session_id: Mapped[str] = mapped_column(String(100), index=True)
    scenario_key: Mapped[str] = mapped_column(String(100), index=True)
    intent_name: Mapped[str] = mapped_column(String(100))
    confidence: Mapped[float] = mapped_column(Float, default=0.98)
    status: Mapped[str] = mapped_column(String(50), default="WAITING_FOR_APPROVAL")
    stage: Mapped[str] = mapped_column(String(50), default="WAITING_FOR_APPROVAL")
    transcript: Mapped[str] = mapped_column(Text, nullable=True)
    entities_json: Mapped[str] = mapped_column(Text, nullable=True)
    task_plan_json: Mapped[str] = mapped_column(Text, nullable=True)
    approval_status: Mapped[str] = mapped_column(String(50), default="PENDING")
    order_id: Mapped[int] = mapped_column(Integer, nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(100), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "session_id": self.session_id,
            "scenario_key": self.scenario_key,
            "intent_name": self.intent_name,
            "confidence": self.confidence,
            "confidence_percent": f"{int(self.confidence * 100)}%",
            "status": self.status,
            "stage": self.stage,
            "transcript": self.transcript,
            "entities": json.loads(self.entities_json) if self.entities_json else {},
            "task_plan": json.loads(self.task_plan_json) if self.task_plan_json else [],
            "approval_status": self.approval_status,
            "order_id": self.order_id,
            "idempotency_key": self.idempotency_key,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class OrderModel(Base):
    __tablename__ = "kivo_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    scenario_key: Mapped[str] = mapped_column(String(100), index=True)
    service_name: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    status: Mapped[str] = mapped_column(String(50), default="CONFIRMED")  # PENDING, CONFIRMED, CANCELLED, COMPLETED
    details_json: Mapped[str] = mapped_column(Text, nullable=True)
    family_alert_sent: Mapped[bool] = mapped_column(Boolean, default=True)
    family_recipient: Mapped[str] = mapped_column(String(200), default="Rohan (Caregiver WhatsApp)")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "scenario_key": self.scenario_key,
            "service_name": self.service_name,
            "title": self.title,
            "amount": self.amount,
            "amount_formatted": f"₹{self.amount:.2f}" if self.currency == "INR" else f"${self.amount:.2f}",
            "currency": self.currency,
            "status": self.status,
            "details": json.loads(self.details_json) if self.details_json else {},
            "family_alert_sent": self.family_alert_sent,
            "family_recipient": self.family_recipient,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "created_at_formatted": self.created_at.strftime("%b %d, %Y • %I:%M %p") if self.created_at else None,
        }


class NotificationModel(Base):
    __tablename__ = "kivo_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[str] = mapped_column(String(50), default="order_confirmed")
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    meta_json: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user_email,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "meta": json.loads(self.meta_json) if self.meta_json else {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "created_at_formatted": self.created_at.strftime("%I:%M %p") if self.created_at else None,
        }


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256(f"{salt}{password}".encode('utf-8')).hexdigest()
    return f"{salt}${hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash or '$' not in stored_hash:
        return False
    try:
        salt, hashed = stored_hash.split('$', 1)
        expected = hashlib.sha256(f"{salt}{password}".encode('utf-8')).hexdigest()
        return secrets.compare_digest(hashed, expected)
    except Exception:
        return False


class AccountModel(Base):
    __tablename__ = "kivo_accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=True, default="+91 98450 12345")
    language: Mapped[str] = mapped_column(String(50), nullable=True, default="English")
    timezone: Mapped[str] = mapped_column(String(50), nullable=True, default="India Standard Time (IST)")
    preferences_json: Mapped[str] = mapped_column(Text, nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Subscription & Free Trial System
    trial_start: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    trial_end: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=TRIAL_DAYS))
    subscription_status: Mapped[str] = mapped_column(String(50), default="free_trial")  # free_trial, trial_expiring, trial_expired, active_pro, cancelled, payment_failed
    plan: Mapped[str] = mapped_column(String(50), default="trial")  # trial, kivo_pro, none
    billing_cycle: Mapped[str] = mapped_column(String(50), default="monthly")
    next_billing_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    payment_method_preview: Mapped[str] = mapped_column(String(50), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def get_effective_subscription(self):
        now = datetime.utcnow()
        status = self.subscription_status or "free_trial"
        days_remaining = 0

        # Active Pro Subscription
        if status == "active_pro" or self.plan == "kivo_pro":
            return {
                "status": "active_pro",
                "plan": "kivo_pro",
                "plan_name": "Kivo Pro",
                "price": 14.99,
                "price_formatted": "$14.99 / month",
                "is_pro": True,
                "is_expired": False,
                "days_remaining": 0,
                "trial_start": self.trial_start.isoformat() if self.trial_start else None,
                "trial_end": self.trial_end.isoformat() if self.trial_end else None,
                "next_billing_date": (self.next_billing_date or (now + timedelta(days=30))).strftime("%B %d, %Y"),
                "next_billing_date_iso": (self.next_billing_date or (now + timedelta(days=30))).isoformat(),
                "payment_method": self.payment_method_preview or "Visa ending in 4242",
                "can_access_agent": True,
                "badge_text": "PRO"
            }

        # Cancelled Pro Subscription
        if status == "cancelled":
            active_until = self.next_billing_date or (now + timedelta(days=14))
            is_still_active = active_until > now
            return {
                "status": "cancelled",
                "plan": "kivo_pro" if is_still_active else "none",
                "plan_name": "Kivo Pro (Cancelled)",
                "price": 14.99,
                "price_formatted": "$14.99 / month",
                "is_pro": is_still_active,
                "is_expired": not is_still_active,
                "days_remaining": max(0, int((active_until - now).total_seconds() / 86400)),
                "trial_start": self.trial_start.isoformat() if self.trial_start else None,
                "trial_end": self.trial_end.isoformat() if self.trial_end else None,
                "next_billing_date": active_until.strftime("%B %d, %Y"),
                "payment_method": self.payment_method_preview or "Visa ending in 4242",
                "can_access_agent": is_still_active,
                "badge_text": "CANCELLED"
            }

        # Payment Failed State
        if status == "payment_failed":
            return {
                "status": "payment_failed",
                "plan": "kivo_pro",
                "plan_name": "Kivo Pro (Payment Failed)",
                "price": 14.99,
                "price_formatted": "$14.99 / month",
                "is_pro": False,
                "is_expired": True,
                "days_remaining": 0,
                "trial_start": self.trial_start.isoformat() if self.trial_start else None,
                "trial_end": self.trial_end.isoformat() if self.trial_end else None,
                "next_billing_date": None,
                "payment_method": self.payment_method_preview or "Visa ending in 4242",
                "can_access_agent": False,
                "badge_text": "PAYMENT DUE"
            }

        # Free Trial Calculation
        end_time = self.trial_end or (self.created_at + timedelta(days=TRIAL_DAYS)) if self.created_at else (now + timedelta(days=TRIAL_DAYS))
        seconds_left = (end_time - now).total_seconds()
        days_remaining = max(0, int(seconds_left // 86400))
        
        if seconds_left <= 0:
            effective_status = "trial_expired"
            can_access = False
            badge = "EXPIRED"
        elif days_remaining <= 2:
            effective_status = "trial_expiring"
            can_access = True
            badge = "TRIAL EXPIRING"
        else:
            effective_status = "free_trial"
            can_access = True
            badge = "FREE TRIAL"

        return {
            "status": effective_status,
            "plan": "trial",
            "plan_name": "Kivo Free Trial",
            "price": 0.0,
            "price_formatted": "Free (7-Day Trial)",
            "is_pro": False,
            "is_expired": effective_status == "trial_expired",
            "days_remaining": days_remaining,
            "trial_days_total": TRIAL_DAYS,
            "trial_start": self.trial_start.isoformat() if self.trial_start else self.created_at.isoformat() if self.created_at else now.isoformat(),
            "trial_end": end_time.isoformat(),
            "trial_end_formatted": end_time.strftime("%B %d, %Y"),
            "next_billing_date": None,
            "payment_method": None,
            "can_access_agent": can_access,
            "badge_text": badge
        }

    def to_dict(self):
        # Compute initials & first name for display
        name = self.full_name or self.username or "User"
        parts = name.strip().split()
        initials = (parts[0][:1] + parts[-1][:1]).upper() if len(parts) > 1 else name[:2].upper()
        first_name = parts[0] if parts else name
        sub = self.get_effective_subscription()

        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "name": name,
            "full_name": name,
            "first_name": first_name,
            "initials": initials,
            "role": self.role,
            "phone": self.phone or "+91 98450 12345",
            "language": self.language or "English",
            "timezone": self.timezone or "India Standard Time (IST)",
            "preferences": json.loads(self.preferences_json) if self.preferences_json else {},
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "created_at_formatted": self.created_at.strftime("%B %Y") if self.created_at else "September 2026",
            "subscription": sub
        }


# ==============================================================================
# 2. DATABASE ENGINE WITH POSTGRESQL & SQLITE FALLBACK
# ==============================================================================

engine = None
AsyncSessionLocal = None
ACTIVE_DB_TYPE = "Unknown"
_init_lock = None
_db_initialized = False

def normalize_email(email: Optional[str]) -> str:
    """
    Standard email normalization across Kivo: trim whitespace and lowercase.
    """
    if not email:
        return ""
    return email.strip().lower()


async def init_db():
    global engine, AsyncSessionLocal, ACTIVE_DB_TYPE, _init_lock, _db_initialized

    if _db_initialized and AsyncSessionLocal is not None:
        return

    if _init_lock is None:
        _init_lock = asyncio.Lock()

    async with _init_lock:
        if _db_initialized and AsyncSessionLocal is not None:
            return

        is_cloud_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
        is_localhost_db = "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL

        # In cloud serverless without remote PostgreSQL, directly use cloud fallback to avoid connect timeout
        if is_cloud_serverless and is_localhost_db:
            print(f"[DB] Cloud serverless detected without remote DB URL. Using cloud SQLite fallback engine: {SQLITE_FALLBACK_URL}")
            engine = create_async_engine(SQLITE_FALLBACK_URL, poolclass=NullPool, echo=False)
            ACTIVE_DB_TYPE = "SQLite (Cloud Serverless Engine)"
        else:
            # Try PostgreSQL with strict 2.5s connect timeout
            try:
                connect_args = {"timeout": 2.5} if "asyncpg" in DATABASE_URL else {}
                test_engine = create_async_engine(DATABASE_URL, poolclass=NullPool, echo=False, pool_pre_ping=True, connect_args=connect_args)
                async with test_engine.connect() as conn:
                    pass
                engine = test_engine
                ACTIVE_DB_TYPE = "PostgreSQL (Production / Live)"
                print(f"[DB] Connected to PostgreSQL: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
            except Exception as e:
                print(f"[DB] PostgreSQL connection offline: {e}")
                print(f"[DB] Activating fallback SQLite engine: {SQLITE_FALLBACK_URL}")
                engine = create_async_engine(SQLITE_FALLBACK_URL, poolclass=NullPool, echo=False)
                ACTIVE_DB_TYPE = "SQLite (Local Dev Engine / Postgres-Ready)"

        AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

        # Create all tables cleanly
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Enforce PostgreSQL / SQLite database-level unique index on email
        try:
            async with engine.begin() as conn:
                await conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_kivo_accounts_email ON kivo_accounts (email);"))
        except Exception as idx_err:
            pass

        # Seed initial data if table is empty
        try:
            await seed_initial_data()
        except Exception as seed_err:
            print(f"[DB] Note on initial seeding: {seed_err}")

        _db_initialized = True


def get_active_db_type():
    global ACTIVE_DB_TYPE
    if ACTIVE_DB_TYPE == "Unknown" or not ACTIVE_DB_TYPE:
        if "postgresql" in DATABASE_URL:
            return "PostgreSQL (Production / Live)"
        return "SQLite (Local Dev Engine / Postgres-Ready)"
    return ACTIVE_DB_TYPE


async def get_db_session():
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        await init_db()
    async with AsyncSessionLocal() as session:
        yield session


# ==============================================================================
# 3. INITIAL SEED DATA FOR IDEA 2 SCENARIOS
# ==============================================================================

async def seed_initial_data():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(RuleModel))
        existing = result.scalars().first()
        if existing:
            return  # Already seeded

        # Seed 4 Core Rules
        rules = [
            RuleModel(
                key="flight-delay",
                category="Travel",
                prompt='If my flight gets delayed by more than two hours, tell my Airbnb host and my dog sitter that I will arrive late.',
                voice_response="I've created an active rule. If flight DL284 is delayed by more than two hours, I will prepare a draft notification for your Airbnb host and dog sitter.",
                event_type="Flight Status Update",
                condition_expr="Delay > 120 minutes",
                mcp_tools="flight_tool, message_tool",
                recipients="Airbnb Host, Dog Sitter",
                risk_level="Medium",
                status="MONITORING",
                detected_value="Delay: 150m",
                threshold_value="> 120m",
                eval_result="150 > 120 ✓ (Satisfied)",
                draft_recipient="Sarah (Airbnb Host) & Mike (Dog Sitter)",
                draft_message="Hi Sarah & Mike, my flight DL284 is delayed by 2h 30m. I expect to arrive around 11:30 PM instead. Thanks for your understanding!"
            ),
            RuleModel(
                key="meeting-reschedule",
                category="Work",
                prompt='If my product sync meeting moves by more than 30 minutes, notify attendees on Slack.',
                voice_response="Rule active. If the product sync moves by more than 30 minutes, I will alert all attendees on Slack with the updated time.",
                event_type="Calendar Event Shift",
                condition_expr="Shift > 30 minutes",
                mcp_tools="calendar_tool, notification_tool",
                recipients="Engineering Team (@core-dev)",
                risk_level="Low",
                status="MONITORING",
                detected_value="Shift: +45m",
                threshold_value="> 30m",
                eval_result="45 > 30 ✓ (Satisfied)",
                draft_recipient="#product-sync channel & 6 attendees",
                draft_message="Heads up: Product Sync has moved back 45 minutes to 3:45 PM. Meeting room link updated."
            ),
            RuleModel(
                key="invoice-followup",
                category="Freelance",
                prompt='If client has not paid invoice #INV-402 by Friday, draft a follow-up email.',
                voice_response="Rule saved. If invoice INV-402 remains unpaid by Friday 5 PM, I will prepare a follow-up email draft for your review.",
                event_type="Invoice Payment Status",
                condition_expr="Status != 'PAID' && Date >= Friday",
                mcp_tools="invoice_tool, email_tool",
                recipients="accounting@acme-corp.com",
                risk_level="Medium",
                status="STAGED DRAFT",
                detected_value="Status: UNPAID (Fri 5:01 PM)",
                threshold_value="Unpaid by Friday",
                eval_result="Unpaid on Friday ✓",
                draft_recipient="accounting@acme-corp.com",
                draft_message="Hi Accounting Team, following up on invoice #INV-402 ($3,450) which was due today. Please let me know if you need any additional details for payment processing."
            ),
            RuleModel(
                key="package-delivery",
                category="Deliveries",
                prompt='If my package delivery gets delayed past Friday, prepare a message to the seller asking for updated tracking.',
                voice_response="Rule active. If tracking shows delivery past Friday, I will draft an inquiry message for the seller.",
                event_type="Carrier Tracking Update",
                condition_expr="ETA > Friday 23:59",
                mcp_tools="delivery_tool, message_tool",
                recipients="Seller Support (Amazon Marketplace)",
                risk_level="Medium",
                status="MONITORING",
                detected_value="New ETA: Next Tuesday",
                threshold_value="> Friday",
                eval_result="Tuesday > Friday ✓",
                draft_recipient="Apex Supply Store (Order #114-892)",
                draft_message="Hi Seller, I noticed shipment #114-892 has been rescheduled past Friday to next Tuesday. Could you please check with the carrier regarding the delay?"
            )
        ]
        session.add_all(rules)

        # Seed MCP Tools
        tools = [
            MCPToolModel(
                name="flight_tool.get_flight_status",
                category="Travel",
                description="Fetches real-time flight departure, arrival, and delay metrics via aviation telemetry API.",
                endpoint="/api/mcp/tools/flight-status",
                parameters_schema=json.dumps({"flight_number": "string", "airline": "string"}),
                sample_response=json.dumps({"flight": "DL284", "status": "DELAYED", "delay_minutes": 150, "estimated_arrival": "23:30"})
            ),
            MCPToolModel(
                name="calendar_tool.get_calendar_event",
                category="Calendar",
                description="Inspects calendar event start times and rescheduling deltas across Google Calendar & Outlook.",
                endpoint="/api/mcp/tools/calendar-event",
                parameters_schema=json.dumps({"event_id": "string", "calendar": "string"}),
                sample_response=json.dumps({"event_id": "sync-492", "title": "Product Sync", "shift_minutes": 45, "new_time": "15:45"})
            ),
            MCPToolModel(
                name="message_tool.draft_message",
                category="Messaging",
                description="Drafts empathetic SMS / WhatsApp / Airbnb messages and prepares them for 1-tap user confirmation.",
                endpoint="/api/mcp/tools/draft-message",
                parameters_schema=json.dumps({"recipients": "array", "body": "string", "risk_level": "string"}),
                sample_response=json.dumps({"status": "staged", "recipients": ["Airbnb Host", "Dog Sitter"], "requires_approval": True})
            ),
            MCPToolModel(
                name="email_tool.draft_email",
                category="Email",
                description="Composes follow-up email drafts for accounting or client communications via Gmail / Outlook.",
                endpoint="/api/mcp/tools/draft-email",
                parameters_schema=json.dumps({"to": "string", "subject": "string", "body": "string"}),
                sample_response=json.dumps({"status": "staged", "to": "accounting@acme-corp.com", "draft_id": "em-8821"})
            ),
            MCPToolModel(
                name="notification_tool.send_notification",
                category="Notifications",
                description="Dispatches instant low-risk push notifications and Slack alerts.",
                endpoint="/api/mcp/tools/send-notification",
                parameters_schema=json.dumps({"channel": "string", "message": "string", "priority": "string"}),
                sample_response=json.dumps({"status": "sent", "channel": "#product-sync", "delivered_at": datetime.utcnow().isoformat()})
            )
        ]
        session.add_all(tools)

        # Seed Pending Approval
        approval = ApprovalModel(
            rule_key="flight-delay",
            recipient="Sarah (Airbnb Host) & Mike (Dog Sitter)",
            channel="message_tool",
            staged_message="Hi Sarah & Mike, my flight DL284 is delayed by 2h 30m. I expect to arrive around 11:30 PM instead. Thanks for your understanding!",
            risk_level="Medium",
            status="PENDING"
        )
        session.add(approval)

        # Seed Initial Event Logs
        events = [
            EventLogModel(
                rule_key="flight-delay",
                event_name="Flight Delay Delta Detected",
                detected_value="150 min",
                threshold_value="120 min",
                status="SATISFIED",
                message="Flight DL284 delay reached 150m. Threshold (>120m) met. Staged draft generated."
            ),
            EventLogModel(
                rule_key="meeting-reschedule",
                event_name="Google Calendar Start Time Shift",
                detected_value="+45 min",
                threshold_value="+30 min",
                status="SATISFIED",
                message="Product sync moved from 3:00 PM to 3:45 PM. Slack notification sent."
            )
        ]
        session.add_all(events)

        # Seed Initial Accounts with Secure Password Hashes
        admin_acc = AccountModel(
            username="admin",
            email="admin@kivo.ai",
            password_hash=hash_password("admin123"),
            full_name="Administrator",
            role="admin",
            is_active=True
        )
        sarah_acc = AccountModel(
            username="sarah",
            email="sarah@eldercare.ai",
            password_hash=hash_password("password123"),
            full_name="Sarah Jenkins",
            role="caregiver",
            is_active=True
        )
        abc_acc = AccountModel(
            username="abc",
            email="abc@kivo.ai",
            password_hash=hash_password("Vishal123"),
            full_name="ABC Account",
            role="user",
            is_active=True
        )
        session.add_all([admin_acc, sarah_acc, abc_acc])

        await session.commit()
        print("[DB] Database seeded with initial Kivo Interpreter rules, accounts, and MCP tools.")
