const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Błąd połączenia z bazą danych:', err.message);
        process.exit(1);
    } else {
        console.log('Połączono z bazą danych SQLite.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                reset_password_token TEXT,
                reset_password_expires INTEGER
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS restaurants (
                id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL, description TEXT,
                position TEXT, photo_url TEXT, menu_types TEXT, owner_id INTEGER NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT, restaurant_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
                rating INTEGER NOT NULL, comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(restaurant_id, user_id)
            )`);
            console.log('Sprawdzono/Utworzono tabele.');
        });
    }
});

// --- Funkcje pomocnicze i middleware ---
function runQuery(sql, params = []) { return new Promise((resolve, reject) => { db.run(sql, params, function (err) { if (err) reject(err); else resolve({ id: this.lastID, changes: this.changes }); }); }); }
function getQuery(sql, params = []) { return new Promise((resolve, reject) => { db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); }); }); }
function allQuery(sql, params = []) { return new Promise((resolve, reject) => { db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); }); }); }
const authenticateToken = async (req, res, next) => { const authHeader = req.headers['authorization']; const token = authHeader && authHeader.split(' ')[1]; if (token == null || isNaN(parseInt(token))) { return res.status(401).json({ message: 'Brak tokena autoryzacji lub token jest nieprawidłowy.' }); } try { const userId = parseInt(token); const user = await getQuery('SELECT id, username FROM users WHERE id = ?', [userId]); if (!user) { return res.status(403).json({ message: 'Nieprawidłowy token autoryzacji: użytkownik nie istnieje.' }); } req.userId = user.id; next(); } catch (error) { res.status(500).json({ message: 'Błąd autoryzacji', error: error.message }); } };

// --- Endpointy API ---
app.post('/api/register', async (req, res) => { const { username, email, password } = req.body; if (!username || !email || !password) { return res.status(400).json({ message: 'Wszystkie pola są wymagane.' }); } try { const hashedPassword = await bcrypt.hash(password, 10); await runQuery('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]); res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie.' }); } catch (error) { if (error.message.includes('UNIQUE constraint failed')) { res.status(409).json({ message: 'Nazwa użytkownika lub email już istnieje.' }); } else { res.status(500).json({ message: 'Błąd rejestracji.', error: error.message }); } } });
app.post('/api/login', async (req, res) => { const { username, password } = req.body; try { const user = await getQuery('SELECT * FROM users WHERE username = ?', [username]); if (!user) { return res.status(404).json({ message: 'Użytkownik nie znaleziony.' }); } const isMatch = await bcrypt.compare(password, user.password); if (!isMatch) { return res.status(401).json({ message: 'Nieprawidłowe hasło.' }); } res.json({ message: 'Logowanie pomyślne.', token: user.id, username: user.username }); } catch (error) { res.status(500).json({ message: 'Błąd logowania.', error: error.message }); } });


app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            // Ze względów bezpieczeństwa, nie informujemy, że użytkownik nie istnieje
            return res.status(200).json({ message: 'Jeśli ten adres e-mail istnieje w naszej bazie, wysłano na niego link do resetowania hasła.' });
        }

        // Generowanie unikalnego, bezpiecznego tokenu
        const token = crypto.randomBytes(20).toString('hex');
        // Ustawienie daty ważności tokenu (np. 1 godzina)
        const expires = Date.now() + 3600000; // 1 godzina w milisekundach

        await runQuery(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
            [token, expires, email]
        );

        // --- SYMULACJA WYSYŁANIA E-MAILA ---
        console.log('--- LINK DO RESETOWANIA HASŁA (SKOPIUJ I WKLEJ DO PRZEGLĄDARKI) ---');
        console.log(`http://localhost:5173/reset-password/${token}`);
        console.log('-----------------------------------------------------------------');
        // --- KONIEC SYMULACJI ---

        res.status(200).json({ message: 'Jeśli ten adres e-mail istnieje w naszej bazie, wysłano na niego link do resetowania hasła.' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera podczas próby resetowania hasła.', error: error.message });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await getQuery(
            'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
            [token, Date.now()]
        );

        if (!user) {
            return res.status(400).json({ message: 'Token do resetowania hasła jest nieprawidłowy lub wygasł.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await runQuery(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: 'Hasło zostało pomyślnie zaktualizowane.' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera podczas resetowania hasła.', error: error.message });
    }
});

app.get('/api/restaurants', async (req, res) => { let { search, menu_type, near, sort_by } = req.query; let sql = `SELECT r.id, r.name, r.address, r.description, r.position, r.photo_url, r.menu_types, r.owner_id, COUNT(rev.id) AS review_count, AVG(rev.rating) AS average_rating, u.username AS owner_username FROM restaurants r LEFT JOIN reviews rev ON r.id = rev.restaurant_id LEFT JOIN users u ON r.owner_id = u.id`; let params = []; let conditions = []; if (search) { conditions.push(`r.name LIKE ?`); params.push(`%${search}%`); } if (menu_type) { conditions.push(`r.menu_types LIKE ?`); params.push(`%${menu_type}%`); } if (near) { conditions.push(`r.position LIKE ?`); params.push(`%${near}%`); } if (conditions.length > 0) { sql += ` WHERE ` + conditions.join(' AND '); } sql += ` GROUP BY r.id`; if (sort_by === 'name') { sql += ` ORDER BY r.name ASC`; } else if (sort_by === 'average_rating') { sql += ` ORDER BY average_rating DESC`; } else { sql += ` ORDER BY r.name ASC`; } try { const restaurants = await allQuery(sql, params); res.json({ message: 'success', data: restaurants }); } catch (error) { res.status(500).json({ message: 'Błąd pobierania restauracji.', error: error.message }); } });
app.get('/api/restaurants/:id', async (req, res) => { const restaurantId = req.params.id; try { const restaurant = await getQuery(`SELECT r.id, r.name, r.address, r.description, r.position, r.photo_url, r.menu_types, r.owner_id, COUNT(rev.id) AS review_count, AVG(rev.rating) AS average_rating, u.username AS owner_username FROM restaurants r LEFT JOIN reviews rev ON r.id = rev.restaurant_id LEFT JOIN users u ON r.owner_id = u.id WHERE r.id = ? GROUP BY r.id`, [restaurantId]); if (!restaurant) { return res.status(404).json({ message: 'Restauracja nie znaleziona.' }); } const reviews = await allQuery(`SELECT rev.*, u.username AS user_username FROM reviews rev JOIN users u ON rev.user_id = u.id WHERE rev.restaurant_id = ? ORDER BY rev.created_at DESC`, [restaurantId]); res.json({ message: 'success', data: { ...restaurant, reviews } }); } catch (error) { res.status(500).json({ message: 'Błąd pobierania szczegółów restauracji.', error: error.message }); } });
app.post('/api/restaurants', authenticateToken, async (req, res) => { const { name, address, description, position, photo_url, menu_types } = req.body; if (!name || !address) { return res.status(400).json({ message: 'Nazwa i adres restauracji są wymagane.' }); } try { const result = await runQuery('INSERT INTO restaurants (name, address, description, position, photo_url, menu_types, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, address, description || null, position || null, photo_url || null, menu_types || null, req.userId]); res.status(201).json({ message: 'Restauracja dodana pomyślnie.', restaurant_id: result.id }); } catch (error) { res.status(500).json({ message: 'Błąd dodawania restauracji.', error: error.message }); } });
app.delete('/api/restaurants/:id', authenticateToken, async (req, res) => { const restaurantId = req.params.id; try { const restaurant = await getQuery('SELECT owner_id FROM restaurants WHERE id = ?', [restaurantId]); if (!restaurant) { return res.status(404).json({ message: 'Restauracja nie znaleziona.' }); } if (restaurant.owner_id !== req.userId) { return res.status(403).json({ message: 'Brak uprawnień do usunięcia tej restauracji.' }); } await runQuery('DELETE FROM restaurants WHERE id = ?', [restaurantId]); res.json({ message: 'Restauracja usunięta pomyślnie.' }); } catch (error) { res.status(500).json({ message: 'Błąd usuwania restauracji.', error: error.message }); } });
app.post('/api/restaurants/:id/reviews', authenticateToken, async (req, res) => { const restaurantId = req.params.id; const { rating, comment } = req.body; const userId = req.userId; if (!rating || rating < 1 || rating > 5) { return res.status(400).json({ message: 'Ocena musi być liczbą od 1 do 5.' }); } try { const existingReview = await getQuery('SELECT id FROM reviews WHERE restaurant_id = ? AND user_id = ?', [restaurantId, userId]); if (existingReview) { await runQuery('UPDATE reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', [rating, comment || null, existingReview.id]); res.json({ message: 'Opinia zaktualizowana pomyślnie.', review_id: existingReview.id }); } else { const result = await runQuery('INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [restaurantId, userId, rating, comment || null]); res.status(201).json({ message: 'Opinia dodana pomyślnie.', review_id: result.id }); } } catch (error) { res.status(500).json({ message: 'Błąd dodawania/aktualizowania opinii.', error: error.message }); } });
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => { const reviewId = req.params.id; try { const review = await getQuery('SELECT user_id FROM reviews WHERE id = ?', [reviewId]); if (!review) { return res.status(404).json({ message: 'Opinia nie znaleziona.' }); } if (review.user_id !== req.userId) { return res.status(403).json({ message: 'Brak uprawnień do usunięcia tej opinii.' }); } await runQuery('DELETE FROM reviews WHERE id = ?', [reviewId]); res.json({ message: 'Opinia usunięta pomyślnie.' }); } catch (error) { res.status(500).json({ message: 'Błąd usuwania opinii.', error: error.message }); } });
app.get('/api/reviews/search', authenticateToken, async (req, res) => { const { query } = req.query; if (!query) { return res.status(400).json({ message: 'Parametr "query" jest wymagany.' }); } try { const results = await allQuery(`SELECT rev.*, r.name AS restaurant_name, u.username AS user_username FROM reviews rev JOIN restaurants r ON rev.restaurant_id = r.id JOIN users u ON rev.user_id = u.id WHERE rev.comment LIKE ? ORDER BY rev.created_at DESC`, [`%${query}%`]); res.json({ message: 'success', data: results }); } catch (error) { res.status(500).json({ message: 'Błąd wyszukiwania komentarzy.', error: error.message }); } });

app.listen(PORT, () => {
    console.log(`🚀 Backend działa na http://localhost:${PORT}`);
});
