# Scalable Job Importer

A robust, scalable system to import jobs from external XML feeds, process them via a Redis-based queue, and store them in MongoDB. Includes a Next.js Admin Dashboard for monitoring import history.

## 🚀 Key Features
-   **Automated Ingestion**: Cron jobs run hourly to fetch data from configured XML feeds.
-   **Scalable Queue System**: Uses Redis + BullMQ to handle background processing, ensuring the API remains responsive.
-   **Efficient Upserts**: Job deduplication and bulk updates using MongoDB `bulkWrite`.
-   **Import History**: Detailed tracking of each import run (New, Updated, Failed counts) visible in a real-time dashboard.
-   **Modern UI**: Built with Next.js and Tailwind CSS.

## 🛠️ Tech Stack
-   **Frontend**: Next.js (TypeScript), Tailwind CSS, Lucide Icons.
-   **Backend**: Node.js, Express.
-   **Database**: MongoDB (Mongoose).
-   **Queue**: BullMQ with Redis.

## 📂 Project Structure
```
/client      # Frontend Application (Next.js)
/server      # Backend Application (Express + Worker)
/docs        # System Documentation
```

## ⚡ Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally or Atlas URI)
-   Redis (Running locally or Cloud URI)

### 1. Backend Setup (`/server`)
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file (or use defaults):
    ```env
    PORT=8000
    MONGODB_URL=mongodb://localhost:27017/job-importer
    
    # Option 1: Local Redis
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379
    
    # Option 2: Cloud Redis (Render)
    # Use this Internal Connection URL in your Render Environment Variables (do not use locally)
    REDIS_URL=redis://127.0.0.1:6379
    ```
4.  Start the server (API + Worker + Cron):
    ```bash
    npm run dev
    ```
    *The server will start on port 8000.*

### 2. Frontend Setup (`/client`)
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `client` directory:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    *The app will be available at http://localhost:3000.*

## 🧪 Testing the System
1.  **View Dashboard**: Go to `http://localhost:3000`. You will see the Import History table.
2.  **Wait for Cron**: The system is configured to run automatically every hour.
3.  **Manual Trigger**: You can manually trigger an import via API:
    ```bash
    curl -X POST http://localhost:8000/api/jobs/import \
    -H "Content-Type: application/json" \
    -d '{"feedUrl":"https://jobicy.com/?feed=job_feed"}'
    ```
4.  **Check Results**: The dashboard will update to show "Processing" -> "Completed" with the count of new/updated jobs.

## 📖 Documentation
See `docs/architecture.md` for a detailed explanation of the system design and decisions.
