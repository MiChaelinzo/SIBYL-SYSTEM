Requirements Document
1. Application Overview
1.1 Application Name
Sibyl System - Multi-Agent Law Enforcement Network

1.2 Application Description
A dystopian web-based law enforcement monitoring system inspired by Psycho-Pass anime. The system operates as a multi-agent collaboration platform that monitors citizens' mental states through cymatic scans, calculates Crime Coefficients and Hue values, and coordinates three core AI agents (Sibyl Hive Mind, Inspector Agent, Enforcer Agent) to assess threats and authorize enforcement actions via Dominator weapon simulation. The system now includes biometric vitals monitoring, facial recognition capabilities, and bulk citizen data import functionality.

1.3 Core Objectives
Monitor citizen mental states and biometric vitals to generate real-time Psycho-Pass assessments
Enable multi-agent collaboration for threat analysis and case investigation
Simulate Dominator weapon authorization system
Maintain persistent memory of citizen profiles, biometric history, and agent decision history
Provide facial recognition scanning for citizen identification
Support bulk import of citizen data from external files
Demonstrate measurable efficiency gains through agent decomposition and coordination
2. Users and Usage Scenarios
2.1 Target Users
System Administrators: Monitor overall system operations and agent performance
Human Operators: Oversee agent decisions at critical checkpoints, conduct biometric scans, perform facial recognition
Analysts: Review historical data and case outcomes
Data Import Specialists: Bulk import citizen records into the system
2.2 Core Usage Scenarios
Real-time monitoring of citizen population threat levels
Agent-driven investigation and threat assessment
Authorization and execution of enforcement actions
Case management and evidence tracking
Historical analysis of citizen mental state trends
Mobile field operations for enforcement personnel
Biometric vitals monitoring and analysis
Facial recognition scanning for citizen identification
Bulk import of citizen data from Excel or CSV files
3. Page Structure and Functional Description
3.1 Page Hierarchy
Sibyl System Web Application
├── Dashboard (Main Monitoring Interface)
│   ├── Population Overview Panel
│   ├── Geolocation Threat Map Panel
│   ├── Agent Status Panel
│   ├── Recent Alerts Panel
│   └── Case Management Board
├── Citizen Profile Page
│   ├── Individual Psycho-Pass History
│   ├── Cymatic Scan Records
│   ├── Biometric Vitals Panel (NEW)
│   └── Career Assignment Suggestions
├── Agent Communication Log
│   ├── Conversation History
│   └── Decision Trail
├── Dominator Weapon Interface
│   ├── Real-time Psycho-Pass Display
│   ├── Mode Selection (Paralyzer/Eliminator/Decomposer)
│   └── Authorization Status
├── Case Details Page
│   ├── Investigation Timeline
│   ├── Evidence Records
│   └── Agent Task Assignments
├── Scan Simulator Page
│   ├── Mental State Input (Text/Voice)
│   ├── Biometrics Section (NEW)
│   ├── Smartwatch Simulation Panel (NEW)
│   └── Scan Results Display
├── Facial Recognition Page (NEW)
│   ├── Live Camera Feed
│   ├── Scanning Overlay
│   ├── Identification Results
│   └── Capture Button
└── Bulk Import Page (NEW)
    ├── File Upload Zone
    ├── Data Preview Table
    └── Import Confirmation
3.2 Functional Description by Page
3.2.1 Dashboard (Main Monitoring Interface)
Population Overview Panel

Display real-time count of citizens by threat level categories (Below 100 / 100-299 / 300+)
Show color-coded Hue distribution across population (blue/green/yellow/orange/red)
Generate threat alerts when Crime Coefficient exceeds thresholds
Geolocation Threat Map Panel

Display interactive map showing citizen positions geographically
Render citizen markers color-coded by Hue status (blue/green/yellow/orange/red)
Show Crime Coefficient value on marker hover or click
Update marker positions and colors in real-time as new scans are processed
Support map zoom and pan interactions
Agent Status Panel

Show current operational status of three core agents (Sibyl Hive Mind, Inspector Agent, Enforcer Agent)
Display active tasks assigned to each agent
Indicate agent availability and workload
Recent Alerts Panel

