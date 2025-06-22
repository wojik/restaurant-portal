const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const users = [
    { username: 'JanKowalski', email: 'jan.kowalski@example.com', password: 'password123' },
    { username: 'AnnaNowak', email: 'anna.nowak@example.com', password: 'password123' },
    { username: 'PiotrTester', email: 'piotr.tester@example.com', password: 'haslo123' },
    { username: 'KasiaOpiniuje', email: 'kasia.opiniuje@example.com', password: 'haslo123' }
];

const restaurants = [
    {
        name: "Pierogarnia Stary Młyn",
        address: "Zamkowa 7, Poznań",
        description: "Urokliwe miejsce serwujące tradycyjne polskie pierogi w niezliczonych wariantach. Idealne na szybki lunch i rodzinną kolację.",
        position: "Poznań, Stare Miasto",
        photo_url: "https://poradnikrestauratora.pl/wp-content/uploads/sites/2/2022/05/Pierogarnia-Stary-M%C5%82yn-%C5%9Bwi%C4%99tuje-15.-urodziny-pierwszej-restauracji.jpg",
        menu_types: "Pierogi, Polska, Tradycyjna",
        owner_username: "JanKowalski"
    },
    {
        name: "Restauracja Ratuszova",
        address: "Stary Rynek 55, Poznań",
        description: "Elegancka restauracja w sercu Starego Rynku, oferująca wykwintną kuchnię polską i europejską. Idealna na specjalne okazje.",
        position: "Poznań, Stary Rynek",
        photo_url: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        menu_types: "Polska, Europejska, Wykwintna",
        owner_username: "AnnaNowak"
    },
    {
        name: "Pyra Bar",
        address: "Strzelecka 13, Poznań",
        description: "Kultowe miejsce dla miłośników ziemniaków w każdej postaci. Szybko, smacznie i w przystępnej cenie. Poznański klasyk.",
        position: "Poznań, Centrum",
        photo_url: "https://visitpoznan.pl/storage/files/images/other/gastro-pyra-bar-001-3319.webp",
        menu_types: "Polska, Ziemniaki, Tradycyjna",
        owner_username: "JanKowalski"
    },
    {
        name: "Na Winklu",
        address: "Śródka 1, Poznań",
        description: "Bistro z duszą, położone w malowniczej dzielnicy Śródka. Słynie z pieczonych pierogów i domowej atmosfery.",
        position: "Poznań, Śródka",
        photo_url: "https://foodiearmy.pl/wp-content/uploads/2015/02/IMG_18281.jpg",
        menu_types: "Polska, Pierogi, Nowoczesna",
        owner_username: "AnnaNowak"
    },
    {
        name: "Brovaria",
        address: "Stary Rynek 73-74, Poznań",
        description: "Restauracja, browar i hotel w jednym. Wyjątkowe piwa warzone na miejscu i wyśmienita kuchnia regionalna. Klimatyczne wnętrza.",
        position: "Poznań, Stary Rynek",
        photo_url: "https://brovaria.pl/wp-content/uploads/slide-d2.jpg",
        menu_types: "Polska, Piwiarnia, Europejska",
        owner_username: "JanKowalski"
    },
    {
        name: "Wiejskie Jadło",
        address: "Stary Rynek 77, Poznań",
        description: "Przytulna restauracja serwująca obfite dania kuchni polskiej, idealna na obiad w tradycyjnym stylu. Znajdziesz tu smaki jak u babci.",
        position: "Poznań, Stary Rynek",
        photo_url: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        menu_types: "Polska, Grill, Tradycyjna",
        owner_username: "AnnaNowak"
    },
    {
        name: "Yetztu",
        address: "Krysiewicza 6, Poznań",
        description: "Autentyczny smak Japonii w Poznaniu. Specjalizuje się w ramenach i innych daniach kuchni japońskiej, przygotowywanych z pasją.",
        position: "Poznań, Centrum",
        photo_url: "https://pyzamadeinpoland.pl/wp-content/uploads/2016/03/yetztu2.jpg",
        menu_types: "Japońska, Ramen, Azjatycka",
        owner_username: "JanKowalski"
    },
    {
        name: "Matii Robata & Sushi",
        address: "Plac Wolności 6, Poznań",
        description: "Ekskluzywne miejsce dla koneserów sushi i japońskich specjałów z robaty. Świeże składniki i wyrafinowane smaki.",
        position: "Poznań, Plac Wolności",
        photo_url: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        menu_types: "Sushi, Japońska, Owoce morza",
        owner_username: "AnnaNowak"
    },
    {
        name: "Republika Róż",
        address: "Plac Kolegiacki 2A, Poznań",
        description: "Urocza kawiarnia słynąca z domowych ciast, pysznych śniadań i aromatycznej kawy. Idealne miejsce na spotkanie ze znajomymi.",
        position: "Poznań, Stare Miasto",
        photo_url: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        menu_types: "Kawiarnia, Ciasta, Śniadania",
        owner_username: "JanKowalski"
    },
    {
        name: "ORZO",
        address: "Garbary 67A, Poznań",
        description: "Nowoczesna restauracja z industrialnym klimatem, oferująca dania kuchni międzynarodowej z naciskiem na opcje wegańskie. Znana z koktajli.",
        position: "Poznań, Stare Miasto",
        photo_url: "https://pliki.propertydesign.pl/i/07/14/84/071484_r0_1140.jpg",
        menu_types: "Wegańska, Koktajle, Międzynarodowa",
        owner_username: "AnnaNowak"
    },
    {
        name: "Stary Dom",
        address: "Puławska 104/106, Warszawa",
        description: "Klasyczna warszawska restauracja z tradycjami, specjalizująca się w daniach mięsnych i polskiej kuchni na najwyższym poziomie. Eleganckie wnętrze.",
        position: "Warszawa, Mokotów",
        photo_url: "https://www.gdziezjesc.info/kuchnie/images_new/100110/1.jpg",
        menu_types: "Polska, Mięso, Tradycyjna",
        owner_username: "PiotrTester"
    },
    {
        name: "Nolio",
        address: "Krakowska 27, Kraków",
        description: "Prawdziwa neapolitańska pizza w sercu Krakowa. Proste, świeże składniki i piec opalany drewnem gwarantują autentyczny smak Włoch.",
        position: "Kraków, Kazimierz",
        photo_url: "https://nolio.pl/www/wp-content/uploads/2021/02/DSC_3791-1024x683.jpg",
        menu_types: "Włoska, Pizza, Owoce morza",
        owner_username: "KasiaOpiniuje"
    },
    {
        name: "Fino",
        address: "Grząska 1, Gdańsk",
        description: "Restauracja serwująca nowoczesną kuchnię polską z akcentami międzynarodowymi. Wykwintne dania i elegancka atmosfera w zabytkowej części Gdańska.",
        position: "Gdańsk, Stare Miasto",
        photo_url: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        menu_types: "Polska, Nowoczesna, Fine dining",
        owner_username: "PiotrTester"
    },
    {
        name: "Motyla Noga",
        address: "Więzienna 6, Wrocław",
        description: "Przytulny pub z szerokim wyborem piw rzemieślniczych i prostych dań kuchni pubowej. Idealne miejsce na wieczorne spotkanie ze znajomymi.",
        position: "Wrocław, Rynek",
        photo_url: "https://images.pexels.com/photos/6267/menu-restaurant-vintage-table.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        menu_types: "Polska, Europejska, Pub",
        owner_username: "KasiaOpiniuje"
    }
];

