# Abrar-system

# Abrar-Family-System
# 🏫 Sunday School Management System

## Complete Development Specification for Antigravity AI

---

## 📋 Project Summary

Create a complete, production-ready web application for managing Sunday School operations. This system will handle children (Makhdoumeen) profiles, class management, event organization (camps, trips), attendance tracking via QR codes, and team scoring. The application must feature a stunning futuristic liquid glass design and be fully responsive across all device sizes.

**Database:** Microsoft Access (.accdb file)

**Important Instructions for Antigravity:**
- Build everything from scratch including frontend, backend, and database
- Create all files, components, and database structures completely
- Do not use placeholder content or mock implementations
- Implement all features fully functional
- Generate all necessary code files
- Create the MS Access database with all tables, relationships, and queries

---

## 🗄️ Database: Microsoft Access

### Database File

**Filename:** `SundaySchool.accdb`

**Connection Method:** Use `node-adodb` package for Node.js to connect to MS Access database on Windows, or `msnodesqlv8` with ODBC driver.

### Database Tables

---

#### Table: Users

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| UserID | AutoNumber | Long Integer | PK | Primary key, auto-increment |
| Username | Short Text | 50 | Yes, Unique | Login username |
| Password | Short Text | 255 | Yes | Bcrypt hashed password |
| Role | Short Text | 20 | Yes | "Admin", "Amin", "Khadem" |
| FullName | Short Text | 100 | Yes | Display name |
| Email | Short Text | 100 | No | Email address |
| Phone | Short Text | 20 | No | Phone number |
| ProfilePhoto | Long Text | - | No | Base64 encoded image |
| IsActive | Yes/No | - | Yes | Default: Yes |
| LastLogin | Date/Time | - | No | Last login timestamp |
| CreatedAt | Date/Time | - | Yes | Creation timestamp |
| CreatedBy | Number | Long Integer | Yes | FK to Users.UserID |
| UpdatedAt | Date/Time | - | No | Last update timestamp |

**Indexes:**
- Primary Key: UserID
- Unique Index: Username

**Initial Data:**
```
UserID: 1
Username: admin
Password: [bcrypt hash of "admin123"]
Role: Admin
FullName: System Administrator
IsActive: Yes
CreatedAt: [current date/time]
CreatedBy: 1
```

---

#### Table: Classes

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| ClassID | AutoNumber | Long Integer | PK | Primary key |
| ClassName | Short Text | 100 | Yes | Class name |
| Description | Long Text | - | No | Class description |
| AgeGroup | Short Text | 20 | No | e.g., "6-7", "8-9" |
| Category | Short Text | 50 | No | Category grouping |
| TeamID | Number | Long Integer | No | FK to Teams.TeamID |
| ScheduleDay | Short Text | 20 | No | Day of week |
| ScheduleTime | Short Text | 20 | No | Time of class |
| Location | Short Text | 100 | No | Physical location |
| IsActive | Yes/No | - | Yes | Default: Yes |
| CreatedAt | Date/Time | - | Yes | Creation timestamp |
| CreatedBy | Number | Long Integer | Yes | FK to Users.UserID |
| UpdatedAt | Date/Time | - | No | Last update timestamp |

**Indexes:**
- Primary Key: ClassID
- Foreign Key: TeamID → Teams.TeamID
- Foreign Key: CreatedBy → Users.UserID

---

#### Table: ClassKhadems

Junction table for many-to-many relationship between Classes and Users (Khadems)

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| ClassKhademID | AutoNumber | Long Integer | PK | Primary key |
| ClassID | Number | Long Integer | Yes | FK to Classes.ClassID |
| UserID | Number | Long Integer | Yes | FK to Users.UserID |
| AssignedAt | Date/Time | - | Yes | Assignment timestamp |
| AssignedBy | Number | Long Integer | Yes | FK to Users.UserID |

**Indexes:**
- Primary Key: ClassKhademID
- Unique Composite Index: ClassID + UserID
- Foreign Key: ClassID → Classes.ClassID
- Foreign Key: UserID → Users.UserID

---

#### Table: Teams

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| TeamID | AutoNumber | Long Integer | PK | Primary key |
| TeamName | Short Text | 100 | Yes | Team name |
| PrimaryColor | Short Text | 10 | No | Hex color code |
| SecondaryColor | Short Text | 10 | No | Hex color code |
| Icon | Short Text | 50 | No | Icon identifier |
| Motto | Short Text | 255 | No | Team slogan |
| CreatedAt | Date/Time | - | Yes | Creation timestamp |
| CreatedBy | Number | Long Integer | Yes | FK to Users.UserID |

**Indexes:**
- Primary Key: TeamID

---

#### Table: Makhdoumeen

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| MakhdoumID | AutoNumber | Long Integer | PK | Primary key |
| MakhdoumCode | Short Text | 15 | Yes, Unique | Format: MKD-XXXXXX |
| FullName | Short Text | 100 | Yes | Child's full name |
| DateOfBirth | Date/Time | - | No | Birth date |
| Gender | Short Text | 10 | No | "Male", "Female" |
| Category | Short Text | 50 | No | Category classification |
| ClassID | Number | Long Integer | Yes | FK to Classes.ClassID |
| Street | Short Text | 255 | No | Street address |
| City | Short Text | 100 | No | City |
| Area | Short Text | 100 | No | Area/District |
| PostalCode | Short Text | 20 | No | Postal code |
| MotherName | Short Text | 100 | No | Mother's name |
| MotherPhone | Short Text | 20 | No | Mother's phone |
| FatherName | Short Text | 100 | No | Father's name |
| FatherPhone | Short Text | 20 | No | Father's phone |
| EmergencyContact | Short Text | 20 | No | Emergency phone |
| DiseasesAllergies | Long Text | - | No | Medical conditions |
| BloodType | Short Text | 5 | No | Blood type |
| Medications | Long Text | - | No | Current medications |
| SpecialNeeds | Long Text | - | No | Special requirements |
| Notes | Long Text | - | No | General notes |
| Photo | Long Text | - | No | Base64 encoded image |
| IsActive | Yes/No | - | Yes | Default: Yes |
| CreatedAt | Date/Time | - | Yes | Creation timestamp |
| CreatedBy | Number | Long Integer | Yes | FK to Users.UserID |
| UpdatedAt | Date/Time | - | No | Last update timestamp |
| UpdatedBy | Number | Long Integer | No | FK to Users.UserID |