List latest cymatic scan results with abnormal readings
Show newly identified threats requiring investigation
Display timestamp and citizen ID for each alert
Case Management Board

List active investigation cases
Show case status (Under Investigation / Pending Authorization / Resolved)
Display assigned agents for each case
Mobile Layout Optimization (375px-430px viewport)

Collapse panels into vertically stacked sections
Provide collapsible navigation menu
Prioritize critical information display (threat map, recent alerts)
Enable touch-friendly interactions for all controls
3.2.2 Citizen Profile Page
Individual Psycho-Pass History

Display current Crime Coefficient value (0-999 scale)
Show current Hue color status
Present historical trend graph of Crime Coefficient over time
Highlight critical incidents or spikes in mental state
Cymatic Scan Records

List all historical scan entries with timestamps
Show mental state descriptions processed by AI
Display scan location data
Biometric Vitals Panel (NEW)

Display latest biometric readings:
Heart Rate (BPM)
Stress Level (0-100)
Blood Pressure (systolic/diastolic)
SpO2 (oxygen saturation percentage)
Skin Conductance/GSR
Body Temperature
Show reading source (manual/smartwatch/sensor)
Display timestamp of last reading
Present historical trend graphs for each biometric metric
Career Assignment Suggestions

Show Sibyl-generated career recommendations based on mental profile
Display compatibility scores for different occupations
3.2.3 Agent Communication Log
Conversation History

Display chronological log of inter-agent communications
Show task assignments from Sibyl to Inspector/Enforcer agents
Record conflict resolution discussions
Decision Trail

Document key decision points made by each agent
Show authorization requests and approvals
Highlight human-in-the-loop checkpoint interventions
3.2.4 Dominator Weapon Interface
Real-time Psycho-Pass Display

Show target's current Crime Coefficient in large numeric display
Display target's Hue color status
Update values in real-time during scan
Mode Selection

Automatically select weapon mode based on Crime Coefficient:
Non-Lethal Paralyzer (100-299)
Lethal Eliminator (300+)
Decomposer (extreme threats)
Display mode name and description
Authorization Status

Show whether Sibyl has authorized weapon discharge
Display authorization denial reasons if applicable
Provide trigger activation control (only functional when authorized)
Mobile Optimization (375px-430px viewport)

Display interface as full-screen overlay on mobile devices
Optimize target selection for touch input
Enlarge mode display and authorization status indicators
Provide touch-optimized trigger activation button
3.2.5 Case Details Page
Investigation Timeline

Display chronological sequence of investigation activities
Show agent actions and findings at each step
Mark key decision points
Evidence Records

List collected evidence items
Show evidence type and source
Display analysis results from Inspector Agent
Agent Task Assignments

Show tasks delegated by Sibyl to Inspector/Enforcer agents
Display task status (Pending / In Progress / Completed)
Record task completion reports
3.2.6 Scan Simulator Page
Mental State Input

Provide textarea for manual text input of mental state description
Include voice input button for speech-to-text transcription
Display recording state indicator when voice input is active
Allow stopping of voice recording
Populate transcribed text into textarea automatically
Voice Input Functionality

Use browser native Web Speech API (SpeechRecognition) for transcription
Handle browser permission requests for microphone access
Display error messages when permissions are denied or API is unavailable
Show visual feedback during recording (e.g., pulsing icon)
Biometrics Section (NEW)

Provide input fields for manual entry of biometric values:
Heart Rate (BPM) - numeric input
Stress Level (0-100) - numeric input or slider
Blood Pressure Systolic - numeric input
Blood Pressure Diastolic - numeric input
SpO2 (oxygen saturation %) - numeric input
Skin Conductance/GSR - numeric input
Body Temperature - numeric input
Display field labels and acceptable value ranges
Allow operators to leave fields empty if data unavailable
Smartwatch Simulation Panel (NEW)

Provide toggle switch labeled "Smartwatch Feed"
When activated, auto-generate realistic fluctuating biometric readings:
Heart Rate: 60-120 BPM
Stress Level: 0-100
Blood Pressure: 90-140 systolic, 60-90 diastolic
SpO2: 95-100%
Skin Conductance: 1-20 microsiemens
Body Temperature: 36.0-37.5°C
Update readings every 2 seconds to simulate live wearable device stream
Display readings in real-time within the Biometrics Section
Provide "Lock Readings" button to freeze current values for use in scan
When locked, populate biometric input fields with frozen values
Scan Results Display

