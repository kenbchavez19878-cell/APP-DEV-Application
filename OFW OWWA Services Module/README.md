# MSWD Program Management System

This is a full-stack application for managing OFW (Overseas Filipino Worker) and OWWA (Overseas Workers Welfare Administration) services, consisting of a React frontend and a Django backend.

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (version 3.8 or higher)
- [PostgreSQL](https://www.postgresql.org/) (for the database)

## Installation

### Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd "OFW OWWA Services Module"
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # OR
   source venv/bin/activate  # On macOS/Linux
   ```

3. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   If you don't have a requirements.txt file, install these packages manually:
   ```bash
   pip install django djangorestframework dj-rest-auth django-allauth corsheaders psycopg2-binary
   ```

4. Set up the database:
   - Create a PostgreSQL database named `mswd_db`
   - Update the database credentials in `mswd_backend/settings.py` if needed:
     ```python
     DATABASES = {
         'default': {
             'ENGINE': 'django.db.backends.postgresql',
             'NAME': 'mswd_db',
             'USER': 'postgres',        # Your PostgreSQL username
             'PASSWORD': 'your_password', # Your PostgreSQL password
             'HOST': 'localhost',
             'PORT': '5432',
         }
     }
     ```

5. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a superuser (for Django admin access):
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to set up your admin username, email, and password.

### Frontend Setup (React)

1. Navigate to the frontend directory (if not already there):
   ```bash
   cd "OFW OWWA Services Module"
   ```

2. Install the Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Backend Server

To start the Django development server:

```bash
python manage.py runserver 0.0.0.0:8000
```

The backend API will be available at:
- Main site: `http://localhost:8000`
- Django Admin: `http://localhost:8000/admin/` (use the superuser credentials you created)
- API endpoints: `http://localhost:8000/api/`

### Frontend Development Server

To start the React development server:

```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production

### Backend
For production deployment, use a WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn mswd_backend.wsgi:application --bind 0.0.0.0:8000
```

### Frontend
To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `OFW OWWA Services Module/` - Contains both frontend and backend code
  - `mswd_backend/` - Django backend project
    - `settings.py` - Django settings
    - `urls.py` - URL routing
    - `wsgi.py` / `asgi.py` - WSGI/ASGI entry points
  - `core_profiles/` - Django app for OFW/OWWA profiles
    - `models.py` - Database models
    - `views.py` - API views
    - `admin.py` - Django admin configuration
    - `serializers.py` - DRF serializers
  - `src/` - React frontend source code
  - `public/` - Static assets
  - `index.html` - Main HTML file
  - `package.json` - Frontend dependencies and scripts
  - `manage.py` - Django management script

## Technologies Used

### Backend
- Django 6.0.5
- Django REST Framework
- dj-rest-auth (for authentication)
- django-allauth (for account handling)
- PostgreSQL (database)
- CORS headers

### Frontend
- React 18
- Vite (build tool)
- TypeScript
- Tailwind CSS
- Radix UI components
- Various other libraries for UI components and functionality

## Accessing Django Admin

1. Make sure the backend server is running (`python manage.py runserver`)
2. Navigate to `http://localhost:8000/admin/` in your web browser
3. Log in with the superuser credentials you created during setup
4. You'll have access to manage:
   - OFW Registrations
   - OWWA Officer Profiles
   - User Settings
   - Authentication and Authorization (Users, Groups, Permissions)
   - Sites (for allauth)

## Troubleshooting

### Backend Issues

1. **Database connection errors**:
   - Ensure PostgreSQL is running
   - Verify database credentials in `settings.py`
   - Make sure the database `mswd_db` exists

2. **Module not found errors**:
   - Make sure you're in the virtual environment
   - Try reinstalling packages: `pip install -r requirements.txt`

3. **Port already in use**:
   - Change the port in `runserver` command: `python manage.py runserver 0.0.0.0:8001`
   - Or free up port 8000

### Frontend Issues

1. **Node.js version issues**:
   - Use Node.js 18 or higher
   - Consider using nvm (Node Version Manager) to manage versions

2. **Dependency installation fails**:
   - Try deleting `node_modules` and `package-lock.json` then run `npm install` again
   - Check your internet connection and npm registry access

3. **Port 5173 already in use**:
   - Vite will automatically try the next available port (5174, 5175, etc.)
   - You can also specify a port: `npm run dev -- --port 3000`

### API Connection Issues

If the frontend can't connect to the backend:
1. Ensure both servers are running
2. Check that the backend is accessible from your frontend development server
3. Verify CORS settings in `settings.py` (currently set to allow all origins)
4. Check that API endpoints in the frontend code point to the correct backend URL
