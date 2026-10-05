# CineRate – Movie Information & Rating Portal

CineRate is a modern, responsive, full-stack web application designed for cinematic exploration, film ratings, community reviews, and personal watchlist curation. It offers moviegoers and cinema enthusiasts an immersive, authentic platform to discover films across various genres, languages, and decades.

---

## Key Features

- **Extensive 1,050+ Film Catalog**: Comprehensive dataset spanning Hollywood classics, modern blockbusters, Tamil cinema gems (Lokesh Cinematic Universe, Mani Ratnam, Shankar, Pa. Ranjith, Vetri Maaran), Pan-India epics (*RRR, Baahubali, KGF, Pushpa, Kalki 2898 AD*), and world cinema.
- **Authentic Movie Clip Posters & Backdrops**:
  - Posters and widescreen backdrops are generated directly from official high-definition movie trailer video clip frames (`hqdefault.jpg` and `maxresdefault.jpg`).
  - **Strict Empty Poster Policy**: Movies without verified trailer clips feature an elegant, stylized slate card with film icon, title, release year, and genre rather than irrelevant or generic stock photos.
- **Rich Community Reviews & Ratings (3,600+ Reviews)**:
  - Every catalog title includes pre-seeded community reviews (2 to 5 per movie) authored by distinct community reviewer personas (*Sarah Jenkins, Marcus Vance, Priya Sharma, Alex Rivera, David Chen, Chloe Bennett, Kenji Sato, Liam Gallagher, Fatima Al-Mansoor*).
  - Review commentary is tailored to the film's genre (Sci-Fi, Action, Drama, Thriller, Mystery, Comedy, Romance, Adventure) with realistic ratings and staggered timestamps.
- **Interactive 1–5 Star Rating System**:
  - Score any film with an interactive star widget.
  - Dynamically recalculates overall average ratings and total vote counts.
  - Quick rating adjustment directly from the user profile.
- **Personal Watchlist Management**:
  - One-click bookmarking of films to a private user watchlist.
  - Real-time counter indicators in the navigation bar and dedicated watchlist page.
- **Recently Viewed History**:
  - Automatically records recently viewed titles into local storage with a dedicated "Jump Back In" shelf on the home screen.
- **Dynamic Multi-Facet Filtering & Search**:
  - Filter movies in real time by genre, language, release year, and minimum rating (e.g., 4.5+ stars).
  - Sort by popularity, rating, release year (newest/oldest), reviews count, or alphabetically.
  - Debounced instant search supporting titles, directors, cast members, and keywords with live autocomplete preview.
- **Official Trailer Modal Player**:
  - Integrated YouTube modal player for verified movie trailers with autoplay and fallback to direct search.
- **User Authentication & Profiles**:
  - Secure registration and login using bcrypt password hashing, JWT session management, and HTTP-only cookies.
  - Profile hub displaying total movies rated, reviews authored, watchlist items, and account settings.
- **Administrator Dashboard**:
  - Role-based access control (RBAC).
  - Platform metrics (total movies, users, reviews, ratings, average platform score).
  - Complete Movie CRUD (Create, Read, Update, Delete) with modal forms.
  - Review moderation and user inspection.
- **Dark / Light Theme Support**:
  - Built-in theme switcher with smooth transition and local storage persistence.

---

## Technology Stack

### Frontend
- **React 19** with **TypeScript**
- **Tailwind CSS v4** for clean responsive styling, glassmorphism, and dark/light modes
- **Lucide React** for modern iconography
- **Motion** for smooth state animations

### Backend
- **Node.js & Express** REST API architecture
- **Vite** middleware integration for unified development and static production builds
- **Bcrypt.js** for secure salted password hashing
- **JSON Web Tokens (JWT)** with HTTP-only cookies (`SameSite=Lax`)

### Database Layer
- **PostgreSQL** relational database support (compatible with Supabase, Neon, AWS RDS, or Google Cloud SQL)
- Resilient in-memory embedded data store that operates out of the box with zero external configuration

---

## Application Architecture

