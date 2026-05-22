Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
ENDTERM PROJECT ASSIGNMENT
Full-Stack Development · 3rd–4th Year Undergraduate
Backend + Frontend · Children's Literacy Platform
Course Full-Stack Web Development
Assignment Type Endterm Project with Defence
Project Children's Literacy Learning Platform (Duolingo ABC-inspired)
Team Size 1 – 4 students
Weight 40% of final grade
Stack Backend API + Frontend Web Application
Submission Git repo + deployed URL + technical report
1. Project Title & Description
Children's Literacy Learning Platform — Full-Stack Web Application
You are required to design and implement a full-stack web application that powers a children's
literacy learning platform, inspired by Duolingo ABC. The platform teaches children aged 3–8 to
read through phonics, handwriting, sight words, and vocabulary using a gamified, curriculum-
driven approach.
The project has two equally important components: a robust backend API and a polished, child-
friendly frontend web application. Both must be production-grade, integrated, and deployed
together.
The frontend must be specifically designed for young children — large interactive elements,
bright colours, friendly characters, animations, and audio-cued interactions. It must also include
a separate parent dashboard with a calmer, information-rich interface.
2. User Roles & Personas
The system must serve three distinct user types, each with their own interface and permissions:
• Parent / Guardian — registers, manages child profiles, monitors progress, receives
notifications. Uses the Parent Dashboard.
• Child (Learner, ages 3–8) — interacts with lessons, earns rewards, progresses through
levels. Uses the Child Learning Interface — a simplified, highly visual, and animated UI.
• Admin / Content Manager — manages curriculum content (units, lessons, exercises),
views platform statistics, moderation. Uses the Admin Panel.
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
3. Functional Requirements
3.1 Authentication & Onboarding
• Parent registration with name, email, and password. Email format validation required.
• Secure login via JWT or session-based auth. Tokens must expire and be refreshable.
• Children do not register independently — parents create child profiles linked to their
account.
• On first login, parents are guided through an onboarding flow: create a child profile, pick
an avatar, and start the first lesson.
• Role-based access control enforced at both API and frontend route level.
3.2 Child Profile Management
• Parents can create and manage one or more child profiles: name, age (3–8), avatar
selection, and starting level.
• Each profile tracks: current curriculum level, XP points, daily streak, badges earned, and
overall progress percentage.
• Parents can view a detailed progress report for each child with lesson history and
performance charts.
3.3 Curriculum & Lesson Management
• Curriculum is organized as: Units > Lessons > Exercises.
• Exercise types: Phonics (letter-sound matching), Handwriting (letter tracing), Sight
Words (word recognition), Vocabulary (word-image matching).
• Children must complete lessons sequentially within a unit. Locked lessons are visually
indicated.
• Admins can create, edit, publish, and unpublish units, lessons, and exercises.
3.4 Learning Progress & Gamification
• XP points awarded on lesson completion. Accumulate to trigger level-ups with a
celebratory animation.
• Daily streak tracked — child must complete at least one lesson per day to maintain
streak.
• Badges awarded automatically for milestones: 'First Lesson', '7-Day Streak', 'Unit
Complete', '100 XP', etc.
• Stars (1–3) awarded per lesson based on accuracy and speed.
• Leaderboard showing top children by XP within an age group (display name only,
privacy-safe).
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
3.5 Notifications
• Parents receive in-app notifications for: child achievements, streak at-risk reminders,
and weekly progress summaries.
• Notifications persisted in the database with read/unread status.
• Real-time delivery via WebSocket, or background job for email/push simulation.
3.6 Search, Filtering & Pagination
• Admins can search and filter lessons by unit, type, difficulty, and status.
• All list views (lessons, children, notifications, logs) support pagination.
• Parents can browse the full curriculum map to see completed, in-progress, and locked
content.
4. Frontend Requirements
The frontend is a core deliverable, not an afterthought. It will be assessed on both
technical implementation quality and UX/UI design appropriateness for the target
audience.
4.1 Technology Stack
• Framework — React (recommended), Vue 3, or Next.js. Vanilla JS is not acceptable.
• Styling — Tailwind CSS, CSS Modules, or a component library such as Chakra UI or
MUI. Custom CSS is acceptable if well-structured.
• State Management — React Context, Redux Toolkit, Zustand, or Pinia (Vue). Choose
what is appropriate for your app's complexity.
• HTTP Client — Axios or the native Fetch API with a centralised API service layer.
• Routing — React Router v6+ or Vue Router. Protected routes (auth guards) required.
• Build Tool — Vite (strongly recommended) or Create React App.
4.2 Required Pages & Views
Public Pages (unauthenticated)
• Landing Page — introduces the platform with illustrated characters, feature highlights,
and call-to-action buttons. Fun, colourful, and inviting.
• Login Page — parent login form. Clean, friendly design.
• Registration Page — parent signup with inline validation feedback.
Parent Dashboard
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
• Overview screen showing all child profiles with XP, streak, and last active date as visual
cards.
• Child Progress View — detailed per-child view with: progress bar, XP chart (weekly),
lesson history table, badge showcase, and attendance-style streak calendar.
• Notification Centre — list of read/unread notifications with timestamps.
• Account Settings — update parent profile, change password, manage child profiles.
Child Learning Interface
• Child Selector Screen — displayed after parent login; large avatar cards for each child
profile to switch between learners.
• Curriculum Map — a visual, game-map style layout showing units and lessons as nodes
(locked, in-progress, completed). Animated path connecting the nodes.
• Lesson Screen — interactive exercise interface supporting all four exercise types
(phonics, handwriting, sight words, vocabulary). Full-screen, distraction-free.
• Results Screen — displayed after each lesson: stars earned, XP gained, encouragement
message, and a 'Continue' button. Animated celebration for perfect scores.
• Badge/Achievement Screen — gallery of earned and locked badges with friendly
descriptions.
• Leaderboard Screen — age-group leaderboard showing top learners by XP.
Admin Panel
• Dashboard — platform statistics: total users, active learners today, lessons completed
this week, average completion rate.
• Curriculum Manager — full CRUD interface for Units, Lessons, and Exercises with a
nested tree view.
• User Manager — searchable/filterable table of parent accounts with pagination.
• Activity Log Viewer — paginated log of all admin write operations.
4.3 Children's UX/UI Design Requirements
The child-facing interface must meet the following child-centred design standards. These will be
explicitly assessed during the defence:
Visual Design
• Bright, high-contrast colour palette — primary colours (red, blue, yellow, green) with
sufficient contrast for young eyes.
• Large, rounded UI elements — buttons minimum 56px tall, rounded corners (border-
radius ≥ 12px), generous padding.
• Friendly illustrated characters — at least one recurring mascot/character used
throughout the child UI for encouragement and guidance.
• Custom illustrated icons for exercise types — no generic Material/Font Awesome icons
in the child interface.
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
• Large, legible typography — minimum 18px body text, child-friendly fonts (e.g. Nunito,
Fredoka One, Baloo 2). No serif fonts.
Interaction Design
• All interactive elements must have clear hover and active states with visual and/or
animated feedback.
• Drag-and-drop or tap-to-select interactions for matching exercises (phonics, vocabulary).
• Progress indicators visible at all times during a lesson (e.g. progress bar showing '3 of 8
exercises done').
• Immediate positive feedback on correct answers — animation, colour flash, or character
reaction. No harsh visual treatment for wrong answers — gentle correction only.
• All actions completable without reading text (icon + colour cues) — important for pre-
readers.
Animations & Delight
• Lesson completion — confetti or star-burst animation on lesson completion screen.
• Level-up — full-screen celebratory animation with character.
• Badge unlock — pop-in animation with a brief 'shimmer' effect on the badge.
• Curriculum map — animated character walks along the path as the child progresses.
• Use CSS animations or a library such as Framer Motion, Lottie, or GSAP. Animations
must be smooth (60fps) and not excessive.
Accessibility for Young Children
• Audio cues for button interactions and exercise feedback (correct/incorrect sounds).
Audio must be toggleable by the parent.
• Touch-friendly — all tap targets minimum 44x44px (mobile/tablet first).
• Responsive design — the child interface must work on tablets (768px+) and desktop.
Mobile (375px+) support is a bonus.
• No pop-up ads, external links, or anything that could lead a child away from the platform.
4.4 Parent Interface UX Requirements
• Clean, calm design — contrasts with the child UI. Neutral tones, professional typography
(Inter, Roboto, or similar).
• Data visualisation — progress charts using Chart.js, Recharts, or D3. At minimum: a
weekly XP bar chart and a lesson completion line chart per child.
• Responsive — works on desktop (1280px+), tablet (768px+), and mobile (375px+).
• Loading states — all async data fetches must show a skeleton loader or spinner. No
blank screens.
• Error states — all API error responses must display a user-friendly message (not a raw
error object).
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
Confidential — For Student Use Only
• Empty states — all lists/tables must handle empty data gracefully with an illustrated
empty-state message.
4.5 Frontend Technical Requirements
• API Integration — all data fetched from your own backend REST API. No hardcoded
mock data in production build.
• Authentication Flow — JWT stored securely (httpOnly cookie preferred, or localStorage
with XSS awareness documented). Auth state persisted across page refresh.
• Protected Routes — unauthenticated users redirected to login. Role-based route guards
(child routes not accessible by parent and vice versa).
• Form Validation — all forms validated client-side before submission with clear inline
error messages. Use React Hook Form, Formik, VeeValidate, or equivalent.
• Environment Variables — API base URL and other config stored in .env files, not
hardcoded.
• Code Structure — components organised by feature/domain, not by type. Reusable
components extracted to a shared /components folder.
• No console.error or unhandled promise rejections in the production build.
5. Backend API Requirements
Your API must strictly follow REST conventions:
• Resource-based URL structure (e.g. /api/v1/lessons, /api/v1/children/{id}/progress).
• Correct HTTP methods: GET, POST, PUT/PATCH, DELETE.
• Appropriate status codes: 200, 201, 204, 400, 401, 403, 404, 422, 500.
• Consistent JSON error format with message and optional validation details fields.
• All endpoints versioned under /api/v1/.
• CORS configured to allow requests from the deployed frontend domain.
• Full OpenAPI 3.0 / Swagger documentation accessible at /docs on the deployed server.
Endpoint Methods Notes
/auth/register,
/auth/login, /auth/logout
POST Token-based auth; refresh token endpoint required
/parents/{id},
/parents/{id}/children
GET, PUT Parent profile and linked child list
/children, /children/{id} GET, POST, PUT,
DELETE
Child profile CRUD; parent-owned only
/children/{id}/progress GET Full learning history with exercise results
/children/{id}/badges GET Earned badges and locked milestones
/units, /units/{id} GET, POST, PUT,
DELETE
Curriculum unit management (Admin)
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
/lessons, /lessons/{id} GET, POST, PUT,
Lessons; filter by unit, type, status
DELETE
/lessons/{id}/exercises GET, POST, PUT,
Exercise CRUD within a lesson
DELETE
/lessons/{id}/complete POST Record completion; calculate XP and check badges
/exercises/{id}/submit POST Submit answer; record result and timing
/notifications GET, PATCH Fetch and mark notifications read
/leaderboard GET XP leaderboard filtered by age group
/admin/logs GET Admin-only paginated activity log
/admin/stats GET Platform-wide statistics for admin dashboard
6. Technical Requirements
6.1 Backend
• Framework — Django, FastAPI, Flask (Python), Node.js (Express/NestJS), or Spring
Boot (Java).
• Database — PostgreSQL (strongly preferred) or MySQL. SQLite not accepted.
• ORM — Django ORM, SQLAlchemy, TypeORM, Prisma, Sequelize, or Hibernate.
• Migrations — all schema changes managed via migration files.
• Validation — all inputs validated at the API layer (Pydantic, Joi, class-validator, etc.).
6.2 Frontend
• Framework — React 18+, Vue 3, or Next.js 14+.
• Build tool — Vite (recommended) or CRA.
• No inline styles — use a CSS strategy consistently (Tailwind, CSS Modules, or styled-
components).
• Linting — ESLint configured and passing. No lint errors in submitted code.
• No unused dependencies in package.json.
6.3 Full-Stack Integration
• Frontend communicates exclusively with your own backend API. No direct database
access from the frontend.
• CORS headers configured correctly on the backend.
• Both frontend and backend deployed and working together at a single public URL (or
clearly documented separate URLs with a working integration).
7. Architecture Requirements
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
7.1 Backend Architecture
• Layered architecture: Controllers / Routes → Services (business logic) → Repositories
(data access).
• No business logic in controllers. No raw SQL in services.
• Dependency injection or module pattern encouraged.
7.2 Frontend Architecture
• Feature-based folder structure: /features/auth, /features/lessons, /features/child, etc.
• Shared components in /components. Shared hooks in /hooks. API calls in /services or
/api.
• No API calls directly in UI components — use custom hooks or service functions.
• Global state (auth user, notifications) in a context or store. Local state in component.
8. Security Requirements
• JWT authentication with expiry and refresh token support.
• Password hashing — bcrypt (cost ≥ 10) or Argon2. Plaintext = automatic grade failure.
• Child data isolation — strict ownership checks; parents can only access their own
children's data.
• RBAC enforced at both API and frontend route level.
• Input validation and XSS protection on both backend and frontend.
• No sensitive data (passwords, full tokens) logged or exposed in error responses.
• HTTPS required on the deployed instance.
• Child safety — no external links, social features, or data collection beyond what is
necessary.
9. Real-Time & Async Features
Implement at least ONE of the following:
• WebSocket Notifications — real-time push to the parent dashboard when a child
completes a lesson or earns a badge (Socket.IO, Django Channels, etc.).
• Background Job Queue — async processing of badge evaluation, XP calculation, or
weekly progress email generation (Celery + Redis, Bull, BullMQ, etc.).
• Scheduled Jobs — daily streak evaluation job that marks streaks as broken for inactive
children (Celery Beat, node-cron, etc.).
10. Testing Requirements
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
10.1 Backend Tests
• Unit tests for service-layer logic: XP calculation, streak logic, badge award conditions.
• Integration tests for API endpoints: auth flow, child CRUD, lesson completion, progress
retrieval.
• Minimum 60% line coverage, measured and reported in CI.
10.2 Frontend Tests
• Component tests for at least 3 key components (e.g. LessonCard, ProgressBar,
ExercisePrompt) using React Testing Library or Vue Test Utils.
• At least 1 end-to-end test covering a core user flow (e.g. parent login → select child →
complete a lesson) using Cypress or Playwright.
11. DevOps & Deployment Requirements
• Git repository with conventional commits (feat:, fix:, style:, test:, etc.).
• Feature-branch workflow — no direct commits to main.
• CI Pipeline — GitHub Actions or GitLab CI: lint, unit tests, integration tests, coverage
report, frontend build check.
• CI Badge in README.
• Deployment — both frontend and backend publicly accessible. Recommended:
Vercel/Netlify for frontend, Railway/Render for backend.
• Swagger UI accessible at a public URL listed in README.
• Bonus — Docker Compose for local development (app + database + cache).
12. Performance Requirements
• All list API endpoints support pagination and filtering.
• No N+1 queries — use eager loading / joins for nested resources.
• Frontend bundle size — run a production build; total JS bundle should not exceed
500KB gzipped without justification.
• Images and assets — use optimised formats (WebP for illustrations). No uncompressed
PNGs over 500KB.
• Lazy loading — lesson assets (audio, images) loaded on demand, not on app start.
• Lighthouse score — the child learning interface must score ≥ 80 on Performance and ≥
90 on Accessibility in Chrome Lighthouse. Include a screenshot in your report.
13. Deliverables
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
1. Git Repository — monorepo or separate frontend/backend repos. README must include
setup instructions for both.
2. Live Deployment — publicly accessible URL(s) for both frontend and backend.
3. Swagger UI — accessible at the backend deployment URL.
4. Technical Report (PDF, max 25 pages) including:
◦ Architecture diagram — full-stack component diagram (frontend ↔ API ↔ DB ↔ async
layer).
◦ Entity-Relationship Diagram (ERD).
◦ UI/UX design rationale — why your child interface design choices are appropriate for ages 3–
8.
◦ Component tree diagram for the frontend.
◦ API endpoint table with methods, auth requirements, and descriptions.
◦ Gamification logic explanation.
◦ Async/real-time feature explanation.
◦ Lighthouse screenshot for the child interface.
◦ Testing approach and coverage report screenshot.
◦ Known limitations and future improvements.
14. Grading Rubric
Total: 100 points
# Category Area Pts Key Criteria
Functionality
All features work end-to-end. Roles enforced. Child
1
Full-Stack 20 pts
flow (lesson → XP → badge) complete. Notifications
working.
2 Backend Architecture Backend 15 pts Layered architecture. No logic in controllers. Proper
error handling. Clean, maintainable code.
3 Frontend Architecture Frontend 10 pts Feature-based structure. API calls in service layer.
State managed appropriately. No anti-patterns.
Children's UX/UI
4
Design Frontend 15 pts
Child interface is visually appropriate for ages 3–8.
Large elements, friendly typography, characters.
Animations present. Delight factor assessed.
5 Parent & Admin UI Frontend 5 pts Parent dashboard is clean, data-rich, and responsive.
Charts present. Loading/error/empty states handled.
6 Database Design Backend 8 pts Normalised ERD. Correct relationships. Migrations
present. Indexes applied.
7 API Design Backend 7 pts RESTful conventions. Correct status codes. Swagger
complete. Consistent error format. CORS configured.
Security
JWT auth correct. Passwords hashed. RBAC enforced
8
Full-Stack 8 pts
on API and frontend routes. Child data isolated.
HTTPS.
9 Testing Full-Stack 6 pts Backend unit + integration tests. Frontend component
tests. 1 E2E test. Coverage >= 60%. Pass in CI.
Confidential — For Student Use Only
Full-Stack Development — Endterm Project Assignment | Academic Year 2024–2025
10 DevOps &
Deployment Full-Stack 4 pts CI pipeline passing. Both apps deployed and publicly
accessible. Swagger live.
11 Presentation &
Defence Full-Stack 2 pts Live demo smooth. Architecture explained. Design
choices justified. All team members contribute.
TOTAL 100 pts
15. Bonus Features (Optional, up to +10 pts)
• Dockerization (+3 pts) — Docker Compose for full local dev stack (frontend, backend,
DB, cache).
• Mobile-Responsive Child UI (+2 pts) — child interface fully functional on 375px mobile
screens.
• Adaptive Difficulty (+3 pts) — exercise difficulty adjusts based on a child's recent
accuracy history.
• Audio Feedback (+2 pts) — correct/incorrect sound effects and letter pronunciation
audio in phonics exercises.
• Offline Mode (+3 pts) — child can complete a cached lesson without internet using a
Service Worker.
• Audit Logging (+2 pts) — immutable admin action log with before/after snapshots.
Academic Integrity
All submitted work must be your team's own. Use of AI coding tools (GitHub Copilot, ChatGPT,
Cursor, etc.) is permitted as an assistant but must be disclosed in your technical report,
specifying which parts were AI-assisted. You must be able to explain every line of code during
the defence. Submitting code you cannot explain constitutes academic dishonesty and will
result in a failing grade for the individual, regardless of the team's result.
Build something a 4-year-old will love — and an engineer will respect.
Full-Stack Development Course · Department of Computer Science
Confidential — For Student Use Only