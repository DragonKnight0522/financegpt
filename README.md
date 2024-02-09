# FinanceGPT

FinanceGPT is an innovative solution for personal finance management that integrates the power of AI to work as your personal accountant. This application provides a user-friendly dashboard and chat interface to interact with financial insights and account overviews. It harnesses the capabilities of Plaid API to consolidate financial data from various accounts, offering a comprehensive view of your personal finances.

## Features

- **Dashboard**: A central place to get an overview of all your financial data.
- **AI-Powered Insights**: Utilizes GPT-4 to provide smart insights into your spending habits and financial health.
- **Multi-Account Aggregation**: With Plaid API integration, users can link multiple banking and credit accounts for a unified view.
- **Secure Google Authentication**: Ensures that only you can access your financial data.
- **Collections**: Organize and categorize transactions across different accounts.

## Built With

FinanceGPT leverages a robust tech stack to deliver a seamless and responsive experience:

- **Frontend**
  - **Next.js**: A React framework for building user interfaces with server-side rendering for better performance and SEO.
  - **Redux**: A state management library to manage the app's state in a predictable way.
  - **TailwindCSS**: A utility-first CSS framework for rapid UI development without leaving your HTML.
- **Backend**
  - **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
  - **Express**: A minimal and flexible Node.js web application framework.
  - **MongoDB**: A NoSQL database for storing application data.

## How to Use

To use FinanceGPT, follow these steps:

1. **Authentication**: Sign in using Google Auth for a secure authentication process.
2. **Link Accounts**: Connect your financial accounts using Plaid to start aggregating your data.
3. **Explore Dashboard**: View your financial summary, recent transactions, and insights provided by GPT-4 on the dashboard.
4. **Chat with AI**: Interact with the AI personal assistant for personalized financial advice and queries.

## Installation

This section will guide you through setting up your local development environment.

### Prerequisites

- Node.js
- npm or yarn
- MongoDB

### Steps

1. Clone the repository:
```shell
git clone https://github.com/DragonKnight0522/financegpt.git
```

2. Install dependencies for both backend and frontend:
```shell
# Backend dependencies
cd FinanceGPT/backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables including your Plaid API keys and Google Auth credentials in `.env` files.

4. Start the backend server:
```shell
cd backend
npm start
```

5. Launch the frontend application in another terminal:
```shell
cd frontend
npm run dev
```

Now navigate to `localhost:3000` in your browser to start using FinanceGPT.

## Contributing

Interested in contributing? We welcome contributions from developers of all skill levels! To get started, simply fork the repository and submit your changes via a pull request.

## Security

Your security is paramount. FinanceGPT follows best practices in securing application data and using OAuth protocols for user authentications.

---

Experience the next level of personal finance with FinanceGPT – Your AI-enabled accountant at your fingertips.
