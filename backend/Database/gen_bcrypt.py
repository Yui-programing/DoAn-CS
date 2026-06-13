import bcrypt
h = bcrypt.hashpw(b"123123", bcrypt.gensalt(11))
print(h.decode())
