import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import init_db
init_db()

from app.main import app

import mangum

handler = mangum.Mangum(app)