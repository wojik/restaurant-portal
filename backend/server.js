const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Do hashowania haseł

const app = express();
const PORT = 3001; // Port dla backendu

// Middlewares
app.use(cors()); // Pozwala na komunikację z frontendem
app.use(express.json()); // Umożliwia Expressowi czytanie JSON z ciała requestów

// Inicjalizacja bazy danych SQLite
// Plik bazy danych będzie w katalogu 'backend'
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Błąd połączenia z bazą danych:', err.message);
        // W przypadku błędu połączenia z bazą, zatrzymaj aplikację
        process.exit(1); 
    } else {
        console.log('Połączono z bazą danych SQLite.');
        // Utwórz tabele, jeśli nie istnieją
        db.serialize(() => {
            // Tabela użytkowników
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL
            )`);
            // Tabela restauracji
            db.run(`CREATE TABLE IF NOT EXISTS restaurants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                description TEXT,       
                position TEXT,       
                photo_url TEXT,      
                menu_types TEXT,     
                owner_id INTEGER NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
            )`);
            // Tabela recenzji
            db.run(`CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                restaurant_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rating INTEGER NOT NULL, 
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(restaurant_id, user_id) 
            )`);
            console.log('Sprawdzono/Utworzono tabele.');
        });
    }
});

// --- Funkcje pomocnicze do zarządzania bazą danych ---
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// --- Middleware do autoryzacji ---
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Oczekujemy formatu "Bearer <userId>"
    
    if (token == null || isNaN(parseInt(token))) {
        return res.status(401).json({ message: 'Brak tokena autoryzacji lub token jest nieprawidłowy.' });
    }

    try {
        const userId = parseInt(token);
        const user = await getQuery('SELECT id, username FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(403).json({ message: 'Nieprawidłowy token autoryzacji: użytkownik nie istnieje.' });
        }
        req.userId = user.id; // Zapisz ID użytkownika w obiekcie request
        next(); // Przejdź do kolejnego middleware/endpointu
    } catch (error) {
        res.status(500).json({ message: 'Błąd autoryzacji', error: error.message });
    }
};


// --- Endpointy API ---

// 1. Rejestracja użytkownika
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hashowanie hasła
        await runQuery('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie.' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ message: 'Nazwa użytkownika lub email już istnieje.' });
        } else {
            res.status(500).json({ message: 'Błąd rejestracji.', error: error.message });
        }
    }
});

// 2. Logowanie użytkownika
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getQuery('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
        }
        const isMatch = await bcrypt.compare(password, user.password); // Porównanie hasła
        if (!isMatch) {
            return res.status(401).json({ message: 'Nieprawidłowe hasło.' });
        }
        // W naszym prostym systemie tokenem jest po prostu ID użytkownika
        res.json({ message: 'Logowanie pomyślne.', token: user.id, username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Błąd logowania.', error: error.message });
    }
});

// 3. Pobierz wszystkie restauracje (z filtrowaniem i sortowaniem)
app.get('/api/restaurants', async (req, res) => {
    let { search, menu_type, near, sort_by } = req.query; // Parametry filtrowania/sortowania
    let sql = `
        SELECT r.id, r.name, r.address, r.description, r.position, r.photo_url, r.menu_types, r.owner_id,
               COUNT(rev.id) AS review_count, 
               AVG(rev.rating) AS average_rating,
               u.username AS owner_username
        FROM restaurants r
        LEFT JOIN reviews rev ON r.id = rev.restaurant_id
        LEFT JOIN users u ON r.owner_id = u.id
    `;
    let params = [];
    let conditions = [];

    // Filtrowanie po nazwie (Wymaganie 1)
    if (search) {
        conditions.push(`r.name LIKE ?`);
        params.push(`%${search}%`);
    }
    // Filtrowanie po rodzaju menu (Wymaganie 4)
    if (menu_type) {
        conditions.push(`r.menu_types LIKE ?`);
        params.push(`%${menu_type}%`);
    }
    // Filtrowanie po "bliskości" (Wymaganie 3 - symulowane)
    if (near) {
        conditions.push(`r.position LIKE ?`);
        params.push(`%${near}%`);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` GROUP BY r.id`; // Agregacja po restauracji, aby policzyć średnią ocenę

    // Sortowanie (Wymaganie 1)
    if (sort_by === 'name') {
        sql += ` ORDER BY r.name ASC`;
    } else if (sort_by === 'average_rating') {
        sql += ` ORDER BY average_rating DESC`;
    } else {
        sql += ` ORDER BY r.name ASC`; // Domyślne sortowanie
    }

    try {
        const restaurants = await allQuery(sql, params);
        res.json({ message: 'success', data: restaurants });
    } catch (error) {
        res.status(500).json({ message: 'Błąd pobierania restauracji.', error: error.message });
    }
});

// 4. Pobierz szczegóły restauracji + komentarze (Wymaganie 2)
app.get('/api/restaurants/:id', async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await getQuery(`
            SELECT r.id, r.name, r.address, r.description, r.position, r.photo_url, r.menu_types, r.owner_id,
                   COUNT(rev.id) AS review_count, 
                   AVG(rev.rating) AS average_rating,
                   u.username AS owner_username
            FROM restaurants r
            LEFT JOIN reviews rev ON r.id = rev.restaurant_id
            LEFT JOIN users u ON r.owner_id = u.id
            WHERE r.id = ?
            GROUP BY r.id
        `, [restaurantId]);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restauracja nie znaleziona.' });
        }

        const reviews = await allQuery(`
            SELECT rev.*, u.username AS user_username
            FROM reviews rev
            JOIN users u ON rev.user_id = u.id
            WHERE rev.restaurant_id = ?
            ORDER BY rev.created_at DESC
        `, [restaurantId]);

        res.json({ message: 'success', data: { ...restaurant, reviews } });
    } catch (error) {
        res.status(500).json({ message: 'Błąd pobierania szczegółów restauracji.', error: error.message });
    }
});

// 5. Dodaj nową restaurację (Wymaganie 7)
app.post('/api/restaurants', authenticateToken, async (req, res) => {
    const { name, address, description, position, photo_url, menu_types } = req.body;
    if (!name || !address) {
        return res.status(400).json({ message: 'Nazwa i adres restauracji są wymagane.' });
    }
    try {
        const result = await runQuery(
            'INSERT INTO restaurants (name, address, description, position, photo_url, menu_types, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)', // <-- Dodano 'description' w VALUES
            [name, address, description || null, position || null, photo_url || null, menu_types || null, req.userId]
        );
        res.status(201).json({ message: 'Restauracja dodana pomyślnie.', restaurant_id: result.id });
    } catch (error) {
        res.status(500).json({ message: 'Błąd dodawania restauracji.', error: error.message });
    }
});

// 6. Usuń restaurację (Wymaganie 10)
app.delete('/api/restaurants/:id', authenticateToken, async (req, res) => {
    const restaurantId = req.params.id;
    try {
        const restaurant = await getQuery('SELECT owner_id FROM restaurants WHERE id = ?', [restaurantId]);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restauracja nie znaleziona.' });
        }
        if (restaurant.owner_id !== req.userId) {
            return res.status(403).json({ message: 'Brak uprawnień do usunięcia tej restauracji.' });
        }
        await runQuery('DELETE FROM restaurants WHERE id = ?', [restaurantId]);
        res.json({ message: 'Restauracja usunięta pomyślnie.' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd usuwania restauracji.', error: error.message });
    }
});

// 7. Dodaj/Edytuj opinię o restauracji (Wymaganie 8, 9)
app.post('/api/restaurants/:id/reviews', authenticateToken, async (req, res) => {
    const restaurantId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.userId;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Ocena musi być liczbą od 1 do 5.' });
    }

    try {
        const existingReview = await getQuery(
            'SELECT id FROM reviews WHERE restaurant_id = ? AND user_id = ?',
            [restaurantId, userId]
        );

        if (existingReview) {
            // Edytuj istniejącą opinię (Wymaganie 9)
            await runQuery(
                'UPDATE reviews SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
                [rating, comment || null, existingReview.id]
            );
            res.json({ message: 'Opinia zaktualizowana pomyślnie.', review_id: existingReview.id });
        } else {
            // Dodaj nową opinię (Wymaganie 8)
            const result = await runQuery(
                'INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
                [restaurantId, userId, rating, comment || null]
            );
            res.status(201).json({ message: 'Opinia dodana pomyślnie.', review_id: result.id });
        }
    } catch (error) {
        res.status(500).json({ message: 'Błąd dodawania/aktualizowania opinii.', error: error.message });
    }
});

// 8. Usuń opinię (Wymaganie 9)
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    const reviewId = req.params.id;
    try {
        const review = await getQuery('SELECT user_id FROM reviews WHERE id = ?', [reviewId]);
        if (!review) {
            return res.status(404).json({ message: 'Opinia nie znaleziona.' });
        }
        if (review.user_id !== req.userId) {
            return res.status(403).json({ message: 'Brak uprawnień do usunięcia tej opinii.' });
        }
        await runQuery('DELETE FROM reviews WHERE id = ?', [reviewId]);
        res.json({ message: 'Opinia usunięta pomyślnie.' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd usuwania opinii.', error: error.message });
    }
});

// 9. Wyszukiwanie pełnotekstowe komentarzy (Wymaganie 11 - Prosta implementacja)
app.get('/api/reviews/search', authenticateToken, async (req, res) => { // Dodano authenticateToken
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Parametr "query" jest wymagany.' });
    }
    try {
        // Proste wyszukiwanie LIKE. Dla zaawansowanego FTS w SQLite używa się FTS5, ale wymagałoby to więcej konfiguracji.
        const results = await allQuery(`
            SELECT rev.*, r.name AS restaurant_name, u.username AS user_username
            FROM reviews rev
            JOIN restaurants r ON rev.restaurant_id = r.id
            JOIN users u ON rev.user_id = u.id
            WHERE rev.comment LIKE ?
            ORDER BY rev.created_at DESC
        `, [`%${query}%`]);
        res.json({ message: 'success', data: results });
    } catch (error) {
        res.status(500).json({ message: 'Błąd wyszukiwania komentarzy.', error: error.message });
    }
});


// Uruchom serwer
app.listen(PORT, () => {
    console.log(`🚀 Backend działa na http://localhost:${PORT}`);
    console.log(`Bazę danych (database.sqlite) znajdziesz w folderze backend/.`);
});
