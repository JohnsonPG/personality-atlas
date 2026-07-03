from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Presets
from app import schemas

router = APIRouter(prefix="/api", tags=["presets"])


@router.get("/presets", response_model=list[schemas.PresetOut])
def get_presets(db: Session = Depends(get_db)):
    presets = db.query(Presets).all()
    return presets
