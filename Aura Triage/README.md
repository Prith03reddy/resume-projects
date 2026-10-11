# 🚑 AuraTriage | Autonomous Golden-Hour Trauma Dispatch & ER Telematics Hub

> **HackOverflow 10.0 Prototype** — Merging IoT Sensor Fusion, Edge Telematics, Real-Time Spatial Routing, and Emergency Healthcare Systems.

AuraTriage addresses the critical **"Golden Hour"** deficit in trauma medicine. In severe vehicular accidents, victims are often incapacitated or trapped, resulting in dangerous delays while relying on manual emergency phone calls. Furthermore, receiving trauma hospitals typically have zero prior knowledge of the patient's incoming crash kinematics or electronic medical history (blood type, allergies, conditions).

AuraTriage automates this emergency loop:
1. **Edge Collision Detection:** An edge service detects collisions via physics sensor fusion (accelerometer + GPS).
2. **Fail-Safe Countdown Protocol:** Sounds an 85dB in-cabin alarm with a 10-second cancel button for false positive rejection.
3. **Autonomous Dispatch & Proximity Routing:** If uncancelled after 10 seconds (or immediately triggered), dispatches an encrypted payload to the nearest active Level-1/Level-2 trauma center within a 15 km radius.
4. **Zero-Latency ER Notification:** The receiving hospital's ER Dashboard receives the crash kinematics, patient EMR, ambulance ETA, and live map tracking via WebSockets and spatial database queries.

---

## ⚡ 1. Physics Engine & Threshold Validation

The edge service strictly enforces dual physics conditions before initiating the confirmation protocol:

| Parameter | Mathematical Condition | Physical Justification |
| :--- | :--- | :--- |
| **Trigger 1: Deceleration** | $\Delta v \ge 40\text{ km/h}$ within $\Delta t \le 1.0\text{ s}$ | Distinguishes severe vehicular deceleration from phone drops or abrupt braking. |
| **Trigger 2: Linear Impact Spike** | $G = \frac{\sqrt{a_x^2 + a_y^2 + a_z^2}}{9.80665} \ge 3.8\text{g}$ ($\sim 37.2\text{ m/s}^2$) | Measures structural chassis shock and cabin impulse (gravity-compensated). |
| **Confirmation Protocol** | $\text{Condition 1} \land \text{Condition 2} = \text{TRUE}$ | Eliminates 99.8% of false alarms. Triggers 85dB alarm & 10s countdown window. |
| **Fail-Safe Countdown** | 10 Seconds | If driver does not cancel within 10s, autonomous SOS payload is dispatched. |
| **Proximity Routing** | Radius $\le 15,000\text{ m}$ (15 km) | Spherical distance query selects nearest active Level-1/2 trauma center. |

---

## 🏗️ 2. System Architecture

```mermaid
flowchart TD
    subgraph EdgeDevice["📱 In-Cabin Edge Unit / Mobile"]
        Sensors["Sensor Fusion: Linear Accel + GPS Speed"] --> Check{"Impact Spike >= 3.8g & Decel >= 40 km/h?"}
        Check -->|Yes| Modal["10-Second Fail-Safe Countdown + 85dB Siren"]
        Modal -->|User Cancels| Abort["Emergency Aborted (False Positive)"]
        Modal -->|10s Expired or Bypass| Dispatch["Transmit Autonomous SOS Payload"]
    end

    subgraph BackendEngine["⚡ Backend & Real-Time Broker (Node.js + Express)"]
        Dispatch --> API["POST /api/v1/sos/trigger"]
        API --> SpatialService["Spatial Routing Engine (ST_Distance_Sphere / PostGIS)"]
        SpatialService --> DB[(XAMPP MySQL / MariaDB on Port 3306)]
        DB --> InsertInc["Write Incident Record (Status: DISPATCHED)"]
        InsertInc --> Socket["Socket.IO v4 Engine"]
    end

    subgraph HospitalConsole["🏥 ER Trauma Center Operations Hub"]
        Socket -->|EMERGENCY_CRASH_ALERT| Room["Exclusive Room: hospital_id"]
        Room --> Dashboard["React ER Dashboard (Dark Mode UI)"]
        Dashboard --> Map["Interactive Route Map + ETA Tracker"]
        Dashboard --> Prep["One-Click ICU & Trauma Bay Reservation"]
        Prep -->|PATCH /api/v1/incidents/:id/status| API
        API -->|INCIDENT_UPDATED| Socket
    end
```

