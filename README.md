# SwapSkill

A modern skill exchange platform that connects people who want to learn and teach different skills.

![SwapSkill Platform](https://via.placeholder.com/800x400?text=SwapSkill+Platform)

## 🚀 About SwapSkill

SwapSkill is a web application that facilitates skill exchanges between users. The platform allows users to:

- Create profiles listing skills they can teach and skills they want to learn
- Get matched with compatible users based on complementary skills
- Connect and schedule skill exchange sessions
- Build a community of passionate learners and teachers

Our mission is to create a collaborative learning environment where knowledge is freely exchanged, helping people develop new skills while sharing their expertise with others.

## ✨ Features

- **User Profiles**: Create detailed profiles showcasing your skills and learning interests
- **Smart Matching**: Advanced algorithm to find perfect skill-swap matches
- **Messaging System**: Built-in chat functionality to connect with matches
- **Session Scheduling**: Tools to plan and organize skill exchange sessions
- **Skill Categories**: Browse a wide range of skill categories including:
  - Coding & Technology
  - Music & Arts
  - Cooking & Culinary
  - Photography & Design
  - Languages & Communication
  - Sports & Physical Activities
  - And many more!
- **Community Features**: Success stories, testimonials, and community guidelines

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Passport.js
- **State Management**: React Query
- **UI Components**: Radix UI, Shadcn UI
- **Routing**: Wouter

## 🏗️ Project Structure

```
/
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   └── src/              # React source code
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utility functions and constants
│       ├── pages/        # Page components
│       └── styles/       # CSS and styling files
├── server/               # Backend Express application
│   ├── db/               # Database connection and models
│   ├── routes/           # API routes
│   └── index.ts          # Server entry point
└── shared/               # Shared code between client and server
    └── schema.ts         # Data schemas and types
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/skillswap.git
   cd skillswap
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📝 Contributing

We welcome contributions to SwapSkill! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- [Developer Name](https://github.com/namanvashishtha) - Full Stack Developer
- [Designer Name](https://github.com/namanvashishtha) - UI/UX Designer

## 🙏 Acknowledgments

- All our amazing users who make skill exchanges possible
- Open source community for the incredible tools and libraries
- Everyone who has contributed to making SwapSkill better

---

Made with ❤️ by the SwapSkill Team