const reviews = [
    { restaurant_name: "Pierogarnia Stary Młyn", user_username: "PiotrTester", rating: 5, comment: "Najlepsze pierogi, jakie jadłem w życiu! Obowiązkowy punkt w Poznaniu. Smakują jak u babci." },
    { restaurant_name: "Pierogarnia Stary Młyn", user_username: "KasiaOpiniuje", rating: 4, comment: "Bardzo smacznie, ale czasem bywają kolejki, zwłaszcza w weekendy. Warto czekać!" },
    { restaurant_name: "Pierogarnia Stary Młyn", user_username: "JanKowalski", rating: 5, comment: "Polecam pierogi z mięsem i kapustą. Ciasto delikatne, farsz soczysty. Idealne danie po spacerze po Starówce." },
    { restaurant_name: "Restauracja Ratuszova", user_username: "JanKowalski", rating: 5, comment: "Wykwintna kuchnia i obsługa na najwyższym poziomie. Karta win imponująca. To był niezapomniany wieczór." },
    { restaurant_name: "Restauracja Ratuszova", user_username: "AnnaNowak", rating: 4, comment: "Świetne miejsce na uroczystą kolację. Dania pięknie podane i zaskakujące smakiem. Ceny adekwatne do jakości." },
    { restaurant_name: "Restauracja Ratuszova", user_username: "PiotrTester", rating: 5, comment: "Obsługa bardzo profesjonalna, potrafi doradzić. Lokalizacja idealna, z widokiem na Ratusz." },
    { restaurant_name: "Pyra Bar", user_username: "PiotrTester", rating: 4, comment: "Dobre, syte i tanie jedzenie. Fajna alternatywa dla fast foodów. Porcje ogromne, można się najeść do syta." },
    { restaurant_name: "Pyra Bar", user_username: "JanKowalski", rating: 3, comment: "Smacznie, ale mogłoby być bardziej przytulnie. Raczej na szybką przekąskę niż dłuższą wizytę. Brakowało mi trochę klimatu." },
    { restaurant_name: "Pyra Bar", user_username: "KasiaOpiniuje", rating: 5, comment: "Ziemniaki w każdej postaci! Moje ulubione to pyry z gzikiem. Prosto, smacznie, poznańsko!" },
    { restaurant_name: "Na Winklu", user_username: "KasiaOpiniuje", rating: 5, comment: "Pieczone pierogi to mistrzostwo świata! Niebo w gębie. Absolutnie polecam, szczególnie z pieca." },
    { restaurant_name: "Na Winklu", user_username: "JanKowalski", rating: 4, comment: "Klimatyczne miejsce na Śródce. Pierogi są wyśmienite, a obsługa bardzo miła. Trochę mało miejsca." },
    { restaurant_name: "Brovaria", user_username: "AnnaNowak", rating: 5, comment: "Piwo warzone na miejscu i doskonałe dania. Idealne połączenie tradycji z nowoczesnością. Super klimat!" },
    { restaurant_name: "Wiejskie Jadło", user_username: "PiotrTester", rating: 4, comment: "Smaczna, domowa kuchnia polska. Porcje konkretne, idealne dla głodnych po zwiedzaniu Starego Rynku." },
    { restaurant_name: "Yetztu", user_username: "KasiaOpiniuje", rating: 5, comment: "Najlepszy ramen w Poznaniu! Aromatyczny bulion, idealnie ugotowany makaron. Prawdziwa uczta dla podniebienia." },
    { restaurant_name: "Matii Robata & Sushi", user_username: "JanKowalski", rating: 4, comment: "Świetne sushi, świeże i pięknie podane. Robata to ciekawe doświadczenie. Ceny wysokie, ale jakość to rekompensuje." },
    { restaurant_name: "Republika Róż", user_username: "AnnaNowak", rating: 5, comment: "Urocza kawiarnia z przepysznymi ciastami i śniadaniami. Idealne miejsce na poranną kawę i relaks." },
    { restaurant_name: "ORZO", user_username: "PiotrTester", rating: 4, comment: "Modne miejsce z dobrym jedzeniem i oryginalnymi koktajlami. Sporo opcji wegańskich, co jest plusem." },
    { restaurant_name: "Stary Dom", user_username: "JanKowalski", rating: 5, comment: "Tatar siekany przy stoliku to prawdziwy spektakl. Niesamowita jakość i atmosfera. Czujesz się jak w dawnej Polsce." },
    { restaurant_name: "Stary Dom", user_username: "AnnaNowak", rating: 5, comment: "Klasyka polskiej kuchni w najlepszym wydaniu. Obsługa na medal. Polecam każdemu, kto szuka tradycyjnych smaków." },
    { restaurant_name: "Nolio", user_username: "AnnaNowak", rating: 5, comment: "Najlepsza pizza neapolitańska w Krakowie. Ciasto idealne, składniki świeże. Chrupiąca z zewnątrz, miękka w środku." },
    { restaurant_name: "Nolio", user_username: "KasiaOpiniuje", rating: 4, comment: "Szybka obsługa i bardzo autentyczny smak. Prawdziwe Włochy w sercu Kazimierza." },
    { restaurant_name: "Fino", user_username: "PiotrTester", rating: 4, comment: "Kreatywne podejście do polskiej kuchni. Każde danie to małe dzieło sztuki. Idealne na randkę." },
    { restaurant_name: "Motyla Noga", user_username: "JanKowalski", rating: 3, comment: "Dobre piwo, standardowe pubowe jedzenie. Miło spędzić czas ze znajomymi." },
    { restaurant_name: "Motyla Noga", user_username: "AnnaNowak", rating: 4, comment: "Ciekawy wybór piw rzemieślniczych i przytulna atmosfera. Idealne na wieczorny wypad." }
];