Show calculated Crime Coefficient and Hue color after scan processing
3.2.7 Facial Recognition Page (NEW)
Live Camera Feed

Access device camera using browser MediaDevices API (getUserMedia)
Display live video feed in designated viewport
Handle camera permission requests
Show error message if camera access denied or unavailable
Scanning Overlay

Display animated scanning overlay on video feed (Psycho-Pass scanner aesthetic)
Show scanning grid or crosshair animation
Indicate scanning status (Scanning / Analyzing / Identified)
Identification Results

Display confidence score (0-100%) for facial match
Show identified citizen name
Display citizen's current Crime Coefficient
Show citizen photo from database for comparison
Display "No Match Found" message if confidence below threshold
Capture Button

Provide button to freeze current video frame
Trigger scan for identified citizen when capture activated
Display captured frame alongside identification results
3.2.8 Bulk Import Page (NEW)
File Upload Zone

Provide drag-and-drop upload area for Excel (.xlsx) or CSV files
Display file selection button as alternative to drag-and-drop
Show uploaded file name and size
Support only .xlsx and .csv file formats
Data Preview Table

Parse uploaded file using xlsx npm package
Display parsed data in table format with columns:
Name
Age
Occupation
Location
Initial Crime Coefficient
Show row numbers for reference
Highlight rows with validation errors or missing required fields
Import Confirmation

