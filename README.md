# TaskFlow Pro

A subscription-based Kanban project management application with premium features and payment integration.

## Features

### Core Features
- User authentication and registration
- Drag and drop Kanban boards
- Real-time collaboration
- Multiple board management
- Card management with attachments

### Subscription Plans
- **Free Plan**: 3 boards, 5 members, basic templates
- **Pro Plan**: 50 boards, 25 members, premium templates, time tracking, custom fields
- **Team Plan**: 200 boards, 100 members, team analytics, advanced permissions
- **Enterprise Plan**: Unlimited everything, custom development

### Premium Features
- Time tracking and productivity analytics
- Custom fields and priority management
- Premium templates (Sprint Planning, Marketing, Sales Pipeline)
- Team performance analytics
- Advanced permissions and automation

## Technology Stack

- React 18 with Vite
- Firebase (Authentication, Firestore, Storage)
- Razorpay payment integration
- Tailwind CSS for styling
- Framer Motion for animations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment Configuration:
Create `.env.local` file:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

3. Firebase Setup:
   - Create Firebase project
   - Enable Authentication and Firestore
   - Deploy security rules from `firestore.rules`

4. Run development server:
```bash
npm run dev
```

## Payment Testing

Use Razorpay test credentials:
- **Success Card**: 4111 1111 1111 1111
- **Failure Card**: 4000 0000 0000 0002
- **UPI**: success@razorpay or failure@razorpay

## Deployment

1. Build project: `npm run build`
2. Deploy to Firebase Hosting: `firebase deploy`

## License

MIT License