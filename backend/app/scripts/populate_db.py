from app.api.auth.models import User, Role, Admin, KKKSUser, KKKS
from app.scripts.create_dummy_data import generate_dummy_data
from app.scripts.create_area_and_fields import generate_area_and_fields
from app.core.config import settings
from app.core.security import pwd_context
from sqlalchemy.orm import Session
from app.core.database import sessionmanager

def data_exists(db: Session):
    
    if len(db.query(User).all()) > 1 and db.query(User).filter_by(username=settings.SUPERUSER_USERNAME).first() is not None:
        return True
    else:
        return False
    
def create_superuser(session = None):
    with sessionmanager.sync_session() as session:
        admin = Admin(
            username = settings.SUPERUSER_USERNAME,
            email = 'admin@admin.com',
            hashed_password = pwd_context.hash(settings.SUPERUSER_PASSWORD),
            role = Role.Admin,
            is_superuser = True,
        )

        session.add(
            admin
        )
        session.commit()

def create_users_kkks(session = None):
    with sessionmanager.sync_session() as session:
        # Membuat asosiasi KKKS
        asosiasi1 = KKKS(name="PT Medco E & P Malaka")
        asosiasi2 = KKKS(name="PT. Pema Global Energi (PGE)")
        asosiasi3 = KKKS(name="TRIANGLE PASE INC.")
        asosiasi4 = KKKS(name="PHE NSO")
        
        session.add(asosiasi1)
        session.add(asosiasi2)
        session.add(asosiasi3)
        session.add(asosiasi4)
        session.commit()

        # Membuat pengguna KKKS
        user1 = KKKSUser(
            id=1,
            username='kkks1',
            email='kkks1@example.com',
            hashed_password=pwd_context.hash('kkks1'),
            role=Role.KKKS,
            is_superuser=False,
            kkks=asosiasi1  # Pastikan asosiasi sudah ada
        )
        user2 = KKKSUser(
            id=2,
            username='kkks2',
            email='kkks2@example.com',
            hashed_password=pwd_context.hash('kkks2'),
            role=Role.KKKS,
            is_superuser=False,
            kkks=asosiasi2
        )
        user3 = KKKSUser(
            id=3,
            username='kkks3',
            email='kkks3@example.com',
            hashed_password=pwd_context.hash('kkks3'),
            role=Role.KKKS,
            is_superuser=False,
            kkks=asosiasi3
        )
        user4 = KKKSUser(
            id=4,
            username='kkks4',
            email='kkks4@example.com',
            hashed_password=pwd_context.hash('kkks4'),
            role=Role.KKKS,
            is_superuser=False,
            kkks=asosiasi4
        )
        
        session.add(user1)
        session.add(user2)
        session.add(user3)
        session.add(user4)
        
        session.commit()
        
def populate_db():
    with sessionmanager.sync_session() as session:
        generate_area_and_fields(session)
        generate_dummy_data(session, n=10)