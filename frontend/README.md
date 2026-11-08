# Stockroom frontend

A React and JavaScript inventory dashboard for the FastAPI product API in this repository.

## Run locally

1. Start the backend from the repository root with `uvicorn main:app --reload` (FastAPI listens on port 8000).
2. In `frontend`, install dependencies with `npm install`.
3. Start Vite with `npm run dev` and open the local URL it prints.

The frontend calls `http://localhost:8000` directly. FastAPI allows the default Vite origins `http://localhost:5173` and `http://127.0.0.1:5173` through CORS. Set `VITE_API_URL` in a `.env` file if the backend runs at another address.

Products use the API's required fields: numeric `id`, `name`, `description`, numeric `price`, and integer `quantity`.
