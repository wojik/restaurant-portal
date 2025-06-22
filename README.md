# ![Logo Portalu Restauracji](./frontend/favicon-32x32.png) Portal Restauracji



Aplikacja webowa do przeglądania, wyszukiwania i oceniania restauracji. Zbudowana z wykorzystaniem nowoczesnego stosu technologicznego JavaScript (Vue.js + Node.js/Express) oraz lekkiej bazy danych SQLite. Projekt kładzie nacisk na prostotę konfiguracji, intuicyjny interfejs użytkownika oraz podstawowe funkcjonalności CRUD (tworzenie, odczyt, aktualizacja, usuwanie) dla restauracji i opinii.

**Główne Funkcjonalności:**
*   Przeglądanie listy restauracji z podstawowymi informacjami.
*   Szczegółowy widok restauracji z opisem i opiniami.
*   Wyszukiwanie restauracji po nazwie, typie menu i lokalizacji.
*   **Filtrowanie restauracji po lokalizacji:** Ręczne wpisanie miasta lub automatyczne wykrywanie lokalizacji użytkownika (z opcją powrotu do domyślnego widoku).
*   Rejestracja i logowanie użytkowników.
*   Dodawanie nowych restauracji (tylko zalogowani użytkownicy).
*   Dodawanie, edytowanie i usuwanie opinii o restauracjach (tylko zalogowani użytkownicy, tylko własne opinie).
*   Wyszukiwanie pełnotekstowe w komentarzach.
*   Funkcja przypominania/resetowania hasła (link generowany w konsoli backendu).
*   Estetyczny i responsywny interfejs użytkownika.

## 🚀 Jak Uruchomić Projekt

Projekt składa się z dwóch głównych części: backendu (serwer API) i frontendu (aplikacja webowa). Obie muszą być uruchomione **jednocześnie** w osobnych terminalach.

### Wymagania

*   [Node.js](https://nodejs.org/en/download/) (zalecana wersja LTS)
*   [npm](https://www.npmjs.com/get-npm) (zazwyczaj instalowany razem z Node.js)

### Instalacja i Konfiguracja

1.  **Sklonuj Repozytorium:**
    ```
    git clone https://github.com/wojik/restaurant-portal.git
    cd restaurant-portal
    ```

2.  **Ustawienie zasad wykonywania skryptów dla Windows (jednorazowo):**
    Jeśli używasz systemu Windows i napotkasz błąd związany z wykonywaniem skryptów (`running scripts is disabled on this system`), wykonaj poniższe kroki:
    *   Uruchom **PowerShell jako Administrator** (kliknij prawym przyciskiem myszy na ikonę PowerShell i wybierz "Uruchom jako administrator").
    *   Wpisz komendę:
        ```
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
        ```
    *   Potwierdź, wpisując `T` i naciskając Enter.
    *   Zamknij okno PowerShell administratora.

3.  **Instalacja zależności Backendu:**
    Przejdź do katalogu `backend` i zainstaluj potrzebne pakiety:
    ```
    cd backend
    npm install
    ```

4.  **Generowanie bazy danych i danych testowych (Seeding):**
    *   **Usuń plik `database.sqlite`**, jeśli istnieje w katalogu `backend/`. Jest to kluczowe dla zapewnienia poprawnej struktury bazy danych z najnowszymi kolumnami.
    *   Uruchom skrypt seedujący, aby stworzyć bazę danych i wypełnić ją danymi testowymi:
        ```
        node seed.js
        ```
    *   Po pomyślnym wykonaniu skryptu w konsoli zobaczysz komunikaty o dodanych użytkownikach, restauracjach i opiniach.

5.  **Instalacja zależności Frontendu:**
    Wróć do głównego katalogu projektu, a następnie przejdź do katalogu `frontend`:
    ```
    cd ../frontend
    npm install
    npm install axios # Upewnij się, że axios jest zainstalowany
    ```
    *(Opcjonalnie, ale zalecane): Uruchomienie formatowania kodu:*
    ```
    npm run format
    ```

### Uruchomienie Aplikacji

Aby uruchomić aplikację, musisz uruchomić serwer backendowy i serwer frontendowy **jednocześnie** w dwóch osobnych terminalach.

1.  **Uruchom Backend (w pierwszym terminalu):**
    ```
    cd restaurant-portal/backend
    node server.js
    ```
    Powinieneś zobaczyć komunikaty potwierdzające połączenie z bazą danych i uruchomienie serwera na porcie `3001`. **Nie zamykaj tego terminala.**

2.  **Uruchom Frontend (w drugim terminalu):**
    *   Otwórz **NOWY** terminal (np. w VS Code klikając `+` obok istniejącej zakładki terminala).
    *   Przejdź do katalogu `frontend`:
        ```
        cd restaurant-portal/frontend
        npm run dev
        ```
    *   Powinieneś zobaczyć link `http://localhost:5173/`. **Nie zamykaj tego terminala.**

3.  **Otwórz Aplikację w Przeglądarce:**
    *   Przejdź pod adres: `http://localhost:5173/`

### Użycie Aplikacji

*   **Logowanie/Rejestracja:** Użyj domyślnych kont z pliku `seed.js` (np. `JanKowalski` / `password123`) lub zarejestruj nowe konto.
*   **Resetowanie Hasła:** Na stronie logowania kliknij "Nie pamiętasz hasła?". Wpisz adres e-mail, a link do resetowania hasła pojawi się w **konsoli terminala z uruchomionym backendem**.
*   **Filtrowanie Lokalizacji:** Użyj pola "Wpisz miasto..." lub przycisku "Znajdź blisko mnie" (wymaga zgody przeglądarki na dostęp do lokalizacji).

## 🛠️ Stos Technologiczny

*   **Frontend:** [Vue.js](https://vuejs.org/) (z [Vite](https://vitejs.dev/))
*   **Backend:** [Node.js](https://nodejs.org/) z frameworkiem [Express](https://expressjs.com/)
*   **Baza Danych:** [SQLite](https://www.sqlite.org/index.html) (bezserwerowa, plikowa baza danych)
*   **Stylizacja:** Własne style CSS
*   **Wsparcie HTTP:** [Axios](https://axios-http.com/)
*   **Hashowanie Haseł:** [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)


