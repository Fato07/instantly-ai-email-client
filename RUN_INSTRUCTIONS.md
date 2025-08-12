# Running the AI Email Client Application

## Prerequisites
- Node.js installed
- Yarn package manager installed

## Backend Setup (Terminal 1)
```bash
cd backend
yarn install       # Install dependencies (if not done already)
yarn migrate       # Run database migrations (if not done already)
yarn dev          # Start backend server on port 3002
```

## Frontend Setup (Terminal 2)
```bash
cd frontend
yarn install      # Install dependencies (if not done already)
yarn dev         # Start frontend server on port 3000
```

## Access the Application
- Open your browser and navigate to: http://localhost:3000
- The backend API runs on: http://localhost:3002

## Features Implemented
1. ✅ **Email Sidebar** - Apple Mail style list of emails
2. ✅ **Email Viewer** - Display selected email with To, CC, BCC, Subject, and Body
3. ✅ **Compose Email** - Floating action button opens compose dialog
4. ✅ **AI Integration** - AI ✨ button in compose form
5. ✅ **Router Assistant** - Classifies intent (sales, follow-up, general)
6. ✅ **Sales Assistant** - Generates concise sales emails (40 words max)
7. ✅ **Follow-up Assistant** - Creates polite follow-up emails
8. ✅ **Streaming Support** - Real-time content generation with SSE
9. ✅ **React Query** - Efficient data fetching and caching
10. ✅ **Material-UI** - Modern, responsive design

## Testing the Application
1. Click the compose button (bottom-right corner)
2. Fill in the To and Subject fields
3. Click the "AI ✨" chip to use AI assistance
4. Enter a prompt like:
   - "Sales pitch for our new CRM software"
   - "Follow up on our meeting yesterday"
   - "Meeting request for next Tuesday"
5. The AI will classify your intent and generate appropriate content
6. Click "Send" to save the email (it won't actually send, just saves to database)
7. The email will appear in the sidebar immediately

## Notes
- Emails are saved to a local SQLite database
- The AI generation uses template-based responses (can be replaced with real AI API)
- All core requirements from the assignment have been implemented