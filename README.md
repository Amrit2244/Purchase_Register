# Purchase Register Application

A Next.js application for managing purchase entries with user authentication and MongoDB database.

## Features

- User authentication (login/register)
- Party management
- Item management
- Purchase entry management with auto-incrementing serial numbers
- Form validation for various fields
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd purchase-register
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/purchase_register
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

4. Start MongoDB locally or use MongoDB Atlas.

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Register a new user account
2. Log in with your credentials
3. Add parties and items first
4. Create purchase entries with the required information
5. View and manage your entries

## Data Validation

- Vehicle Number: 9-10 characters with 1-2 letters followed by 7-8 numbers
- Transit Pass No: Exactly 19 digits
- Quantity: 1-2 digits
- Origin Form J No: 2 letters followed by 11 numbers

## Technologies Used

- Next.js
- TypeScript
- MongoDB
- Mongoose
- NextAuth.js
- Tailwind CSS
- React Hook Form

## License

MIT
# purchase_register