**Indexes:**
- Primary Key: MakhdoumID
- Unique Index: MakhdoumCode
- Foreign Key: ClassID → Classes.ClassID

---

#### Table: Events

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| EventID | AutoNumber | Long Integer | PK | Primary key |
| EventName | Short Text | 100 | Yes | Event name |
| EventType | Short Text | 30 | Yes | "Camp", "Trip", "Retreat", "Conference", "Activity" |
| Description | Long Text | - | No | Event description |
| StartDate | Date/Time | - | Yes | Start date |
| EndDate | Date/Time | - | Yes | End date |
| StartTime | Short Text | 10 | No | Start time |
| EndTime | Short Text | 10 | No | End time |
| Location | Short Text | 255 | No | Location name |
| Address | Long Text | - | No | Full address |
| ManagerID | Number | Long Integer | No | FK to Users.UserID |
| Status | Short Text | 20 | Yes | "draft", "upcoming", "ongoing", "completed", "cancelled" |
| MaxCapacity | Number | Integer | No | Maximum participants |
| RegistrationDeadline | Date/Time | - | No | Deadline date |
| CreatedAt | Date/Time | - | Yes | Creation timestamp |
| CreatedBy | Number | Long Integer | Yes | FK to Users.UserID |
| UpdatedAt | Date/Time | - | No | Last update timestamp |

**Indexes:**
- Primary Key: EventID
- Foreign Key: ManagerID → Users.UserID

---

#### Table: EventTeams

Junction table for events and participating teams

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| EventTeamID | AutoNumber | Long Integer | PK | Primary key |
| EventID | Number | Long Integer | Yes | FK to Events.EventID |
| TeamID | Number | Long Integer | Yes | FK to Teams.TeamID |

**Indexes:**
- Primary Key: EventTeamID
- Unique Composite Index: EventID + TeamID

---

#### Table: Stations

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| StationID | AutoNumber | Long Integer | PK | Primary key |
| EventID | Number | Long Integer | Yes | FK to Events.EventID |
| StationName | Short Text | 100 | Yes | Station name |
| Description | Long Text | - | No | Station description |
| StationType | Short Text | 30 | Yes | "Scored", "Attendance", "Activity", "Checkpoint" |
| MaxScore | Number | Integer | No | Maximum possible score |
| MinScore | Number | Integer | No | Minimum score (default: 0) |
| Location | Short Text | 100 | No | Station location |
| StartTime | Short Text | 10 | No | Operating start time |
| EndTime | Short Text | 10 | No | Operating end time |
| IsActive | Yes/No | - | Yes | Default: Yes |
| CreatedAt | Date/Time | - | Yes | Creation timestamp |
| CreatedBy | Number | Long Integer | Yes | FK to Users.UserID |

**Indexes:**
- Primary Key: StationID
- Foreign Key: EventID → Events.EventID

---

#### Table: StationKhadems

Junction table for stations and assigned Khadems

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| StationKhademID | AutoNumber | Long Integer | PK | Primary key |
| StationID | Number | Long Integer | Yes | FK to Stations.StationID |
| UserID | Number | Long Integer | Yes | FK to Users.UserID |
| AssignedAt | Date/Time | - | Yes | Assignment timestamp |
| AssignedBy | Number | Long Integer | Yes | FK to Users.UserID |

**Indexes:**
- Primary Key: StationKhademID
- Unique Composite Index: StationID + UserID

---

#### Table: Registrations

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| RegistrationID | AutoNumber | Long Integer | PK | Primary key |
| EventID | Number | Long Integer | Yes | FK to Events.EventID |
| MakhdoumID | Number | Long Integer | Yes | FK to Makhdoumeen.MakhdoumID |
| ClassID | Number | Long Integer | Yes | FK to Classes.ClassID |
| TeamID | Number | Long Integer | No | FK to Teams.TeamID |
| RegisteredBy | Number | Long Integer | Yes | FK to Users.UserID |
| AccompanyingKhadem | Number | Long Integer | No | FK to Users.UserID |
| Status | Short Text | 20 | Yes | "pending", "confirmed", "cancelled", "attended" |
| CheckedIn | Yes/No | - | Yes | Default: No |
| CheckInTime | Date/Time | - | No | Check-in timestamp |
| Notes | Long Text | - | No | Registration notes |
| RegisteredAt | Date/Time | - | Yes | Registration timestamp |

**Indexes:**
- Primary Key: RegistrationID
- Unique Composite Index: EventID + MakhdoumID
- Foreign Key: EventID → Events.EventID
- Foreign Key: MakhdoumID → Makhdoumeen.MakhdoumID

---

#### Table: Attendance

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| AttendanceID | AutoNumber | Long Integer | PK | Primary key |
| EventID | Number | Long Integer | Yes | FK to Events.EventID |
| StationID | Number | Long Integer | Yes | FK to Stations.StationID |
| MakhdoumID | Number | Long Integer | Yes | FK to Makhdoumeen.MakhdoumID |
| TeamID | Number | Long Integer | No | FK to Teams.TeamID |
| ScanMethod | Short Text | 20 | Yes | "QR", "Manual", "Batch" |
| ScannedBy | Number | Long Integer | Yes | FK to Users.UserID |
| ScannedAt | Date/Time | - | Yes | Scan timestamp |
| Notes | Long Text | - | No | Attendance notes |

**Indexes:**
- Primary Key: AttendanceID
- Foreign Key: EventID → Events.EventID
- Foreign Key: StationID → Stations.StationID
- Foreign Key: MakhdoumID → Makhdoumeen.MakhdoumID

---

#### Table: Scores

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| ScoreID | AutoNumber | Long Integer | PK | Primary key |
| EventID | Number | Long Integer | Yes | FK to Events.EventID |
| StationID | Number | Long Integer | Yes | FK to Stations.StationID |
| TeamID | Number | Long Integer | Yes | FK to Teams.TeamID |
| Score | Number | Integer | Yes | Score value |
| MaxPossible | Number | Integer | No | Maximum possible |
| EnteredBy | Number | Long Integer | Yes | FK to Users.UserID |
| EnteredAt | Date/Time | - | Yes | Entry timestamp |
| ModifiedBy | Number | Long Integer | No | FK to Users.UserID |
| ModifiedAt | Date/Time | - | No | Modification timestamp |
| Notes | Long Text | - | No | Score notes |

