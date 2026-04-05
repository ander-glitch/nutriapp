# NutriApp

A Node.js/Express backend for tracking nutrition and food logs, backed by PostgreSQL via Prisma ORM. Designed to deploy on [Railway](https://railway.app).

## Project structure

```
nutriapp/
├── railway.json          # Railway build & deploy config
└── backend/
    ├── package.json
    ├── .env.example      # Copy to .env for local development
    ├── .gitignore
    ├── prisma/
    │   └── schema.prisma # Database schema (User, FoodItem, FoodLog)
    └── src/
        └── server.js     # Express entry point
```

## Local development

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL to your local Postgres instance

# 3. Push schema to the database and generate Prisma client
npx prisma db push
npx prisma generate

# 4. Start the server
npm start
# → http://localhost:3000
```

## API endpoints

| Method | Path              | Description                        |
|--------|-------------------|------------------------------------|
| GET    | `/health`         | Health check — returns `{status:"ok"}` |
| GET    | `/`               | API root                           |
| GET    | `/users`          | List all users                     |
| POST   | `/users`          | Create a user `{email, name?}`     |
| GET    | `/food-items`     | List all food items                |
| POST   | `/food-items`     | Create a food item `{name, calories, protein?, carbs?, fat?}` |
| GET    | `/logs/:userId`   | Get food logs for a user           |
| POST   | `/logs`           | Log a food entry `{userId, foodItemId, quantity?}` |

## Deploying to Railway

1. Push this repo to GitHub.
2. Create a new Railway project and connect the repo.
3. Add a **PostgreSQL** plugin — Railway will inject `DATABASE_URL` automatically.
4. Railway reads `railway.json` and will:
   - Run `npm install && npx prisma generate && npx prisma db push` on build.
   - Start the server with `node src/server.js` from the `backend/` folder.
   - Health-check the service at `GET /health`.
