
# 🧰 Sheet Metal Design Preview Tool

An interactive web-based tool for visualizing sheet metal designs. Users can define sheet dimensions, add custom fold lines with directions (**Up** or **Down**), preview the layout, and download the design in **SVG**, **PNG**, or **DXF** format. 

---

## 🚀 Features

- 📐 Set custom **sheet width** and **height**
- ➕ Add fold lines at specific positions with bend directions (**Up** or **Down**)
- 🔁 Reposition fold lines with drag-and-drop
- 🔍 Zoom and pan the canvas for better control
- 🧹 Clear all folds and reset the design
- 🖼️ Live canvas preview using **SVG**
- 💾 Download design as:
  - **SVG**
  - **PNG**
  - **DXF (AutoCAD-compatible)**

---

## 🛠 Tech Stack

### Frontend
- **HTML**
- **Tailwind CSS** (for responsive, clean UI)
- **JavaScript** (for all interactive canvas and download logic)
- **SVG** (for vector-based canvas rendering)

### Backend
- **Python 3**
- **Django 4.x**
- **SQLite3** (default, can be switched to PostgreSQL)
---

## 📂 Project Structure

```
sheet-metal-design/
├── designer/
│   ├── static/               # All frontend assets (CSS, JS)
│   ├── templates/            # HTML templates
│   ├── views.py              # Django views 
│   ├── urls.py               # App URL configuration
│   └── admin.py              # Admin registration for DownloadRecord
├── sheetmetal/               # Django project settings
├── db.sqlite3
├── manage.py
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/zainnadeem786/Techozon-Demo-Task
cd sheet-metal-design
```

### 2. Create & Activate Virtual Environment

```bash
python -m venv env
source env/bin/activate   # For Linux/macOS
env\Scripts\activate      # For Windows
```

### 3. Install Requirements

```bash
pip install -r requirements.txt
```

> If `requirements.txt` is missing, manually install:
```bash
pip install django
```

### 4. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (for admin panel)

```bash
python manage.py createsuperuser
```

### 6. Run the Development Server

```bash
python manage.py runserver
```

Now visit: **http://127.0.0.1:8000/**

Admin: **http://127.0.0.1:8000/admin/**

---

## ✅ How to Use

1. Enter **sheet width** and **height**
2. Click **"Set Sheet"**
3. Enter fold line position and bend direction (Up/Down)
4. Click **"Add Fold"**
5. Use mouse to **zoom, pan, or drag fold lines**
6. Download design as PNG/SVG/DXF


---

## 🔐 Admin Panel

Go to: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)  
Login with your superuser credentials.




---

## 🙌 Credits

Developed by **Zain Nadeem**  
Python Django Developer | Software Engineer | Frontend + Backend Integration Specialist  
[LinkedIn](http://www.linkedin.com/in/zain-nadeem786) | [GitHub](https://github.com/zainnadeem786) | 


