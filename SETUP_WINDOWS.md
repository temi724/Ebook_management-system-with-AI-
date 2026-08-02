# Running the E-Library on Windows

Follow this in order. Do the whole thing **at least a day before the demo** — most
failures here are silent (the app still loads, it just returns worse results), so
you want time to notice them.

---

## 0. Before you start

Install these first:

| | Version | Notes |
|---|---|---|
| **Python** | 3.11 | Tick **"Add Python to PATH"** in the installer |
| **Node.js** | 18 or newer | |
| **MySQL** | 8.x, or XAMPP | XAMPP ships MariaDB — that's fine |
| **Git** | any | |

### Fix the long-path limit first

Windows caps paths at 260 characters. PyTorch (pulled in by the AI stack) nests its
licence files ~14 folders deep and blows straight past it, giving:

```
OSError: [WinError 206] The filename or extension is too long
```

Two defences — **do both**:

**a. Enable long paths.** In an *Administrator* PowerShell:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
```

**Reboot afterwards** — it does not affect already-running processes.

**b. Clone to a short path.** `C:\ebook` — not `C:\Users\<you>\Documents\...`, which
burns 60+ characters before the project even starts.

```cmd
cd C:\
git clone <your-repo-url> ebook
cd ebook
```

---

## 1. Database

Create the database. `create_all` in the app builds the *tables*, but **not the
database itself** — if it's missing, the backend dies on startup and the browser
shows `ERR_CONNECTION_REFUSED`, which looks like a frontend problem but isn't.

```cmd
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS elibrary_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

*XAMPP users:* start MySQL from the control panel, open phpMyAdmin, and create
`elibrary_db` there instead.

If your MySQL root account **has a password**, create `backend\.env`:

```
DATABASE_URL=mysql+pymysql://root:YOURPASSWORD@localhost:3306/elibrary_db
SECRET_KEY=change-this-to-any-long-random-string
```

Without that file the app assumes root with *no* password.

---

## 2. Backend

```cmd
cd C:\ebook\backend
py -3.11 -m venv venv311
venv311\Scripts\python -m pip install --upgrade pip
venv311\Scripts\pip install -r requirements.txt
```

The install pulls PyTorch (~2 GB) and takes a while. **Do not run this for the first
time at the venue.**

### Load the data

```cmd
mysql -u root -p elibrary_db < seed_books.sql
venv311\Scripts\python seed_admin.py
venv311\Scripts\python seed_loans.py
```

- `seed_books.sql` — 126 books across 44 subject areas. Wide coverage is what makes
  the AI search find something for most queries. Re-runnable; matches on ISBN.
- `seed_admin.py` — creates `admin` / `admin123`.
- `seed_loans.py` — sample borrowing history so the admin dashboard charts aren't
  empty. **Demo data only.**

### Check it before trusting it

```cmd
venv311\Scripts\python verify_setup.py
```

Every line should read `[ OK ]`. This checks things `pip list` cannot — most
importantly whether the embeddings model actually *loads*, not just whether the
package installed.

- `Runs, but degraded` → the app works but AI search has fallen back to
  popularity ranking. See Troubleshooting.
- Anything `[FAIL]` → fix before continuing.

### Start it

```cmd
venv311\Scripts\python main.py
```

Leave this window open for the whole demo. You should see
`Uvicorn running on http://0.0.0.0:8000`.

---

## 3. Frontend

In a **second** terminal:

```cmd
cd C:\ebook\frontend
npm install
```

Create `frontend\.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

**This matters on Windows.** The backend binds `0.0.0.0`, which is IPv4-only, but
Windows often resolves `localhost` to the IPv6 address `::1` first. The browser then
gets connection-refused even though the server is running fine. Using `127.0.0.1`
forces IPv4 and sidesteps it. `.env` is gitignored, so you must create it on this
machine.

```cmd
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

---

## 4. Warm it up before presenting

Log in as `admin` / `admin123`, then **run one AI search** before your audience is
watching.

The embeddings model takes about **13 seconds to load on first use**, plus ~1 second
to index the catalogue. That cost is paid once per server start, by whoever makes the
first recommendation request. Every request after is ~10 ms. Do it yourself, early.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `WinError 206 ... too long` | 260-char path limit | Section 0 — both fixes |
| `ERR_CONNECTION_REFUSED` in browser | backend not running, or it crashed at startup | Look at the backend window for the real error |
| `Unknown database 'elibrary_db'` | database not created | Section 1 |
| `Can't connect to MySQL server` | MySQL not started | Start the service / XAMPP |
| `Access denied for user 'root'` | root has a password | Create `backend\.env` (Section 1) |
| Backend runs, browser still refused | IPv6 `localhost` | Create `frontend\.env` (Section 3) |
| `[Errno 10048] address already in use` | old server still on port 8000 | `netstat -ano \| findstr :8000` then `taskkill /PID <pid> /F` |
| AI search returns odd/generic results | embeddings failed to load | See below |
| `(trapped) error reading bcrypt version` | harmless passlib/bcrypt mismatch | Ignore — hashing works |

### AI search silently degraded

The giveaway: recommendation results say **"Popular book in our library"** instead of
**"Highly relevant to your search"**. The API still returns 200 with books, so it
looks like it's working.

Run `verify_setup.py`. If `sentence_transformers` fails to import:

```cmd
venv311\Scripts\pip install "sentence-transformers>=3.0"
```

then **restart the backend**. (Version 2.2.2 imports `cached_download`, which newer
`huggingface_hub` removed. `requirements.txt` is already pinned correctly, so this
should only bite an older install.)

### The model needs to download once

On first use the app fetches `all-MiniLM-L6-v2` (~90 MB) from huggingface.co into
`C:\Users\<you>\.cache\huggingface`. **Needs internet the first time.** To avoid
depending on venue wifi, copy that folder from a machine that already has it, or just
run one search while you still have a good connection.

---

## Two windows, every time

```
Terminal 1:  cd C:\ebook\backend   →  venv311\Scripts\python main.py
Terminal 2:  cd C:\ebook\frontend  →  npm run dev
```

Plus MySQL running. Closing either terminal takes the app down.
