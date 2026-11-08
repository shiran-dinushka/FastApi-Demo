# FastAPI Product Inventory

A small product inventory API built with FastAPI and SQLAlchemy, with a React dashboard in `frontend/`.

## Requirements

- Python 3.10+
- PostgreSQL
- Node.js and npm

## Configure the database

The backend currently reads its PostgreSQL connection URL from `database.py`. Update `db_url` there to match your local PostgreSQL database before starting the API. The database must already exist; the app creates its `products` table and inserts sample products when the table is empty.

## Run the backend

From the repository root, create and activate a virtual environment, then install the dependencies:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy "psycopg[binary]"
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

## Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend calls the API directly. FastAPI CORS is configured for `localhost:5173` and `127.0.0.1:5173`. To use another backend URL, set `VITE_API_URL` in `frontend/.env`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/products` | List products |
| `GET` | `/product/{id}` | Get one product |
| `POST` | `/product` | Add a product |
| `PUT` | `/product/{id}` | Update a product |
| `DELETE` | `/product/{id}` | Delete a product |

Product JSON uses `id`, `name`, `description`, `price`, and `quantity` fields.
