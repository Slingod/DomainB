npm start
node app.js
npx localtunnel --port 5000 --subdomain monshopdev

# 1️⃣ – Création de l’utilisateur “Ringoo” via l’API (role “member” par défaut)

curl -X POST http://localhost:5000/auth/signup \
 -H 'Content-Type: application/json' \
 -d '{"username":"Ringoo","email":"ringo@gmail.com","password":"secret"}'

# (Dans la console serveur, récupère la Preview URL et clique pour valider l’email)

# 2️⃣ – Marquer l’email comme vérifié directement en base (si tu préfères éviter Ethereal)

sqlite3 database.sqlite <<SQL
UPDATE users
SET email_verified = 1
WHERE email = 'ringo@gmail.com';
SQL

# Vérifions que Ringoo existe et est “member”

sqlite3 database.sqlite "SELECT id, username, email, role, email_verified FROM users WHERE email='ringo@gmail.com';"

# → devrait afficher quelque chose comme : 11|Ringoo|ringo@gmail.com|member|1

# 3️⃣ – Passer Ringoo en Admin

sqlite3 database.sqlite <<SQL
UPDATE users
SET role = 'admin'
WHERE email = 'ringo@gmail.com';
SQL

# Vérifions le rôle

sqlite3 database.sqlite "SELECT username, role FROM users WHERE email='ringo@gmail.com';"

# → Ringoo|admin

# 4️⃣ – Passer Ringoo en Moderator

sqlite3 database.sqlite <<SQL
UPDATE users
SET role = 'moderator'
WHERE email = 'ringo@gmail.com';
SQL

# Vérification

sqlite3 database.sqlite "SELECT username, role FROM users WHERE email='ringo@gmail.com';"

# → Ringoo|moderator

# 5️⃣ – Redégrader Ringoo en Member

sqlite3 database.sqlite <<SQL
UPDATE users
SET role = 'member'
WHERE email = 'ringo@gmail.com';
SQL

# Vérification

sqlite3 database.sqlite "SELECT username, role FROM users WHERE email='ringo@gmail.com';"

# → Ringoo|member

# 6️⃣ – Supprimer Ringoo

sqlite3 database.sqlite <<SQL
DELETE FROM users
WHERE email = 'ringo@gmail.com';
SQL

# 7️⃣ – Vérifier la suppression

sqlite3 database.sqlite "SELECT COUNT(\*) AS exists FROM users WHERE email='ringo@gmail.com';"

# → 0

sqlite3 database.sqlite <<SQL
UPDATE users
SET role = 'admin'
WHERE email = 'test.test@gmail.com';
SQL

sqlite3 database.sqlite "SELECT id, username, email, role FROM users WHERE email='test.test@gmail.com';"

Pour Voir la BDD côté Backend
slingo@DESKTOP-F4FM3H9:~/Ends/my-shop/backend$ cd /home/slingo/Ends/my-shop/backend
sqlite3 database.sqlite
SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.
sqlite> SELECT id, title, is_visible FROM products;
1|CIEL D’HIVER 2024|1
3|DANY & JO 2024|1
4|LE GOÛT DES AUTRES 2024|1
5|PETIT COTEAU 2024|1
6|LUM DEL PAIS 2024|1