**Indexes:**
- Primary Key: ScoreID
- Unique Composite Index: EventID + StationID + TeamID
- Foreign Key: EventID → Events.EventID
- Foreign Key: StationID → Stations.StationID
- Foreign Key: TeamID → Teams.TeamID

---

#### Table: Settings

| Column Name | Data Type | Size | Required | Description |
|-------------|-----------|------|----------|-------------|
| SettingID | AutoNumber | Long Integer | PK | Primary key |
| SettingKey | Short Text | 50 | Yes, Unique | Setting identifier |
| SettingValue | Long Text | - | No | Setting value |
| SettingGroup | Short Text | 50 | Yes | Group: "general", "idcard", "system" |
| UpdatedAt | Date/Time | - | No | Last update timestamp |
| UpdatedBy | Number | Long Integer | No | FK to Users.UserID |

**Initial Settings Data:**
```
SettingKey: churchName, SettingValue: "", SettingGroup: general
SettingKey: sundaySchoolName, SettingValue: "", SettingGroup: general
SettingKey: logo, SettingValue: "", SettingGroup: general
SettingKey: address, SettingValue: "", SettingGroup: general
SettingKey: phone, SettingValue: "", SettingGroup: general
SettingKey: email, SettingValue: "", SettingGroup: general
SettingKey: idCardTemplate, SettingValue: "default", SettingGroup: idcard
SettingKey: idCardShowPhoto, SettingValue: "true", SettingGroup: idcard
SettingKey: idCardShowQR, SettingValue: "true", SettingGroup: idcard
SettingKey: idCardShowClass, SettingValue: "true", SettingGroup: idcard
SettingKey: idCardShowKhadems, SettingValue: "true", SettingGroup: idcard
SettingKey: idCardBgColor, SettingValue: "#0A0A0F", SettingGroup: idcard
SettingKey: idCardAccentColor, SettingValue: "#00D4FF", SettingGroup: idcard
SettingKey: idPrefix, SettingValue: "MKD", SettingGroup: system
SettingKey: idLength, SettingValue: "6", SettingGroup: system
SettingKey: sessionTimeout, SettingValue: "3600", SettingGroup: system
SettingKey: maxLoginAttempts, SettingValue: "5", SettingGroup: system
```

---

### Database Relationships Diagram

```
Users (1) ────────────< ClassKhadems >──────────── (M) Classes
  │                                                      │
  │                                                      │
  │ (1)                                             (1)  │
  │                                                      │
  └──────────< Makhdoumeen >─────────────────────────────┘
                    │
                    │ (M)
                    │
              Registrations >──────────────< Events
                    │                           │
                    │                           │
                    │                      EventTeams >───< Teams
                    │                           │            │
                    │                           │            │
                    │                      Stations          │
                    │                           │            │
                    │                           │            │
                    │                    StationKhadems      │
                    │                           │            │
                    │                           │            │
              Attendance >──────────────────────┘            │
                    │                                        │
                    │                                        │
              Scores >───────────────────────────────────────┘
```

---

### Database Queries to Create

#### Query: GetMakhdoumWithClass

```sql
SELECT 
    m.MakhdoumID,
    m.MakhdoumCode,
    m.FullName,
    m.DateOfBirth,
    m.Gender,
    m.Category,
    m.DiseasesAllergies,
    m.Photo,
    m.IsActive,
    c.ClassID,
    c.ClassName,
    t.TeamID,
    t.TeamName,
    t.PrimaryColor
FROM Makhdoumeen m
INNER JOIN Classes c ON m.ClassID = c.ClassID
LEFT JOIN Teams t ON c.TeamID = t.TeamID
WHERE m.IsActive = True
ORDER BY m.FullName;
```

#### Query: GetClassKhadems

```sql
SELECT 
    c.ClassID,
    c.ClassName,
    u.UserID,
    u.FullName AS KhademName,
    u.Phone AS KhademPhone
FROM Classes c
INNER JOIN ClassKhadems ck ON c.ClassID = ck.ClassID
INNER JOIN Users u ON ck.UserID = u.UserID
WHERE u.IsActive = True
ORDER BY c.ClassName, u.FullName;
```

#### Query: GetEventRegistrations

```sql
SELECT 
    r.RegistrationID,
    r.EventID,
    r.Status,
    r.CheckedIn,
    m.MakhdoumID,
    m.MakhdoumCode,
    m.FullName AS MakhdoumName,
    m.DiseasesAllergies,
    c.ClassID,
    c.ClassName,
    t.TeamID,
    t.TeamName,
    t.PrimaryColor,
    u.FullName AS RegisteredByName
FROM Registrations r
INNER JOIN Makhdoumeen m ON r.MakhdoumID = m.MakhdoumID
INNER JOIN Classes c ON r.ClassID = c.ClassID
LEFT JOIN Teams t ON r.TeamID = t.TeamID
INNER JOIN Users u ON r.RegisteredBy = u.UserID
ORDER BY c.ClassName, m.FullName;
```

#### Query: GetEventLeaderboard

```sql
SELECT 
    t.TeamID,
    t.TeamName,
    t.PrimaryColor,
    SUM(s.Score) AS TotalScore
FROM Scores s
INNER JOIN Teams t ON s.TeamID = t.TeamID
WHERE s.EventID = [EventID Parameter]
GROUP BY t.TeamID, t.TeamName, t.PrimaryColor
ORDER BY SUM(s.Score) DESC;
```

#### Query: GetStationScores

```sql
SELECT 
    s.ScoreID,
    s.Score,
    s.MaxPossible,
    s.EnteredAt,
    st.StationID,
    st.StationName,
    t.TeamID,
    t.TeamName,
    t.PrimaryColor,
    u.FullName AS EnteredByName
FROM Scores s
INNER JOIN Stations st ON s.StationID = st.StationID
INNER JOIN Teams t ON s.TeamID = t.TeamID
INNER JOIN Users u ON s.EnteredBy = u.UserID
WHERE s.EventID = [EventID Parameter]
ORDER BY st.StationName, t.TeamName;
```