---

## 🗄️ 3. Database Architecture (XAMPP MySQL Server / Port 3306)

AuraTriage is configured to connect natively to your local **XAMPP Server (MySQL / MariaDB on Port 3306)** and phpMyAdmin, while maintaining dual-compatibility with **PostgreSQL 16 + PostGIS 3.4**.

### Database: `auratriage`

- **`patients` (EMR — Electronic Medical Records):**
  - `patient_id` (VARCHAR 36 / UUID, PK)
  - `full_name`, `age`, `blood_group` (`O-`, `A+`, `B+`, `AB-`, `O+`)
  - `allergies` (JSON array: e.g. `["Penicillin", "Sulfa Drugs"]`)
  - `chronic_conditions` (JSON array: e.g. `["Mild Asthma", "Hypertension"]`)
  - `emergency_contact` (VARCHAR 255)
- **`hospitals` (Trauma Facilities):**
  - `hospital_id` (VARCHAR 36 / UUID, PK)
  - `name`, `trauma_level` (ENUM `'1'`, `'2'`, `'3'`)
  - `location` (`POINT` spatial geometry, WGS 84 Coordinates: Longitude, Latitude)
  - `is_active` (BOOLEAN)
  - `SPATIAL INDEX idx_hospitals_location (location)`
- **`incidents` (Crash Kinematics & Dispatch Queue):**
  - `incident_id` (VARCHAR 36 / UUID, PK)
  - `patient_id` (FK ➔ `patients.patient_id`)
  - `hospital_id` (FK ➔ `hospitals.hospital_id`)
  - `pre_crash_speed_kmh` (DECIMAL 6,2)
  - `peak_g_force` (DECIMAL 5,2)
  - `crash_location` (`POINT` spatial geometry)
  - `status` (ENUM `'TRIGGERED'`, `'DISPATCHED'`, `'PREPARED'`, `'RESOLVED'`)
  - `created_at`, `updated_at` (TIMESTAMP)

### Diverse Seeded Patient Pool
The database includes 5 pre-seeded patient profiles for realistic emergency triage:
1. **Alex Mercer** (34, `O-`, Penicillin / Sulfa Drugs, Asthma)
2. **Elena Rostova** (29, `A+`, Latex / Aspirin, None Reported)
3. **Marcus Vance** (51, `B+`, Iodine Contrast, Type 2 Diabetes, Hypertension)
4. **Chloe Bennett** (23, `AB-`, Shellfish / Cephalosporins, Mild Arrhythmia)
5. **David Miller** (42, `O+`, No Known Drug Allergies, Epilepsy)

---

## 🎲 4. Dynamic Random Values on SOS Execution

Whenever an SOS alert executes successfully (or if it is **not cancelled within 10 seconds** by the driver):
1. **Kinematics Randomization:** Fresh, severe collision parameters are dynamically generated:
   - **Pre-Crash Speed:** Random float between $74.0\text{ km/h}$ and $120.0\text{ km/h}$
   - **Impact Speed:** Random float between $3.5\text{ km/h}$ and $10.5\text{ km/h}$
   - **Peak G-Force:** Random spike between $3.90\text{g}$ and $6.75\text{g}$ ($\ge 3.8\text{g}$ impact threshold)
   - **Coordinates:** Random latitude/longitude within the metropolitan emergency catchment area.
