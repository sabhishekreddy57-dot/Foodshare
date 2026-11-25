# FoodShare React app

## Run locally
1. Install Node.js (LTS).
2. Extract this ZIP and open a terminal in the `foodshare-react` folder.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL shown in the terminal.

## Deploy to Vercel
1. Push the folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Vercel should detect Vite automatically. Build command: `npm run build`; output directory: `dist`.
4. Click **Deploy**.

## Important notes
- Food posts and claims are saved in the browser's localStorage. This is suitable for a demo, but not shared between different users/devices. For a real deployed multi-user app, connect a backend/database such as Supabase or Firebase.
- The admin username/password are demo credentials kept in client-side code. Do not use this for real security; implement server-side authentication before production.
- The supplied HTML file ended partway through the recipient-food rendering function, so the missing tail of the original JavaScript was reconstructed to complete the React app.