```
cinerate/
├── database/
│   └── schema.sql             # Complete PostgreSQL DDL, constraints, indexes & seeds
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── AuthModal.tsx      # Sign in / Register modal with 1-click demo logins
│   │   ├── DeleteConfirmModal.tsx # Safe deletion confirmations
│   │   ├── MovieCard.tsx      # Cinematic movie card with clip poster & empty state
│   │   ├── MovieFormModal.tsx # Admin Add/Edit movie modal form
│   │   ├── Navbar.tsx         # Responsive navigation & live search dropdown
│   │   ├── RatingStars.tsx    # Interactive 1-5 star widget
│   │   ├── ThemeToggle.tsx    # Dark/light theme switch
│   │   └── TrailerModal.tsx   # Verified YouTube trailer modal player
│   ├── context/
│   │   ├── AuthContext.tsx    # Global user session & state
│   │   ├── ThemeContext.tsx   # Light/dark mode provider
│   │   └── ToastContext.tsx   # Real-time alert notifications
│   ├── data/
│   │   ├── moviesData.ts      # 1,050-film seed dataset
│   │   └── seedReviews.ts     # Community review generator (3,600+ reviews)
│   ├── lib/
│   │   ├── api.ts             # Typed HTTP client for all API endpoints
│   │   ├── movieImages.ts     # Authentic movie clip stills engine & empty poster resolver
│   │   ├── recentlyViewed.ts  # LocalStorage recently viewed history hook
│   │   └── trailers.ts        # Verified trailer video ID mappings & resolver
│   ├── server/                # Backend API & Database Layer
│   │   ├── auth.ts            # JWT verification & HTTP-only cookies
│   │   ├── db.ts              # In-memory & PostgreSQL pool data layer
│   │   └── routes.ts          # RESTful API route controllers
│   ├── views/                 # Top-level page views
│   │   ├── AdminPage.tsx      # Admin metrics, movie CRUD, review moderation
│   │   ├── GenresPage.tsx     # Visual genre category explorer
│   │   ├── HomePage.tsx       # Hero showcase, trending, top rated, recent rows
│   │   ├── MovieDetailsPage.tsx # Film details, star ratings, community reviews
│   │   ├── MoviesPage.tsx     # Discovery catalog & multi-facet filters
│   │   ├── ProfilePage.tsx    # User stats, watchlist, personal reviews & ratings
│   │   └── WatchlistPage.tsx  # Dedicated saved films grid
│   ├── App.tsx                # Main view router & layout wrapper
│   ├── index.css              # Global Tailwind imports & custom scrollbars
│   └── main.tsx               # Client entry point
├── server.ts                  # Express server entry point mounting API & Vite
├── vercel.json                # Vercel deployment configuration & API rewrites
├── package.json
└── README.md
```

---

## Database Structure

The PostgreSQL schema enforces strict relational integrity with foreign keys and unique constraints:

```sql
users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    genre VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'English',
    duration VARCHAR(50) NOT NULL,
    director VARCHAR(150) NOT NULL,
    cast_members TEXT NOT NULL,
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_movie_rating UNIQUE (user_id, movie_id)
);

reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_movie_watchlist UNIQUE (user_id, movie_id)
);
```

---

## API Overview

### Authentication
- `POST /api/auth/register` – Register a new user account with hashed password and receive session cookie.
- `POST /api/auth/login` – Validate credentials and issue HTTP-only cookie.
- `POST /api/auth/logout` – Clear HTTP-only session cookie.
- `GET /api/auth/me` – Retrieve current authenticated user profile and stats.
- `PUT /api/auth/profile` – Update user display name or email.

### Movies
- `GET /api/movies` – Query catalog with filters: `search`, `genre`, `language`, `year`, `minRating`, `sort`, `limit`, `offset`.
- `GET /api/movies/:id` – Fetch movie specifications, aggregated average rating, and community reviews.
- `GET /api/movies/search?q=` – Rapid title, cast, director, and genre search.
- `POST /api/movies` – Admin only: create a new movie entry.
- `PUT /api/movies/:id` – Admin only: update an existing movie.
- `DELETE /api/movies/:id` – Admin only: delete a movie entry and cascade associated ratings and reviews.

### Ratings
- `POST /api/ratings` – Submit or update a 1–5 star rating for a movie.
- `GET /api/ratings/me` – Retrieve all ratings submitted by the current user.

### Reviews
- `GET /api/reviews?movieId=` – List community reviews for a movie.
- `POST /api/reviews` – Submit a written review.
- `PUT /api/reviews/:id` – Edit personal review.
- `DELETE /api/reviews/:id` – Delete personal review (or admin moderation).
- `GET /api/reviews/me` – List all reviews authored by the current user.

### Watchlist
- `GET /api/watchlist` – Fetch current user's saved movies.
- `POST /api/watchlist` – Add a movie to the watchlist.
- `DELETE /api/watchlist/:movieId` – Remove a movie from the watchlist.

### Admin
- `GET /api/admin/stats` – Platform metric totals (movies, users, reviews, ratings, average rating).
- `GET /api/admin/users` – List all registered user accounts.
- `GET /api/admin/reviews` – Moderation view for all reviews across all movies.

---

## Demo Credentials

For quick evaluation, pre-seeded accounts are readily available via the **1-Click Demo** buttons inside the Sign In modal:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@cinerate.com` | `Admin@123` |
| **Standard Member** | `alex@cinerate.com` | `User@123` |
| **Community Reviewer** | `sarah.j@cinerate.com` | `User@123` |

---

## Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/cinerate.git
cd cinerate
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cinerate"
JWT_SECRET="cinerate_super_secure_jwt_secret_key_2026_change_in_production"
PORT=3000
NODE_ENV=development
```

### 3. Initialize Database (Optional)
Run the script in `database/schema.sql` against your PostgreSQL database:
```bash
psql -U postgres -d cinerate -f database/schema.sql
```
*(If no external PostgreSQL database is configured, the application automatically boots using the embedded data store with all 1,050 movies and 3,600+ reviews).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment Instructions

### Vercel Deployment
1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), click **New Project** and import the repository.
3. Configure the following **Environment Variables**:
   - `DATABASE_URL`: Your hosted PostgreSQL connection URI (e.g., Supabase or Neon).
   - `JWT_SECRET`: A strong secret key string.
   - `NODE_ENV`: `production`
4. Deploy! The included `vercel.json` automatically configures routing for both the client SPA and Express API.
