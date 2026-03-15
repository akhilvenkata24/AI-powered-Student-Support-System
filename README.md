# AI Student Support System

Full-stack student support platform with AI chat, admissions tracking, wellbeing workflows, and an admin operations panel.

## Features

1. AI chat assistant with sentiment-aware support.
2. Admissions tracking and document status experience.
3. Mental wellbeing booking and counseling tools.
4. Admin dashboard with FAQ management and case monitoring.
5. Virtual counselor live room with transcript and session persistence.

## Stack

1. Frontend: React, Vite, Tailwind CSS.
2. Backend: Node.js, Express.
3. Database: MongoDB with Mongoose.
4. AI: OpenAI API.

## Local Setup

1. Install dependencies from root:

```bash
npm install
```

2. Create environment files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

3. Update server environment in server/.env:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student-support
OPENAI_API_KEY=your_openai_api_key
ADMIN_AUTH_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
```

4. Run app from root:

```bash
npm run dev
```

## Deployment Ready Changes Included

1. Backend CORS is now environment-controlled using FRONTEND_URL or FRONTEND_URLS.
2. Production trust-proxy support is enabled.
3. Server and client environment templates are included.
4. Entry page has light/dark theme toggle.

## MongoDB Atlas Setup

1. Go to MongoDB Atlas and create a new project.
2. Create an M0 cluster.
3. In Database Access, create a database user with password.
4. In Network Access, add your deployment IP allow list.
5. Open Connect > Drivers and copy the connection string.
6. Replace username, password, and database name in the URI.

Example:

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/student-support?retryWrites=true&w=majority
```

## Recommended Deployment

### Backend on Render

1. Create a new Web Service from the server folder repo.
2. Build Command:

```bash
npm install
```

3. Start Command:

```bash
npm start
```

4. Add environment variables:
   1. NODE_ENV=production
   2. PORT=10000 (or Render default)
   3. OPENAI_API_KEY=your_key
   4. MONGODB_URI=your_atlas_uri
   5. ADMIN_AUTH_SECRET=long_random_secret
   6. FRONTEND_URL=https://your-frontend-domain

5. Deploy and verify health endpoint:

```text
https://your-backend-domain/health
```

### Frontend on Vercel

1. Import the project and set Root Directory to client.
2. Add environment variable:

```env
VITE_API_URL=https://your-backend-domain/api
```

3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Deploy.

### Final CORS Alignment

After frontend deploy is complete, update backend env:

```env
FRONTEND_URL=https://your-frontend-domain
```

If you use multiple domains:

```env
FRONTEND_URLS=https://your-frontend-domain,https://www.yourcustomdomain.com
```