#### Query: GetUserAssignedClasses

```sql
SELECT 
    c.ClassID,
    c.ClassName,
    c.AgeGroup,
    c.Category,
    t.TeamName,
    t.PrimaryColor,
    (SELECT COUNT(*) FROM Makhdoumeen m WHERE m.ClassID = c.ClassID AND m.IsActive = True) AS MakhdoumCount
FROM Classes c
INNER JOIN ClassKhadems ck ON c.ClassID = ck.ClassID
LEFT JOIN Teams t ON c.TeamID = t.TeamID
WHERE ck.UserID = [UserID Parameter] AND c.IsActive = True
ORDER BY c.ClassName;
```

#### Query: GenerateNextMakhdoumCode

```sql
SELECT TOP 1 
    MakhdoumCode
FROM Makhdoumeen
ORDER BY MakhdoumID DESC;
```

---

## 🎨 Design Requirements

### Visual Theme: Futuristic Liquid Glass

**Primary Characteristics:**
- Glassmorphic cards with backdrop blur effects (blur 20px+)
- Semi-transparent backgrounds using rgba values
- Subtle gradient overlays and borders
- Neon accent glows on interactive elements
- Smooth animations on all interactions
- Floating elements with layered shadows
- Dark background with ambient color gradients
- Particle effects or subtle animated backgrounds on key pages

**Color System:**

| Name | Hex | Usage |
|------|-----|-------|
| Primary Cyan | #00D4FF | Buttons, links, primary actions |
| Secondary Purple | #8B5CF6 | Gradients, secondary elements |
| Accent Magenta | #D946EF | Highlights, notifications |
| Success Green | #10B981 | Success states, confirmations |
| Warning Amber | #F59E0B | Warnings, pending states |
| Error Red | #EF4444 | Errors, destructive actions |
| Background | #0A0A0F | Main app background |
| Glass White | rgba(255,255,255,0.05) | Card backgrounds |
| Glass Border | rgba(255,255,255,0.1) | Card borders |
| Text Primary | #FFFFFF | Main text |
| Text Secondary | #9CA3AF | Secondary text |

**Typography:**
- Primary Font: Inter or Space Grotesk
- Monospace Font: JetBrains Mono (for IDs and codes)
- Headings: Bold weight with subtle glow effects
- Body: Regular weight with high readability

**Animation Guidelines:**
- Page transitions: 300ms fade and slide
- Hover effects: 200ms scale and glow
- Loading states: Shimmer skeleton effect
- Modals: Scale from center with backdrop blur
- Buttons: Pulse glow on hover
- Cards: Lift and border glow on hover

---

## 👥 User Roles and Permissions

### Role 1: Admin (Full System Control)

**User Management:**
- Create new user accounts (Admin, Amin, Khadem)
- Edit any user account details
- Deactivate or reactivate user accounts
- Assign roles to users
- Reset user passwords
- Assign Khadems to specific classes

**Technical Access:**
- Access system settings
- Configure application parameters
- Database management access
- View system logs
- Backup and restore data

**Content Management:**
- Full access to all classes (create, read, update, delete)
- Full access to all teams (create, read, update, delete)
- Full access to all events (create, read, update, delete)
- Full access to all Makhdoumeen (create, read, update, delete)
- Create and manage stations for events
- Assign event managers
- Assign station Khadems

**Reports:**
- Generate any report
- Export all data
- View all statistics

---

### Role 2: Amin (Full Operational Access, No Technical Control)

**User Management:**
- ❌ Cannot create user accounts
- ❌ Cannot edit user accounts
- ❌ Cannot delete or deactivate users
- ❌ Cannot assign roles
- ✅ Can view all users list

**Technical Access:**
- ❌ Cannot access system settings
- ❌ Cannot configure application parameters
- ❌ Cannot manage database
- ❌ Cannot view system logs

**Content Management:**
- ✅ View all classes
- ✅ Create new classes
- ✅ Edit class details
- ✅ Assign Khadems to classes
- ✅ View all teams
- ✅ Create new teams
- ✅ Edit team details
- ✅ Assign classes to teams
- ✅ View all events
- ✅ Edit event details
- ✅ Manage event registrations
- ✅ Create stations for events
- ✅ Assign Khadems to stations
- ✅ View all Makhdoumeen
- ✅ Create new Makhdoumeen
- ✅ Edit any Makhdoum profile
- ✅ Download ID cards for any Makhdoum
- ✅ View all attendance records
- ✅ View all team scores
- ✅ Manage team assignments

**Reports:**
- ✅ Generate all reports
- ✅ Export data
- ✅ View all statistics

---

### Role 3: Khadem (Class-Limited Access)

**Access Scope:** Only their assigned class(es)

**Class Access:**
- ✅ View their assigned class only
- ❌ Cannot view other classes
- ❌ Cannot create or edit classes

**Makhdoumeen Access:**
- ✅ View Makhdoumeen in their class only
- ✅ Create new Makhdoum in their class
- ✅ Edit Makhdoum profiles in their class
- ✅ Download ID cards for their class
- ✅ Generate reports for their class
- ❌ Cannot access other classes' Makhdoumeen

**Event Access:**
- ✅ View all events
- ✅ Register their class children to events
- ✅ View their class registrations only
- ❌ Cannot view other classes' registrations
- ❌ Cannot create or edit events

**Teams:**
- ✅ View their class team assignment
- ❌ Cannot manage teams

---

### Role 4: Camp/Event Manager (Temporary Event Role)

**Granted by:** Admin only
**Scope:** Specific event only

**Permissions within assigned event:**
- ✅ View all classes participating in event
- ✅ View all registered Makhdoumeen
- ✅ Create new stations
- ✅ Edit stations
- ✅ Delete stations
- ✅ Assign Khadems to stations
- ✅ Manage team assignments
- ✅ Change which classes belong to which teams
- ✅ View all attendance records
- ✅ View and edit all team scores
- ✅ Access event dashboard with full statistics

---

### Role 5: Station Khadem (Temporary Event Role)

**Granted by:** Admin or Event Manager
**Scope:** Assigned station(s) only

