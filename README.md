# recruitment-assistant

## Run locally without Docker
1. **Prerequisites**
   - Python 3.10+
   - Node.js 18+ (for the React dashboard)
   - A running Milvus instance (standalone or cloud). You can start a local Milvus quickly with `docker run -d --name milvus-standalone -p 19530:19530 -p 9091:9091 milvusdb/milvus:v2.4.5-20240513-66eae42`.

2. **Backend setup**
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   
   # required environment variables
   export OPENAI_API_KEY="<your_api_key>"
   export MILVUS_URI="http://localhost:19530"      # or your remote/cloud endpoint
   export MILVUS_TOKEN="<if_required>"             # optional for auth-enabled clusters
   ```

3. **Initialize the Milvus collection**
   ```bash
   python db_init.py
   ```

4. **Run the FastAPI server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Run the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev -- --host --port 5173
   ```

6. Access the app at `http://localhost:5173` (frontend) with the API at `http://localhost:8000`.

## Run with Docker
> The repository does not ship ready-made Dockerfiles yet. The commands below use published base images to run the stack without installing local dependencies.

1. **Start Milvus (standalone)**
   ```bash
   docker run -d --name milvus-standalone -p 19530:19530 -p 9091:9091 milvusdb/milvus:v2.4.5-20240513-66eae42
   ```

2. **Run the FastAPI backend in a Python container**
   ```bash
   docker run --rm -it \
     -p 8000:8000 \
     -v "$(pwd)":/app \
     -w /app \
     -e OPENAI_API_KEY="<your_api_key>" \
     -e MILVUS_URI="http://host.docker.internal:19530" \
     python:3.11-slim bash -c "pip install --no-cache-dir -r requirements.txt && python db_init.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"
   ```

3. **Run the React frontend in a Node container**
   ```bash
   docker run --rm -it \
     -p 5173:5173 \
     -v "$(pwd)/frontend":/app \
     -w /app \
     node:20-bullseye bash -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
   ```

4. Navigate to `http://localhost:5173` to use the UI.

## Notes
- The backend depends on valid OpenAI (or Gemini) credentials for reasoning and embedding calls.
- Update `MILVUS_URI`/`MILVUS_TOKEN` if you use Zilliz Cloud or an authenticated Milvus deployment.
- Run the test suite locally with `pytest` from the repo root.
