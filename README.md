# Event Regestration

## Project Overview

This project is a web application for creating and managing event registration forms. It is a Node.js application built with Express.js and uses Knex.js for database interactions. The frontend consists of static HTML files.

The application allows organizers to sign up, log in, and create custom registration forms. Each form has a unique URL that can be shared with attendees. The submissions for each form are stored in the database and can be viewed by the organizer.

**Key Technologies:**

*   **Backend:** Node.js, Express.js, Knex.js
*   **Database:** SQLite (development), PostgreSQL (production)
*   **Frontend:** HTML, JavaScript
*   **Authentication:** `express-session` and `bcryptjs` for password hashing.
*   **Deployment:** Firebase Hosting

## Building and Running

**1. Install Dependencies:**

```bash
npm install
```

**2. Set up the Database:**

The project uses SQLite in the development environment. The database file is located at `db/app.db`. To create the database and run the migrations, use the following command:

```bash
npm run db:migrate
```

**3. Run the Application (Development):**

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

**4. Build for Production:**

To build the application for production, run the following command:

```bash
npm run build
```

This will compile the TypeScript files to JavaScript and place them in the `dist` directory.

**5. Run in Production:**

To run the application in production, you need to set the `DATABASE_URL` environment variable to point to your PostgreSQL database. Then, run the following command:

```bash
npm start
```

## Development Conventions

*   **Code Style:** The project uses TypeScript for the backend code. The code is well-structured and follows standard Node.js conventions.
*   **Database Migrations:** Database schema changes are managed through Knex.js migrations.
*   **API:** The application exposes a RESTful API for fetching data for the dashboard, forms, and submissions.
*   **Authentication:** User authentication is handled using sessions. The `isAuthenticated` middleware is used to protect routes that require authentication.
*   **Frontend:** The frontend is composed of static HTML files in the `views` directory. JavaScript is used to fetch data from the API and dynamically render the content.