**Permissions within assigned station(s):**
- ✅ Access their assigned station dashboard
- ✅ Scan QR codes for attendance
- ✅ Enter manual attendance
- ✅ Enter team scores
- ✅ View team standings
- ❌ Cannot access other stations
- ❌ Cannot modify station settings

---

## 📄 Application Pages

### Page 1: Login Page

**Route:** `/login`

**Design:**
- Centered glassmorphic card on animated background
- Floating particles or gradient animation behind
- Church/Sunday School logo at top
- Neon glow effects on focus

**Elements:**
- Logo and app name
- Username input field with user icon
- Password input field with lock icon and show/hide toggle
- Remember me checkbox
- Login button with loading state
- Error message display area with shake animation

**Functionality:**
- Validate credentials against Users table
- Generate JWT token on success
- Store token in httpOnly cookie
- Redirect based on user role:
  - Admin → Admin Dashboard
  - Amin → Amin Dashboard
  - Khadem → Khadem Dashboard
- Show error for invalid credentials
- Track failed login attempts
- Update LastLogin field on successful login

---

### Page 2: Dashboard

**Route:** `/dashboard`

**Design:**
- Glassmorphic stat cards in grid layout
- Gradient backgrounds on cards
- Animated counters for statistics
- Recent activity feed with timeline design

**Admin Dashboard Content:**
- Welcome message with user name
- Stat cards:
  - Total Users (with role breakdown)
  - Total Classes
  - Total Makhdoumeen
  - Active Events
  - Upcoming Events
- Quick action buttons:
  - Create New User
  - Create New Class
  - Create New Event
  - Add Makhdoum
- Upcoming events list with countdown
- Recent activity feed
- System health indicators

**Amin Dashboard Content:**
- Welcome message
- Stat cards:
  - Total Classes
  - Total Makhdoumeen
  - Active Events
  - Pending Registrations
- Quick action buttons:
  - Create New Class
  - Add Makhdoum
  - View Events
- Upcoming events list
- Recent registrations
- Quick links to reports

**Khadem Dashboard Content:**
- Welcome message
- My Class card showing:
  - Class name
  - Number of Makhdoumeen
  - Team assignment
  - Other Khadems in class
- Stat cards:
  - My Makhdoumeen count
  - Registered for upcoming events
- Quick action buttons:
  - View My Class
  - Add Makhdoum
  - Register to Event
- Upcoming events relevant to their class
- Recent Makhdoumeen added

---

### Page 3: User Management (Admin Only)

**Route:** `/users`

**Design:**
- Data table with glassmorphic styling
- Avatar display for each user
- Role badges with colors
- Status indicators (active/inactive)

**Elements:**
- Page header with "Users" title
- Add New User button
- Search input for name/username
- Filter dropdown for role
- Filter dropdown for status
- Users table with columns:
  - Avatar and Name
  - Username
  - Role (with colored badge)
  - Assigned Classes (for Khadem)
  - Status
  - Last Login
  - Actions (Edit, Deactivate)
- Pagination controls

**Create/Edit User Modal:**
- Full name input
- Username input (unique validation)
- Email input
- Phone input
- Role dropdown (Admin, Amin, Khadem)
- Password field (required for create, optional for edit)
- Profile photo upload
- Assigned classes multi-select (shown only for Khadem role)
- Active status toggle
- Save and Cancel buttons

**Functionality:**
- CRUD operations on Users table
- Password hashing before save
- Unique username validation
- Insert/Update ClassKhadems for Khadem role
- Cannot delete, only deactivate (set IsActive = False)

---

### Page 4: Classes Page

**Route:** `/classes`

**Design:**
- Card grid layout
- Each card shows class info with team color accent
- Hover effects with glow

**Elements:**
- Page header with "Classes" title
- Add New Class button (Admin/Amin only)
- Search input
- Filter by category
- Filter by team
- View toggle (Grid/List)
- Class cards showing:
  - Class name
  - Age group badge
  - Category
  - Number of Makhdoumeen
  - Assigned Khadems (avatars)
  - Team color indicator
  - Quick actions (View, Edit, Delete)

**Create/Edit Class Modal:**
- Class name input
- Description textarea
- Age group input
- Category dropdown
- Location input
- Schedule day dropdown
- Schedule time input
- Assign Khadems multi-select
- Assign Team dropdown
- Active status toggle
- Save and Cancel buttons

**Class Detail View:**
- Full class information
- List of assigned Khadems with profiles
- List of Makhdoumeen in class
- Team information
- Quick link to add Makhdoum
- Edit and Delete buttons

**Access Control:**
- Admin: Full access to all classes
- Amin: Full access to all classes
- Khadem: View only their assigned class(es) via ClassKhadems table

---

### Page 5: Teams Page

**Route:** `/teams`

**Design:**
- Horizontal cards with team branding colors
- Visual team identity display
- Leaderboard style for scores

**Elements:**
- Page header with "Teams" title
- Add New Team button (Admin/Amin only)
- Team cards showing:
  - Team color bar/gradient
  - Team name
  - Team motto
  - Icon
  - Number of classes assigned
  - Total members count
  - Quick actions

**Create/Edit Team Modal:**
- Team name input
- Primary color picker
- Secondary color picker
- Icon selector
- Motto input
- Assign classes multi-select
- Save and Cancel buttons

**Team Detail View:**
- Full team branding display
- List of assigned classes
- List of all team members
- Score history (from events)
- Edit button

---

### Page 6: Makhdoumeen List Page

**Route:** `/makhdoumeen`

**Design:**
- Toggleable Grid/Table view
- Profile cards with photos
- QR code preview on hover
- Medical alerts highlighted

**Elements:**
- Page header with "Makhdoumeen" title
- Add New Makhdoum button
- Search input (searches name and MakhdoumCode)
- Filter by class dropdown
- Filter by category dropdown
- Filter by team dropdown
- Sort dropdown (Name, ID, Date Added)
- View toggle (Grid/Table)
- Pagination controls

**Grid View Card:**
- Photo or avatar placeholder
- Full name
- MakhdoumCode badge
- Class name
- Team color indicator
- Medical alert icon (if has DiseasesAllergies)
- Quick action buttons (View, Edit, ID Card)

**Table View Columns:**
- Photo thumbnail
- MakhdoumCode
- Full Name
- Class
- Team
- Category
- Medical Alert indicator
- Actions

