# Concept: Redis & BullMQ Queues

## What is a Queue?
Imagine a restaurant kitchen.
- **The Waiter (API)** takes an order and gives it to the kitchen. The waiter doesn't cook it; they just post the ticket and go back to the tables.
- **The Ticket Rail (Redis)** holds all the orders in a line.
- **The Chef (Worker)** sees a ticket, takes it, and cooks the meal.

In our app:
1.  **User**: Clicks "Import Jobs".
2.  **API**: Says "Import Request Received!" and drops a message into **Redis**. it responds instantly to the user.
3.  **Worker**: In the background, sees the message in **Redis**, fetches the XML, processes it, and saves to MongoDB.

## Why use it?
- **Speed**: The user doesn't have to wait for the import to finish (which could take minutes).
- **Reliability**: If the server crashes, the job is still in Redis. When the server restarts, it picks up where it left off.
- **Scalability**: You can have 1 API server and 10 Worker servers processing jobs in parallel.

## BullMQ
BullMQ is a library that makes using Redis as a queue easy. It handles:
- **Retries**: If a job fails (e.g., API down), it can verify and try again later automatically.
- **Concurrency**: It controls how many jobs run at once.
