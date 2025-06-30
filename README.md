# Trip Planner

A personal travel planning web app built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

## Features

- Create and manage trips
- Add activities to trips with drag-and-drop timeline
- Flight management with Amadeus API integration
- Real-time data synchronization with Firebase
- Modern, responsive UI with Tailwind CSS

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Amadeus API credentials (for flight lookup feature)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory with your Amadeus API credentials:

```env
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here
```

To get Amadeus API credentials:
1. Go to [Amadeus for Developers](https://developers.amadeus.com/)
2. Create an account and register your application
3. Get your API key and secret from the dashboard

### Development

For local development, you need to run both the frontend and API server:

1. Start the API server (in one terminal):
   ```bash
   npm run dev:api
   ```

2. Start the frontend development server (in another terminal):
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the API server at `http://localhost:3001`.

### Production

For production deployment on Vercel:

1. The API routes in the `api/` directory will be automatically deployed as serverless functions
2. Set your environment variables in the Vercel dashboard
3. Deploy using `vercel` CLI or connect your GitHub repository

## API Endpoints

- `POST /api/flight-lookup` - Look up flight information using Amadeus API

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Flight Data**: Amadeus API

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