**Access Control:**
- Admin/Amin: View all Makhdoumeen
- Khadem: View only Makhdoumeen in their assigned classes

---

### Page 7: Makhdoum Profile Page

**Route:** `/makhdoumeen/:id`

**Design:**
- Large profile card layout
- Prominent QR code display
- Medical information highlighted with warning styling
- Section cards for different info groups

**Layout Sections:**

**Header Section:**
- Large photo display
- Full name
- MakhdoumCode badge
- Class and Team badges
- Action buttons row:
  - Edit Profile
  - Download ID Card
  - Download Report

**QR Code Section:**
- Large QR code display (encodes MakhdoumCode)
- MakhdoumCode text below QR
- Download QR button

**Personal Information Section:**
- Date of birth
- Gender
- Category

**Contact Information Section:**
- Full address (Street, Area, City)
- Mother's name and phone (clickable)
- Father's name and phone (clickable)
- Emergency contact (clickable)

**Medical Information Section (Highlighted):**
- Warning icon and styling
- Diseases/Allergies (prominent display)
- Blood type
- Current medications
- Special needs

**Class Information Section:**
- Class name with link
- Team assignment
- All Khadems in class (from ClassKhadems join)

**Notes Section:**
- General notes text

**Event History Section:**
- List of events attended (from Registrations table)
- Registration history

---

### Page 8: ID Card Generator

**Accessed from:** Makhdoum profile page

**ID Card Design (Downloadable):**
- Futuristic glassmorphic card design
- Church/Sunday School branding (from Settings)
- Photo area
- Full name (large)
- Class name
- MakhdoumCode
- QR code (encodes MakhdoumCode)
- List of Khadems (from ClassKhadems)
- Gradient background matching app theme
- Print-ready dimensions (standard ID card size)

**Download Options:**
- Download as PNG (high resolution)
- Download as PDF
- Print directly

---

### Page 9: Events Page

**Route:** `/events`

**Design:**
- Event cards with type badges
- Status indicators with colors
- Countdown timers for upcoming events
- Progress bars for registration capacity

**Elements:**
- Page header with "Events" title
- Add New Event button (Admin only)
- Tabs or filters: All, Upcoming, Ongoing, Past
- Filter by type dropdown
- Event cards showing:
  - Event name
  - Type badge (Camp, Trip, etc.)
  - Date range
  - Location
  - Status badge
  - Registration count / MaxCapacity
  - RegistrationDeadline
  - Manager assigned (if any)
  - Quick actions

**Create Event Form (Admin Only):**
- Event name input
- Event type dropdown
- Description textarea
- Start date picker
- End date picker
- Start time input
- End time input
- Location input
- Full address input
- Maximum capacity input
- Registration deadline date picker
- Select participating teams multi-select (inserts into EventTeams)
- Status dropdown
- Save as Draft / Publish buttons

---

### Page 10: Event Detail Page

**Route:** `/events/:id`

**Design:**
- Event header with key info
- Tab navigation for sections
- Statistics cards
- Registration list with filters

**Tabs/Sections:**

**Overview Tab:**
- Event details card
- Statistics cards:
  - Total registered (from Registrations)
  - By class breakdown
  - By team breakdown
- Manager information
- Quick actions

**Registrations Tab:**
- List of all registered Makhdoumeen (from GetEventRegistrations query)
- Search and filter options
- Filter by class
- Filter by team
- Show: Name, MakhdoumCode, QR, Class, Team, DiseasesAllergies, Registered By
- Check-in status
- Export list button

**Stations Tab:**
- List of stations (from Stations table where EventID matches)
- Add Station button (Admin/Manager)
- Station cards with assigned Khadems (from StationKhadems)
- Quick access to station management

**Teams Tab:**
- Team standings/leaderboard (from GetEventLeaderboard query)
- Score breakdown by station
- Team member lists

**Attendance Tab:**
- Overall attendance statistics
- Attendance by station (from Attendance table)
- Export attendance report

**Manager Assignment (Admin Only):**
- Assign Manager button
- Select Khadem dropdown
- Updates Events.ManagerID

**Registration Flow (For Khadem):**
- "Register My Class" button
- Shows list of their class Makhdoumeen
- Checkbox selection for each child
- Khadem confirms themselves as accompanying
- On submit, for each selected Makhdoum:
  - Insert into Registrations table
  - Copy ClassID, TeamID from Makhdoum's class
  - Set RegisteredBy and AccompanyingKhadem

---

### Page 11: Stations Management

**Route:** `/events/:id/stations`

**Design:**
- Station cards in grid
- Color coding by station type
- Assignment indicators

**Elements:**
- Page header with event name and "Stations"
- Add Station button (Admin/Manager)
- Station cards showing:
  - Station name
  - Type badge
  - Location
  - Schedule
  - Max score (if scored type)
  - Assigned Khadems
  - Quick actions

**Create/Edit Station Modal:**
- Station name input
- Station type dropdown (Scored, Attendance, Activity, Checkpoint)
- Description textarea
- Location input
- Start time input
- End time input
- Max score input (shown for Scored type)
- Assign Khadems multi-select (inserts into StationKhadems)
- Active toggle
- Save and Cancel buttons

---

### Page 12: Station Khadem View

**Route:** `/events/:eventId/stations/:stationId`

**Design:**
- Action-focused interface
- Large buttons for quick actions
- QR scanner prominent
- Real-time score display

**Elements:**
- Station name header
- QR Scanner section:
  - Large camera viewfinder
  - Scan button
  - Flash toggle
  - Last scan feedback
- Manual Entry section:
  - Search/select Makhdoum
  - Submit attendance button (inserts into Attendance table)
- Score Entry section:
  - Select team dropdown
  - Score input (with max validation)
  - Notes input
  - Submit score button (inserts into Scores table)
- Recent Activity:
  - Last 10 scans
  - Recent scores entered
- Team Standings:
  - Current scores for all teams at this station

---

### Page 13: QR Scanner Page

**Route:** `/scan` or modal overlay

**Design:**
- Full-screen camera view option
- Scanning overlay with targeting box
- Success/error animations
- Sound and vibration feedback

**Elements:**
- Camera viewfinder
- Targeting box overlay
- Station selector (if user has multiple stations)
- Flash toggle button
- Switch camera button
- Manual entry link
- Recent scans list
- Close/back button

