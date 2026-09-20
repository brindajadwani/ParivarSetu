from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload
from app.models.notification import Notification
from app.schemas.complaint import NotificationResponse

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    family_id: Optional[str] = None,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    target_family = family_id or user_payload.family_id
    if not target_family:
        return db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()

    notifs = db.query(Notification).filter(Notification.family_id == target_family).order_by(Notification.created_at.desc()).all()
    res = []
    for n in notifs:
        item = NotificationResponse.model_validate(n)
        if n.scheme:
            item.scheme_name = n.scheme.name
        res.append(item)
    return res

@router.put("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    return {"status": "success", "id": notification_id, "read": True}
