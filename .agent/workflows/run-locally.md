---
description: how to run the application locally
---

To run the **Tradeflow** application locally with Inngest and Next.js, follow these steps:

1. **Install Dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Ensure your `.env` file contains all necessary keys (MongoDB, better-auth, Inngest, Finnhub, etc.). Your current file looks complete!

3. **Start the Inngest Dev Server**:
   Inngest requires a local background process to handle events (like emails). Open a new terminal and run:
   // turbo
   ```bash
   npm run inngest:dev
   ```
   *This will open a dashboard at [http://localhost:8288](http://localhost:8288).*

4. **Start the Next.js Development Server**:
   Open another terminal and run:
   // turbo
   ```bash
   npm run dev
   ```
   *Your app will be available at [http://localhost:3000](http://localhost:3000).*

5. **Sync Inngest**:
   Once both are running, go to the Inngest dashboard (localhost:8288) and ensure it has discovered your functions at `http://localhost:3000/api/inngest`.