**Functionality:**
- Access device camera
- Detect and decode QR codes (contains MakhdoumCode)
- Look up MakhdoumID from MakhdoumCode
- Validate against Registrations for this event
- Insert into Attendance table
- Show success animation and makhdoum name
- Show error if not registered or already scanned
- Support for continuous scanning mode

---

### Page 14: Leaderboard Page

**Route:** `/events/:id/leaderboard`

**Design:**
- Podium style for top 3
- Animated score bars
- Team colors throughout
- Live update capability

**Elements:**
- Event name header
- Top 3 teams podium display
- Full standings table (from GetEventLeaderboard query):
  - Rank
  - Team name and color
  - Total score
  - Score breakdown by station
- Filter by station
- Refresh button
- Auto-refresh toggle

---

### Page 15: Reports Page

**Route:** `/reports`

**Design:**
- Report type cards
- Preview capability
- Export options prominent

**Available Reports:**

**Makhdoum Individual Report:**
- Select Makhdoum
- Shows full profile from Makhdoumeen table
- Attendance history from Attendance table
- Event participation from Registrations table
- Download as PDF

**Class Report:**
- Select class
- All Makhdoumeen in class
- Attendance statistics
- Download as PDF or Excel

**Event Report:**
- Select event
- Registration summary
- Attendance summary
- Team scores from Scores table
- Station results
- Download as PDF or Excel

**Attendance Report:**
- Select date range
- Filter by class/event
- Detailed attendance records
- Download as PDF or Excel

---

### Page 16: Settings Page (Admin Only)

**Route:** `/settings`

**Design:**
- Tabbed sections
- Form-based settings
- Save confirmation

**Sections:**

**General Settings:**
- Church name
- Sunday School name
- Logo upload
- Address
- Contact phone
- Contact email

**ID Card Settings:**
- Template selection
- Show/hide photo toggle
- Show/hide QR toggle
- Show/hide class toggle
- Show/hide Khadems toggle
- Background color picker
- Accent color picker
- Preview ID card

**System Settings:**
- ID prefix (default: MKD)
- ID number length (default: 6)
- Session timeout duration
- Max login attempts

**All settings stored in Settings table with key-value pairs**

---

## 🔧 Core Features to Implement

### 1. Auto MakhdoumCode Generation

When creating a new Makhdoum:
- Query: Get highest MakhdoumCode from Makhdoumeen table
- Parse the numeric portion
- Increment by 1
- Format as: MKD-XXXXXX (6 digits, zero-padded)
- Insert into MakhdoumCode field

```
Example progression:
MKD-000001
MKD-000002
MKD-000003
...
```

### 2. QR Code Generation

When displaying Makhdoum profile or ID card:
- Generate QR code containing the MakhdoumCode
- Use react-qr-code library
- Display on profile page
- Include in ID card
- Make QR downloadable separately

### 3. QR Code Scanning

Implement QR scanner that:
- Accesses device camera
- Detects QR codes in view
- Decodes the MakhdoumCode
- Queries Makhdoumeen table to find MakhdoumID
- Validates against Registrations for current event
- Inserts into Attendance table
- Provides visual and audio feedback
- Falls back to manual entry

### 4. ID Card Generation

Create downloadable ID card with:
- Consistent futuristic design
- Church branding from Settings table
- Makhdoum photo from Makhdoumeen.Photo
- Full name
- Class name from joined Classes table
- MakhdoumCode
- QR code encoding MakhdoumCode
- List of class Khadems from ClassKhadems join
- Export as PNG and PDF

### 5. Report Generation

Implement report generator that:
- Queries appropriate tables based on report type
- Formats into professional layout
- Includes church branding from Settings
- Supports PDF export using jsPDF
- Supports Excel export using xlsx
- Handles large datasets with pagination

### 6. Role-Based Access Control

Implement permission system that:
- Checks user role from Users table on every route
- For Khadem: queries ClassKhadems to get allowed ClassIDs
- Filters all data queries by allowed ClassIDs for Khadem
- Hides unauthorized UI elements
- Returns 403 for unauthorized API access
- Checks ManagerID for event manager permissions
- Checks StationKhadems for station permissions

### 7. Event Registration Flow