// --- FUNKCJE POMOCNICZE I LOGIKA SKRYPTU ---

function runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function allQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function createTables(db) {
    console.log('Tworzenie tabel, jeśli nie istnieją...');
    await runQuery(db, `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        reset_password_token TEXT,
        reset_password_expires INTEGER
    )`);
    await runQuery(db, `CREATE TABLE IF NOT EXISTS restaurants (
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
    await runQuery(db, `CREATE TABLE IF NOT EXISTS reviews (
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
    console.log('Tabele gotowe.');
}

async function seedDatabase() {
    let db;
    try {
        db = new sqlite3.Database('./database.sqlite', (err) => {
            if (err) {
                console.error('Błąd połączenia z bazą danych:', err.message);
                throw err;
            }
            console.log('Połączono z bazą danych SQLite.');
        });

        console.log('Rozpoczynam dodawanie danych testowych...');
        await createTables(db);
        await runQuery(db, 'DELETE FROM reviews');
        await runQuery(db, 'DELETE FROM restaurants');
        await runQuery(db, 'DELETE FROM users');
        await runQuery(db, "DELETE FROM sqlite_sequence WHERE name IN ('users', 'restaurants', 'reviews')");
        console.log('Wyczyszczono istniejące dane.');

        console.log('\nDodawanie użytkowników...');
        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await runQuery(db, 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [user.username, user.email, hashedPassword]);
            console.log(`Dodano użytkownika: ${user.username}`);
        }
        const userMap = {};
        const usersFromDb = await allQuery(db, "SELECT id, username FROM users");
        usersFromDb.forEach(u => userMap[u.username] = u.id);

        console.log('\nDodawanie restauracji...');
        for (const r of restaurants) {
            const ownerId = userMap[r.owner_username];
            await runQuery(db,
                'INSERT INTO restaurants (name, address, description, position, photo_url, menu_types, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [r.name, r.address, r.description, r.position, r.photo_url, r.menu_types, ownerId]
            );
            console.log(`Dodano restaurację: ${r.name}`);
        }
        const restaurantMap = {};
        const restaurantsFromDb = await allQuery(db, "SELECT id, name FROM restaurants");
        restaurantsFromDb.forEach(r => restaurantMap[r.name] = r.id);

        console.log('\nDodawanie komentarzy i ocen...');
        for (const rev of reviews) {
            const restaurantId = restaurantMap[rev.restaurant_name];
            const userId = userMap[rev.user_username];
            await runQuery(db,
                'INSERT INTO reviews (restaurant_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
                [restaurantId, userId, rev.rating, rev.comment]
            );
            console.log(`Dodano komentarz dla ${rev.restaurant_name} od ${rev.user_username}`);
        }
        console.log('\nZakończono dodawanie danych testowych pomyślnie!');
    } catch (error) {
        console.error('Ogólny błąd podczas seedingu:', error.message);
    } finally {
        if (db) {
            db.close((err) => {
                if (err) return console.error(err.message);
                console.log('Zamknięto połączenie z bazą danych.');
            });
        }
    }
}

seedDatabase();
