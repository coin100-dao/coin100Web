# COIN100 (C100) Web Application

A React-based web application for the COIN100 (C100) cryptocurrency index fund built on the Polygon network.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/coin100-dao/coin100Web
cd coin100
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Required environment variables:
```env
VITE_REACT_API_BASE_URL=
VITE_REACT_APP_DEBUG=false
```

### 4. Development Server

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Husky and Lint-Staged Setup

1. Initialize Husky:
```bash
npm run prepare
```

2. Create `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

3. Make the pre-commit hook executable:
```bash
chmod +x .husky/pre-commit
```

## Available Scripts

```json
{
  "scripts": {
    "prepare": "husky",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,scss}\"",
    "lint:css": "stylelint \"src/**/*.{css,scss}\" --fix",
    "lint:js": "eslint \"src/**/*.{js,jsx,ts,tsx}\" --fix",
    "lint": "npm run lint:css && npm run lint:js",
    "build": "tsc --project tsconfig.app.json && vite build",
    "dev": "vite --host 0.0.0.0",
    "preview": "npm run dev && code --new-window --enable-preview"
  }
}
```

## Project Structure

```
coin100/
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # Reusable components
│   │   └── footer/      # Footer component
│   ├── data/            # Contract ABIs and static data
│   ├── pages/           # Page components
│   │   ├── About.tsx
│   │   └── Dashboard.tsx
│   ├── services/        # API services
│   │   └── api.ts
│   ├── store/           # Redux store
│   │   └── hooks.ts
│   └── vite-env.d.ts    # TypeScript declarations
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── .stylelintrc.js
├── .github/
│   └── workflows/       # GitHub Actions
│       └── master.yml
└── package.json
```

## GitHub Actions Workflow

Create `.github/workflows/master.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linters
      run: |
        npm run lint:js
        npm run lint:css
        
    - name: Build
      run: npm run build
```

## Development Guidelines

1. **Code Style**
   - Use TypeScript for all new files
   - Follow ESLint and Prettier configurations
   - Use functional components with hooks
   - Implement proper error handling

2. **Component Structure**
   - Keep components small and focused
   - Use proper TypeScript interfaces
   - Implement proper prop validation
   - Follow Material-UI best practices

3. **State Management**
   - Use Redux for global state
   - Use local state for component-specific state
   - Implement proper error handling in reducers

4. **Testing**
   - Write unit tests for utilities
   - Write integration tests for components
   - Test error scenarios
   - Maintain good test coverage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- Email: mayor@coin100.link
- Discord: [Join Our Discord](https://discord.com/channels/1318664310490398770/1318664310490398773)
- Reddit: [r/Coin100](https://www.reddit.com/r/Coin100)
- X: [@Coin100token](https://x.com/Coin100token)
- Telegram: [@Coin100token](https://t.me/coin100token)

## Smart Contract Addresses

- COIN100: `0x1459884924e7e973d1579ee4ebcaa4ef0b1c8f21`
- Public Sale: `0x2cdac1848b1c14d36e173e10315da97bb17b5489`
</rewritten_file>