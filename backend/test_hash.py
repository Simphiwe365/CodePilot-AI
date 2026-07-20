from app.core.security import hash_password

password = "Password123"

hashed = hash_password(password)

print(hashed)