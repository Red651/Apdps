if __name__ == '__main__':
    
    from app.core.database_functions import reset_ppdm_db, reset_public_db, create_support_data
    
    reset_ppdm_db()
    
    create_support_data()
    
    reset_public_db()
    
    from app.scripts.populate_db import create_superuser, populate_db, create_users_kkks
    
    # create_superuser()
    # create_users_kkks()

    populate_db()

