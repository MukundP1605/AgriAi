from app.database import SessionLocal
from app.models.users import DBUser
from app.models.history import UserScanHistory, UserCropHistory, UserChatHistory

db = SessionLocal()
user = db.query(DBUser).filter(DBUser.email == "mukundp2005@gmail.com").first()
if user:
    scans = db.query(UserScanHistory).filter(UserScanHistory.user_id == user.id).count()
    crops = db.query(UserCropHistory).filter(UserCropHistory.user_id == user.id).count()
    chats = db.query(UserChatHistory).filter(UserChatHistory.user_id == user.id).count()
    print(f"User {user.email}: {scans} scans, {crops} crops, {chats} chats")
else:
    print("User not found")
db.close()

db = SessionLocal()
user = db.query(DBUser).filter(DBUser.email == "mukundp2005@gmail.com").first()
if user:
    scans = db.query(UserScanHistory).filter(UserScanHistory.user_id == user.id).count()
    crops = db.query(UserCropHistory).filter(UserCropHistory.user_id == user.id).count()
    chats = db.query(UserChatHistory).filter(UserChatHistory.user_id == user.id).count()
    print(f"User {user.email}: {scans} scans, {crops} crops, {chats} chats")
else:
    print("User not found")
db.close()