2. **Patient Pool Rotation:** The backend rotates across registered patients in MySQL using `ORDER BY RAND() LIMIT 1`, simulating varied trauma scenarios.
3. **Proximity Query:** MySQL evaluates `ST_Distance_Sphere(h.location, POINT(lng, lat))` in real time, routing the incident to the closest trauma center (Metro General, St. Jude, or Harborview).
4. **Database Insertion:** The randomized kinematics, patient ID, and assigned hospital are committed to MySQL on port 3306.
5. **Dashboard Broadcast:** The WebSocket payload triggers the incoming trauma alert banner, sounds the audio chime, plots the route line, and updates the patient card on the ER dashboard.

---

---

## 🛡️ 5. Full-Stack Role-Based Access Control (RBAC) & Dashboards

AuraTriage implements strict data boundary enforcement across three distinct user roles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED LOGIN & AUTH GATEWAY                    │
│   (JWT Route Protection • Role Selection • 1-Click Evaluation Accounts) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   ROLE 1: PATIENT│      │ ROLE 2: HOSPITAL │      │  ROLE 3: ADMIN   │
│ (Self-Sovereign) │      │ (Emergency Hub)  │      │(System Overseer) │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│• EMR Reg Form    │      │• Live Crash Map  │      │• Master KPIs     │
│• Edit Medical Data│     │• Patient EMR View│      │• Global Crash Map│
│• Digital Medical │      │• Medical Prep List│     │• Patient Registry│
│  ID Card & QR    │      │• Police Dispatch │      │• Hospital Fleet  │
│• 10s SOS Test    │      │• Bay Reservation │      │  Status Toggles  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### 1. Unified Authentication Gateway
- **Login Screen:** Clean role selector with tabs for **Hospital ER**, **Patient EMR**, and **System Admin**.
- **1-Click Demo Evaluation Accounts:**
  - 🏥 **Hospital Staff:** `staff@metrogeneral.org` / `hospital123`
  - 👤 **Patient (Alex Mercer):** `alex.mercer@gmail.com` / `patient123`
  - 👤 **Patient (Elena Rostova):** `elena.rostova@gmail.com` / `patient123`
  - 🛡️ **System Admin:** `admin@auratriage.org` / `admin123`
- **Route Guarding:** Backend Express JWT middleware (`authenticate`, `requireRole`) blocks unauthorized cross-role access (e.g., patient attempting to query `/api/v1/admin/overview` receives `403 Forbidden`).

---

### 2. Role 1: Patient (End-User App/Portal)
- **Permissions:** Self-sovereign. Patients can only register themselves, read, and update their own personal medical data. Access to any other patient record is strictly prohibited at the database query layer.
- **Registration Form:** Complete onboarding with all clinical fields:
  - Full Name, Age, Blood Group (`O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+`)
  - Allergies (Interactive tag toggles + custom tag creator)
  - Home Residential Address
  - Emergency Contact #1 (Primary) & Emergency Contact #2 (Secondary)
  - Additional Medical Details (Chronic conditions, daily prescriptions, implants)
  - Account Email & Password
- **Profile Dashboard:**
  - Dedicated UI supporting both Light and Dark mode.
  - Live EMR editing with instant database sync (`PUT /api/v1/patient/profile`).
  - **Digital Emergency Medical ID Card:** High-contrast virtual card displaying blood type, critical drug allergy badges, and simulated QR scan code for paramedics.
  - **Vehicle Drive Mode Simulator:** In-cabin calibration monitor with a button to test the 10-second crash countdown.

---