When Khadem registers their class:
1. Query Makhdoumeen WHERE ClassID IN (Khadem's assigned classes)
2. Display list with checkboxes
3. On submit, for each selected Makhdoum:
   - INSERT INTO Registrations:
     - EventID
     - MakhdoumID
     - ClassID (from Makhdoum)
     - TeamID (from Class)
     - RegisteredBy (current user)
     - AccompanyingKhadem (current user)
     - Status = "confirmed"
     - RegisteredAt = Now()

### 8. Team Score Management

For events with teams:
- Station Khadems INSERT into Scores table
- Scores linked to EventID, StationID, TeamID
- Event Manager can UPDATE any score
- Leaderboard queries SUM(Score) GROUP BY TeamID
- Real-time updates via periodic refresh or websockets

---

## 🛠️ Technical Requirements

### Frontend Stack

| Package | Purpose |
|---------|---------|
| React 18+ | UI Framework |
| React Router v6 | Navigation |
| Context API or Redux Toolkit | State Management |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Hook Form | Form Handling |
| Zod | Validation |
| Axios | API Calls |
| react-qr-code | QR Generation |
| html5-qrcode | QR Scanning |
| jsPDF | PDF Generation |
| html2canvas | Screenshot for ID Cards |
| xlsx | Excel Export |
| date-fns | Date Formatting |
| React Icons | Iconography |

### Backend Stack

| Package | Purpose |
|---------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| node-adodb | MS Access Connection (Windows) |
| msnodesqlv8 | ODBC Driver Alternative |
| bcryptjs | Password Hashing |
| jsonwebtoken | JWT Authentication |
| cors | Cross-Origin Requests |
| helmet | Security Headers |
| express-validator | Input Validation |
| multer | File Uploads |

### Database Connection

**For Windows Environment using node-adodb:**

```javascript
const ADODB = require('node-adodb');
const connection = ADODB.open(
  'Provider=Microsoft.ACE.OLEDB.12.0;Data Source=./database/SundaySchool.accdb;'
);
```

**Requirements:**
- Microsoft Access Database Engine 2010 or later installed
- Windows operating system
- 32-bit or 64-bit matching between Node.js and Access driver

### API Structure

| Endpoint Group | Base Path |
|----------------|-----------|
| Authentication | /api/auth |
| Users | /api/users |
| Classes | /api/classes |
| Teams | /api/teams |
| Makhdoumeen | /api/makhdoumeen |
| Events | /api/events |
| Stations | /api/stations |
| Attendance | /api/attendance |
| Scores | /api/scores |
| Reports | /api/reports |
| Settings | /api/settings |

---

## 📱 Responsive Design Requirements

### Breakpoints

| Name | Size | Target |
|------|------|--------|
| xs | 320px+ | Small phones |
| sm | 480px+ | Large phones |
| md | 768px+ | Tablets |
| lg | 1024px+ | Laptops |
| xl | 1280px+ | Desktops |
| 2xl | 1536px+ | Large desktops |

### Layout Adaptations

**Navigation:**
- Mobile: Bottom navigation bar or hamburger menu
- Tablet: Collapsible sidebar
- Desktop: Full sidebar with labels

**Card Grids:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

**Data Tables:**
- Mobile: Card-based layout or horizontal scroll
- Desktop: Full table display

**Forms:**
- Mobile: Single column, stacked fields
- Desktop: Multi-column layouts

**Modals:**
- Mobile: Full screen or bottom sheet
- Desktop: Centered modal with backdrop

---

## 🔐 Security Requirements

### Authentication
- JWT tokens with expiration
- Secure token storage (httpOnly cookies)
- Session timeout after inactivity
- Logout clears all tokens
- Update LastLogin on successful login

### Password Security
- Bcrypt hashing with 10+ salt rounds
- Minimum password requirements
- No plain text storage

### Authorization
- Verify role on every API request
- Query ClassKhadems for Khadem permissions
- Query StationKhadems for station permissions
- Check ManagerID for event manager permissions
- Return 403 for unauthorized access

### Input Validation
- Validate all inputs server-side
- Sanitize data before SQL queries
- Use parameterized queries to prevent SQL injection
- Validate file uploads

---

## 📁 Complete Project Structure

```
sunday-school-app/
│
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Tabs.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── Toggle.jsx
│   │   │   │   ├── DatePicker.jsx
│   │   │   │   ├── ColorPicker.jsx
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── MobileNav.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   └── Footer.jsx
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── users/
│   │   │   │   ├── classes/
│   │   │   │   ├── teams/
│   │   │   │   ├── makhdoumeen/
│   │   │   │   ├── events/
│   │   │   │   ├── stations/
│   │   │   │   ├── attendance/
│   │   │   │   ├── scores/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   └── common/
│   │   │       ├── SearchBar.jsx
│   │   │       ├── FilterPanel.jsx
│   │   │       ├── Pagination.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       └── ErrorBoundary.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Classes.jsx
│   │   │   ├── ClassDetail.jsx
│   │   │   ├── Teams.jsx
│   │   │   ├── TeamDetail.jsx
│   │   │   ├── Makhdoumeen.jsx
│   │   │   ├── MakhdoumProfile.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   ├── Stations.jsx
│   │   │   ├── StationView.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── AppContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── usePermissions.js
│   │   │   └── useToast.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── users.service.js
│   │   │   ├── classes.service.js
│   │   │   ├── teams.service.js
│   │   │   ├── makhdoumeen.service.js
│   │   │   ├── events.service.js
│   │   │   ├── stations.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── scores.service.js
│   │   │   └── reports.service.js
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   └── permissions.js
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── glass.css
│   │   │   └── animations.css
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── routes.jsx
│   │
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── database/
│   │   └── SundaySchool.accdb
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── classes.routes.js
│   │   ├── teams.routes.js
│   │   ├── makhdoumeen.routes.js
│   │   ├── events.routes.js
│   │   ├── stations.routes.js
│   │   ├── attendance.routes.js
│   │   ├── scores.routes.js
│   │   ├── reports.routes.js
│   │   └── settings.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── classes.controller.js
│   │   ├── teams.controller.js
│   │   ├── makhdoumeen.controller.js
│   │   ├── events.controller.js
│   │   ├── stations.controller.js
│   │   ├── attendance.controller.js
│   │   ├── scores.controller.js
│   │   ├── reports.controller.js
│   │   └── settings.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── services/
│   │   ├── database.service.js
│   │   ├── id.service.js
│   │   ├── qr.service.js
│   │   └── report.service.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── config/
│   │   └── index.js
│   │
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Initialization Requirements

### Initial Database Setup

Create `SundaySchool.accdb` file with:

1. All tables as defined above with proper data types
2. All relationships between tables
3. All indexes (Primary Keys, Foreign Keys, Unique)
4. Initial Admin user record:
   - UserID: 1
   - Username: admin
   - Password: [bcrypt hash of "admin123"]
   - Role: Admin
   - FullName: System Administrator
   - IsActive: Yes
   - CreatedAt: [current timestamp]
   - CreatedBy: 1

5. Initial Settings records as defined above

### Environment Variables

Create `.env.example`:

```
PORT=5000
DB_PATH=./database/SundaySchool.accdb
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

---

## ✅ Final Checklist for Antigravity

Build this complete application ensuring:

1. ☐ MS Access database file created with all tables and relationships
2. ☐ All initial data inserted (Admin user, Settings)
3. ☐ All frontend components built with liquid glass design
4. ☐ All pages implemented with full functionality
5. ☐ All API endpoints working with MS Access queries
6. ☐ Authentication and authorization fully implemented
7. ☐ Role-based access control using ClassKhadems and StationKhadems tables
8. ☐ QR code generation working for all Makhdoumeen
9. ☐ QR scanner functional with camera access
10. ☐ ID card generator producing downloadable cards
11. ☐ All reports exportable as PDF and Excel
12. ☐ Responsive design working on all screen sizes
13. ☐ All animations smooth and performant
14. ☐ Form validation on all inputs
15. ☐ Parameterized SQL queries to prevent injection
16. ☐ Error handling throughout application
17. ☐ Loading states for all async operations

---

**Build everything completely. Do not use placeholders. Create all files with full implementation including the MS Access database file.**
