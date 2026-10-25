# 🎫 QuickDesk - Support Ticket & Issue Management System

> **A Beginner-Friendly, Responsive Frontend-Only Web Application**  
> Built with pure **HTML5, CSS3, and JavaScript (ES6)**. No backend server or Node.js build tools required!

🌐 **Live Demo on Vercel:** [https://supportdesk-frontend-dusky.vercel.app](https://supportdesk-frontend-dusky.vercel.app)  
📦 **GitHub Repository:** [https://github.com/samarthatri/quickdesk-frontend](https://github.com/samarthatri/quickdesk-frontend)

---

## 📖 Project Overview

**QuickDesk** is a customer support ticket and issue management web application designed for learning, demonstrations, and portfolio submissions. It simulates a full-stack experience right inside the browser using `localStorage` as a mock database.

### 🌟 Key Highlights
- **100% Frontend-Only**: Zero backend setup. Data persists across browser refreshes via `localStorage`.
- **Role-Based Access Control (RBAC)**: Distinct permissions and views for **Admin**, **Agent**, and **User**.
- **Complete CRUD Lifecycle**: Create, Read, Update, and Delete support tickets.
- **Client-Side Form Validation**: Real-time format checks, email regex, required fields, and password matching.
- **Responsive Layout**: Designed from scratch with CSS Flexbox, Grid, and Media Queries (Mobile, Tablet, Desktop).
- **Built-in Automated Test Suite**: Run 15 interactive unit & integration tests directly in the browser!
- **Beginner-Friendly Code**: Written cleanly with descriptive variable names and clear, educational comments.

---

## 👥 Demo User Accounts (Pre-loaded)

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Alex Admin | `admin@example.com` | `Admin@123` | Full CRUD on all tickets, assign agents, manage users (RBAC), delete records. |
| **Agent** | Sarah Agent | `agent@example.com` | `Agent@123` | View all tickets, update ticket statuses, add resolution notes. |
| **User** | John Customer | `user@example.com` | `User@123` | Create new tickets, view own tickets, edit/cancel open tickets, edit profile. |

*(Note: You can also register a new user on the Registration page or use the 1-click fill buttons on the Login page!)*

---

## 🚀 Features & Modules

### 1. Authentication & Session Management
- **Login (`login.html`)**: Validates credentials against `localStorage`, shows error alerts, remembers active session.
- **Register (`register.html`)**: Validates email format, minimum 6 characters for password, password confirmation matching, and blocks duplicate registered emails.
- **Forgot Password (`forgot-password.html`)**: 2-step simulated password recovery. Finds user by email and updates password in storage.
- **Route Protection (`js/auth.js`)**: `requireAuth()` guards protected pages from unauthorized or unauthenticated visits.

### 2. Support Ticket CRUD Operations (`dashboard.html` & `js/tickets.js`)
- **[C] Create**: Add tickets with Title, Category (Technical, Billing, Account, UI/UX, etc.), Priority (Low, Medium, High), and Description.
- **[R] Read**:
  - Live summary statistics (Total, Open, In Progress, Resolved).
  - Real-time search by ticket ID, title, or requester.
  - Multi-criteria filter by Status and Priority.
  - Regular Users only see their submitted tickets; Agents and Admins see all.
- **[U] Update**:
  - Users can edit details for open tickets.
  - Agents can change statuses and append resolution notes.
  - Admins can reassign tickets to specific agents.
- **[D] Delete**:
  - Admins can delete any ticket.
  - Regular users can cancel their own open tickets.
  - Agents are barred from deleting tickets.

### 3. User Directory & RBAC (`users.html` & `js/users.js`)
- Accessible exclusively by **Admin** users.
- Search and filter users by role.
- Add new team members with selected roles (`Admin`, `Agent`, `User`).
- Edit user details or role.
- Delete users (with safety guard preventing admins from deleting their own active account).

### 4. User Profile & Settings (`profile.html` & `js/profile.js`)
- View account summary, avatar initial, join date, and active role badge.
- Edit Full Name, Phone number, and Bio.
- Securely change password (verifies current password before saving new password).

### 5. Automated Test Suite (`test.html` & `js/tests.js`)
- 15 unit and integration tests covering:
  - Email format validator
  - Password length constraints
  - Mock database preloading
  - Successful & failed logins
  - Duplicate registration prevention
  - Ticket Creation, Retrieval, Status Updating, and Deletion
  - RBAC security guards
  - Profile updates and password reset

---

## 📂 Project Structure

```text
supportdesk-frontend/
│
├── index.html               # Project landing page & role showcase
├── login.html               # Login page with validation & demo buttons
├── register.html            # Registration form with validation
├── forgot-password.html     # Password recovery flow
├── dashboard.html           # Main ticket dashboard (CRUD operations)
├── profile.html             # User profile and password management
├── users.html               # User directory & RBAC management (Admin only)
├── test.html                # Interactive automated test suite runner
│
├── css/
│   └── style.css            # Clean, beginner-friendly responsive CSS
│
├── js/
│   ├── data.js              # Mock database (localStorage seed & helpers)
│   ├── auth.js              # Auth state, session guards & validation helpers
│   ├── tickets.js           # Ticket CRUD functions & UI rendering
│   ├── users.js             # User list management & RBAC logic
│   ├── profile.js           # Profile view and update logic
│   └── tests.js             # Unit and integration test assertions
│
└── README.md                # Comprehensive documentation
```

---

## 💻 How to Run Locally

Because this is a pure frontend application, **no compilation or installation is necessary**!

### Option 1: Direct Double Click
Simply navigate to the project directory on your computer and double-click `index.html` to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Using VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on `index.html` and select **"Open with Live Server"**.

### Option 3: Using Python Simple Server
Open your terminal in the project directory and run:
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🌐 How to Host on GitHub & Enable GitHub Pages

Follow these step-by-step commands to publish this website for free on the internet!

### Step 1: Initialize Git and Commit
Open PowerShell or your terminal in the project folder:
```bash
# 1. Initialize a new local Git repository
git init

# 2. Stage all project files
git add .

# 3. Create your first commit
git commit -m "Initial commit: QuickDesk Frontend Application"
```

### Step 2: Create a GitHub Repository
1. Log in to [GitHub](https://github.com).
2. Click the **`+`** icon in the top right corner and choose **New repository**.
3. Name your repository (e.g., `quickdesk-frontend`).
4. Keep it **Public** (required for free GitHub Pages).
5. Do **not** initialize with a README (we already created one).
6. Click **Create repository**.

### Step 3: Link & Push Your Code
Copy the repository URL shown on GitHub and run:
```bash
# Rename branch to main
git branch -M main

# Link your local repo to GitHub (replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/quickdesk-frontend.git

# Push code to GitHub
git push -u origin main
```

### Step 4: Enable Free Hosting via GitHub Pages
1. Go to your repository on GitHub.
2. Click on **Settings** (top navigation tab).
3. On the left sidebar, click on **Pages**.
4. Under **Build and deployment > Branch**:
   - Select **Branch**: `main`
   - Select **Folder**: `/ (root)`
   - Click **Save**.
5. Wait 1–2 minutes. Refresh the page, and GitHub will provide your live URL:  
   👉 `https://YOUR-USERNAME.github.io/quickdesk-frontend/`

---

## 🧪 Running the Tests

To verify that all functions work correctly:
1. Open the project in your browser.
2. Click on **"Run Test Suite 🧪"** on the home page or open `test.html`.
3. Click the **"Run All Tests"** button.
4. You will see a complete visual breakdown with 15/15 tests passing!

---

## 📜 License
This project is open-source and free to use for educational, demonstration, and personal portfolio purposes.