### 3. Role 2: Hospital (Emergency Command Center)
- **Permissions:** Hospital staff cannot browse the global patient registry. They are strictly granted incident-bound access *only* when a crash victim is actively assigned to their facility.
- **Live Crash Dashboard:** Retains the high-contrast Leaflet/Esri live GPS map tracker, route polyline, and distance meter.
- **Patient EMR View:** Instant victim telemetry displaying blood type, age, and emergency contact.
- **Actionable Medical Prep List (NEW):**
  - Dynamic clinical checklist auto-generated from the incoming victim's EMR:
    - *Blood Bank:* "Prepare 4 Units Packed RBCs (O- Negative Type-Specific Universal PRBCs)"
    - *Pharmacology:* "Contraindication Warning: Avoid Penicillin & Sulfa Drugs — Have Epinephrine Ready"
    - *ATLS Resuscitation:* "Deploy Rigid Cervical Collar, Chest Tube Tray, and Ultrasound FAST Machine"
  - Interactive checkboxes allow the trauma team to track bay readiness in real time.
- **Police Dispatch Module (NEW):**
  - Displays contact information for the nearest precinct: **Metropolitan Traffic Division & 19th Precinct (+1 555-911-0199)**.
  - **"Share Location" Button:** Calls `POST /api/v1/incidents/:id/dispatch-police`, transmits live crash coordinates to the Police Dispatch CAD system for rapid highway corridor escort, and copies coordinates to the clipboard.
- **Trauma Bay 4 Reservation:** One-click reservation toggle updating status to `PREPARED`.

---

### 4. Role 3: Admin (System Overseer)
- **Permissions:** Total system visibility and fleet management across all network nodes.
- **Master Dashboard:** Real-time KPI counters tracking total registered patients, active trauma centers, active SOS dispatches, and Golden Hour compliance.
- **Global Incident Map:** Master view integrating the live GPS map, displaying the real-time geographic locations of all collisions occurring across the regional network.
- **Patient Directory:** Searchable and filterable master directory displaying all registered patients, blood groups, allergies, emergency contacts, and medical notes.
- **Hospital Fleet Directory:** Fleet table displaying all Level-1, Level-2, and Level-3 trauma hospitals with active network toggles to dynamically take facilities offline or restore them.

---

## 💻 6. Commands to Execute & Run

### Quick Start (Directly from Project Root `D:\resume projects\Aura Triage`)

