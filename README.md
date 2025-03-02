## 🚀 Project Setup

### 1️⃣ Clone the Repository

```sh
git clone <your-repository-url>
cd Flow_App
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Create a Clerk Account

- **Register** at [Clerk.dev](https://clerk.dev/).
- **Create a new app** in the Clerk dashboard.
- **Copy** the **Secret Key** and **Publishable Key**.

### 4️⃣ Configure Environment Variables

Create a `.env.local` file in the project's root directory and add the following:

```ini
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_APP_URL=http://localhost:3000 (change this to your platform url incase of deployment)
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/setup
API_SECRET_KEY=your_32_bit_hexadecimal_hash
ENCRYPTION_KEY=your_32_bit_hexadecimal_hash
```

**Note:** Generate `API_SECRET_KEY` & `ENCRYPTION_KEY` using:

```sh
openssl rand -hex 32  # (for Linux/macOS)
```

### 5️⃣ Setup Database (SQLite3)

1. Install SQLite3:
   ```sh
   npm install sqlite3
   ```
2. Create a `.env` file and configure the database:
   ```ini
   DATABASE_URL="file:./prisma/Flow_App.db"
   ```
### 6 Setup AI data fetching (LLM)
1. Launch the app navigate to crdentials create a new credential and enter your openAi api key


## 🎬 Demo Video

[Watch the Demo](your-video-link)

---

## 🎯 Features

✅ User Authentication with Clerk\
✅ Secure API with Encryption\
✅ SQLite3 Database Integration\
✅ Responsive UI

---

## 📜 License

This project is licensed under the **MIT License**.

---


🚀 Happy Coding! 🎉