Provide "Review and Confirm" button
Display summary: X records ready to import, Y records with errors
Show progress bar during import process
Display import results: X imported successfully, Y failed
List failed records with error reasons
Provide option to download error report
4. Business Rules and Logic
4.1 Crime Coefficient Calculation
Sibyl Hive Mind processes citizen mental state input and biometric vitals using Qwen LLM reasoning
Biometric data influences Crime Coefficient calculation:
Elevated heart rate and stress level increase coefficient
Abnormal blood pressure or SpO2 may indicate distress
High skin conductance correlates with anxiety
Fever or hypothermia may affect mental state assessment
Output numeric value between 0-999 based on combined threat assessment
Classification thresholds:
0-99: Law-abiding citizen
100-299: Latent criminal / potential threat
300-999: Severe threat / execution authorized
4.2 Hue Color Assignment
Derived from mental stress level analysis and biometric stress indicators
Color mapping:
Blue: Calm state
Green: Normal state
Yellow: Stressed state
Orange: Distressed state
Red: Critical state
4.3 Multi-Agent Task Decomposition
Sibyl Hive Mind receives threat alerts and decomposes investigation into subtasks
Inspector Agent assigned to analyze case evidence and make judgment calls
Enforcer Agent assigned to execute apprehension when authorized
Agents report findings back to Sibyl for collective decision-making
4.4 Agent Conflict Resolution
When Inspector and Enforcer agents disagree on threat assessment, escalate to Sibyl
Sibyl arbitrates using collective reasoning from 247 simulated brain nodes
Final decision recorded in agent communication log
4.5 Dominator Authorization Logic
Weapon only fires when Sibyl explicitly authorizes based on Crime Coefficient
Authorization denied if:
Crime Coefficient below 100
Target is criminally asymptomatic (immune to Psycho-Pass)
Conflicting agent assessments unresolved
Lethal action requires human-in-the-loop checkpoint confirmation
4.6 Memory Management
Citizen profiles stored with full scan history and biometric readings history
Agent conversation logs and decision history persisted
Case files maintained with complete investigation trails
Memory decay mechanism: citizen data older than 365 days archived unless flagged as critical
Critical memory highlighting for:
Repeat offenders (Crime Coefficient exceeded 100 more than twice)
Severe incidents (Crime Coefficient exceeded 300)
4.7 Career Assignment Logic
Sibyl analyzes citizen's mental profile stability and aptitude
Generates occupation recommendations with compatibility scores
High-stress tolerance individuals suggested for enforcement roles
Stable low-coefficient individuals suggested for administrative roles
4.8 Geolocation Data Processing
Citizen geolocation data updated with each cymatic scan
Map markers refresh in real-time when new scan data is received
Marker color reflects current Hue status
Marker position reflects last known location
4.9 Voice Input Processing
Voice recording initiated when user activates voice input button
Browser requests microphone permission if not already granted
Speech transcription occurs in real-time using Web Speech API
Transcribed text appended to existing textarea content
Recording stops when user deactivates button or speech ends
4.10 Biometric Data Storage (NEW)
Each scan stores biometric readings in biometric_readings table with citizen_id, timestamp, and reading_source
Latest biometric readings stored in citizens table latest_biometrics JSONB column
Historical biometric data retained for trend analysis
4.11 Smartwatch Simulation Logic (NEW)
When Smartwatch Feed toggle activated, generate random biometric values within realistic ranges
Update values every 2 seconds with small fluctuations to simulate natural variation
When "Lock Readings" button pressed, freeze current values and populate biometric input fields
Locked readings used in Crime Coefficient calculation when scan initiated
4.12 Facial Recognition Matching (NEW)
System compares live camera feed against citizen photos/descriptions stored in database
Calculate confidence score based on facial feature matching simulation
Confidence threshold for positive identification: 75%
If confidence below threshold, display "No Match Found"
When match found, retrieve citizen's current Crime Coefficient from database
4.13 Bulk Import Validation (NEW)
Validate required fields: Name, Age, Occupation, Location, Initial Crime Coefficient
Check data types: Age (integer), Initial Crime Coefficient (0-999 integer)
Reject rows with missing required fields or invalid data types
Duplicate citizen names flagged as warnings but allowed to import
Import process inserts valid records into citizens table in Supabase
5. Exceptions and Boundary Conditions
Scenario	System Behavior
Cymatic scan input is ambiguous or incomplete	Sibyl requests additional mental state data; displays "Scan Incomplete" status
Crime Coefficient calculation fails due to API error	Display "Assessment Unavailable"; log error; retry scan after 30 seconds
Multiple agents submit conflicting threat assessments simultaneously	Sibyl arbitration process initiated; decision delayed until consensus reached
Dominator trigger activated without authorization	Weapon remains locked; display "Authorization Denied" message; log unauthorized attempt
Citizen profile not found in database	Create new profile with initial scan data; assign default Crime Coefficient of 50
Agent communication log exceeds storage limit	Archive logs older than 90 days; maintain critical decision records indefinitely
Human operator does not respond to checkpoint within 60 seconds	Sibyl proceeds with default conservative action (deny lethal authorization)
Network connection lost during real-time monitoring	Display offline status; queue scan data locally; sync when connection restored
Crime Coefficient exceeds 999	Cap display at 999; flag as "Extreme Threat"; trigger immediate Enforcer deployment
Hue color cannot be determined from mental state	Default to yellow (stressed); flag for manual review
Geolocation data unavailable for citizen	Display marker at default location; show "Location Unknown" label
Map fails to load or render	Display error message; provide fallback list view of citizens
Browser does not support Web Speech API	Hide voice input button; display message indicating voice input unavailable
Microphone permission denied by user	Display error message; prompt user to enable microphone access in browser settings
Voice transcription produces no text	Display message indicating no speech detected; allow user to retry
Mobile viewport smaller than 375px	Apply minimum width constraint; enable horizontal scrolling if necessary
Biometric input fields left empty during scan	Proceed with scan using only mental state description; log missing biometric data
Biometric values outside acceptable ranges	Display validation error; prevent scan until corrected or fields cleared
Smartwatch simulation toggle activated while manual biometric values entered	Clear manual values; replace with simulated readings
Camera access denied by user	Display error message; prompt user to enable camera access in browser settings
Browser does not support MediaDevices API	Display message indicating facial recognition unavailable
Facial recognition confidence score below 75%	Display "No Match Found"; allow operator to retry or manually search citizen
Multiple citizens match facial recognition with similar confidence	Display top 3 matches with confidence scores; allow operator to select correct match
Uploaded file format not .xlsx or .csv	Display error message; reject file upload
Uploaded file exceeds 10MB size limit	Display error message; reject file upload
Bulk import file contains no valid data rows	Display error message; prevent import
Bulk import interrupted due to network error	Rollback partial import; display error message; allow retry
Duplicate citizen names in bulk import file	Flag as warnings; allow import with duplicate names
6. Acceptance Criteria
User accesses Dashboard and views real-time population overview showing at least 10 citizens with varying Crime Coefficients and Hue colors
User views Geolocation Threat Map panel displaying citizen markers color-coded by Hue; clicks a marker to see Crime Coefficient value
User selects a citizen with Crime Coefficient above 100 from the alert panel
System displays citizen profile page with complete Psycho-Pass history, cymatic scan records, and latest biometric vitals panel showing heart rate, stress level, blood pressure, SpO2, skin conductance, and body temperature
Sibyl Hive Mind agent automatically assigns investigation task to Inspector Agent, visible in Agent Status Panel
Inspector Agent analyzes case and submits threat assessment recommendation to Sibyl
User navigates to Scan Simulator page, activates Smartwatch Feed toggle, observes auto-generated biometric readings updating every 2 seconds, clicks "Lock Readings" button, and sees values populate biometric input fields
User enters mental state description in textarea, reviews locked biometric values, initiates scan, and system calculates Crime Coefficient incorporating both mental state and biometric data
User navigates to Facial Recognition page, grants camera permission, sees live video feed with scanning overlay, system identifies a citizen with 85% confidence, displays citizen name and current Crime Coefficient, user clicks Capture button to freeze frame and trigger scan
User navigates to Bulk Import page, drags and drops an Excel file containing 50 citizen records, reviews data preview table showing name, age, occupation, location, and initial Crime Coefficient for each record, clicks "Review and Confirm" button, system imports 48 records successfully and displays 2 failed records with error reasons
7. Out of Scope for Current Release
Multi-language support beyond English
Predictive analytics for future crime probability
Social network analysis of citizen relationships
Integration with external law enforcement databases
Customizable alert threshold settings by user role
Export functionality for case reports
Video playback of historical incidents
Real-time video surveillance integration
Automated patrol route optimization for Enforcer agents
Public citizen self-check portal
Appeal process for wrongful threat classifications
Offline mode for mobile Dominator interface
Voice command control for Dominator weapon firing
Multi-user simultaneous map editing
Historical playback of citizen movement patterns on map
Real-time biometric monitoring via actual smartwatch device integration
Advanced facial recognition using machine learning models
Batch editing of imported citizen records
Automated biometric anomaly detection alerts
Integration with external biometric sensors or medical devices
Video recording of facial recognition scans
Export of biometric trend reports
Multi-factor authentication using biometric data
8. Technical Implementation Notes
8.1 AI Agent Reasoning
Use Qwen LLM via Alibaba Cloud / Qwen Cloud for agent reasoning and threat analysis
API Key: sk-ws-H.IIXYME.YSN3.MEYCIQCvdkTb5H4hzJHWptZdjrPddhszNs79sqJ3WCUiF5Uf0wIhAIEgx8TorCQ-a4ulKPJbtTx8nZm8ahj11lRnjV5UxwgE
Implement 247 simulated reasoning threads for Sibyl Hive Mind collective decision-making
8.2 Data Storage and Real-time Updates
Use Supabase for database, authentication, and real-time subscriptions
Implement Edge Functions for agent logic and Qwen API calls
Add biometric_readings table with columns: id, citizen_id, bpm, stress_level, blood_pressure_systolic, blood_pressure_diastolic, spo2, skin_conductance, body_temperature, reading_source, created_at
Add latest_biometrics JSONB column to citizens table
8.3 Deployment Requirement
Must include proof of Alibaba Cloud deployment
8.4 UI Theme
Dark futuristic dystopian design
Color scheme: black background, neon blue accents, red for critical alerts
Real-time updating gauges and meters for Psycho-Pass displays
Multi-panel dashboard layout
Mobile-responsive design for 375px-430px viewports
8.5 Performance Metrics
Measure efficiency gain of multi-agent collaboration vs. single-agent baseline
Track task completion time reduction through agent decomposition
Monitor conflict resolution success rate
8.6 Bulk Import Processing
Use xlsx npm package for Excel file parsing
Parse CSV files using standard CSV parsing library
Implement file size limit of 10MB
Process import in batches to avoid timeout