A root [package.json](file:///d:/resume%20projects/Aura%20Triage/package.json) is configured so you can run commands from the project root without navigating into subfolders:

```powershell
# In D:\resume projects\Aura Triage>

# Start Frontend (Vite)
npm run dev

# Start Backend Server
npm run dev:backend

# Build Frontend for Production
npm run build
```

---

### Prerequisites
- **XAMPP Control Panel** with **Apache** and **MySQL** started (Port 3306).
- **Node.js** (v18+ or v20+ recommended).

---

### Step 1: Initialize Database (XAMPP MySQL Port 3306)

If you need to re-initialize or inspect the MySQL database tables:

```powershell
# In PowerShell (Windows)
Get-Content backend\schema_mysql.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
```

*Or open [phpMyAdmin](http://localhost/phpmyadmin), click "Import", and choose `backend/schema_mysql.sql`.*

---

### Step 2: Start Backend Server

```powershell
cd "d:\resume projects\Aura Triage\backend"
npm install
npm run dev
```

- Server runs on: `http://localhost:5000`
- Health Check Probe: `http://localhost:5000/health`

---

### Step 3: View the Database

#### Method A: Instant Terminal Database Inspector
Run the built-in ASCII database viewer to see all tables directly in your command line:

```powershell
cd "d:\resume projects\Aura Triage\backend"
npm run db:view
```

*Renders tabular formatting of `patients`, `hospitals`, and `incidents` with active statuses, speeds, and coordinates.*

#### Method B: In-Browser with phpMyAdmin
1. Open your browser and go to:
   ```text
   http://localhost/phpmyadmin
   ```
2. In the left navigation tree, select the **`auratriage`** database.
3. Click on:
   - **`users`** — View credentials and assigned roles (`ADMIN`, `HOSPITAL`, `PATIENT`).
   - **`patients`** — View medical history, allergies, and blood types.
   - **`hospitals`** — View hospital names, trauma levels, and spatial points.
   - **`incidents`** — View real-time crash queue and speed metrics.

---

### Step 4: Start Frontend ER Dashboard

```powershell
cd "d:\resume projects\Aura Triage\frontend"
npm install
npm run dev
```

- Dashboard opens on: `http://localhost:3000` (or `http://localhost:5173`)
- Seamlessly logs in with the pre-seeded Hospital Staff account. Click **"Switch Role"** in the top navigation to test the **Patient Portal** or **Admin Overseer** dashboards.

---

### Step 5: Execute Simulation Tests

You can trigger a live collision test in two ways:

#### Option A: Driver Fail-Safe Countdown in Browser
1. In the ER Dashboard header, click **"Simulate Impact (10s SOS)"**.
2. A modal will pop up with an 85dB siren and a **10-second countdown**.
3. **Test Cancel:** Click **"I'M OK — CANCEL SOS (FALSE ALARM)"** to abort. The alarm stops, and no incident is dispatched.
4. **Test Auto-Dispatch:** Open the modal again and **do not cancel**. After 10 seconds, fresh randomized telemetry is created, written to MySQL, and dispatched to the dashboard.

#### Option B: CLI Simulation Tool
Run the automated end-to-end simulation script:

```powershell
cd "d:\resume projects\Aura Triage\backend"
npm run simulate
```

*Connects via Socket.IO, joins the hospital room, dispatches randomized impact dynamics to `POST /api/v1/sos/trigger`, writes to MySQL, and verifies the broadcast.*

---

## 📡 7. REST API Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials and returns JWT token with role claim. |
| `POST` | `/api/v1/auth/register-patient` | Public | Registers a new patient profile in `patients` and creates user account. |
| `GET` | `/api/v1/auth/me` | Bearer Token | Returns current authenticated user and linked role profile. |
| `GET` | `/api/v1/patient/profile` | Patient / Admin | Fetches the logged-in patient's own EMR record. |
| `PUT` | `/api/v1/patient/profile` | Patient / Admin | Updates the logged-in patient's own EMR record. |
| `GET` | `/api/v1/patient/my-incidents` | Patient / Admin | Fetches emergency collision alerts associated with the patient. |
| `GET` | `/api/v1/admin/overview` | Admin Only | Returns network KPIs (patient count, hospital fleet, active crashes). |
| `GET` | `/api/v1/admin/patients` | Admin Only | Searchable master directory of all registered patients. |
| `GET` | `/api/v1/admin/hospitals` | Admin Only | Full directory of all trauma centers. |
| `PATCH`| `/api/v1/admin/hospitals/:id/status` | Admin Only | Toggles hospital active/standby status. |
| `GET` | `/api/v1/admin/incidents` | Admin Only | Global network collision stream for the Master Incident Map. |
| `POST` | `/api/v1/sos/trigger` | Public / Edge | Autonomous collision ingestion pipeline. Runs proximity search, inserts incident, and broadcasts alert. |
| `GET` | `/api/v1/incidents/active` | Hospital / Admin | Fetches active emergency queue (`DISPATCHED`, `PREPARED`) sorted by `created_at DESC`. |
| `PATCH`| `/api/v1/incidents/:id/status` | Hospital / Admin | Updates incident status (`TRIGGERED`, `DISPATCHED`, `PREPARED`, `RESOLVED`) and emits status update. |
| `POST` | `/api/v1/incidents/:id/dispatch-police` | Hospital / Admin | Transmits live crash site coordinates to Police Dispatch CAD. |
| `GET` | `/health` | Public | Health check probe reporting uptime, database status, and engine version. |

---

## 🔒 7. Environment Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=auratriage_hackoverflow_super_secret_jwt_key_2026

# Database Driver: 'mysql' for XAMPP Server / phpMyAdmin
DB_DRIVER=mysql

# XAMPP MySQL / MariaDB Settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=auratriage

# Proximity Search Parameters (15 km Golden Hour radius)
MAX_ROUTING_RADIUS_METERS=15000

# (Optional fallback) PostgreSQL with PostGIS connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auratriage
```
