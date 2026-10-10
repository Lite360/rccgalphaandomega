Sunday School Examination System
Complete Product Specification · Master Build Prompt · PRD · EPR · MVP · Technical Architecture
This specification defines a lightweight, scalable online examination platform for church members to take Sunday school tests on their phones or computers. It includes the simplified two-role model, phone-number-based login, parish registration, examination controls, anti-copy deterrents, and the ability for an administrator to end an examination for everyone.
The product will be built around one principle: make it easy for church members to take an exam and easy for the administrator to manage the entire examination process.
1. Product overview

Sunday School Examination System
A mobile-first digital examination platform for church members.



User roles
2
Admin and User

Registration fields
3
Name, parish, phone

Primary platform
PWA
Mobile and desktop web

Architecture
Serverless
Vercel + Neon PostgreSQL



Product goals
1. Replace paper-based Sunday school examinations with online tests.
2. Let members register using only their name, parish, and phone number.
3. Make taking an examination straightforward, including for less technical users.
4. Give one Admin role control over questions, exams, participants, results, and settings.
5. Discourage copying and cheating while protecting exam answers on the server.
6. Support unreliable mobile internet connections as well as practical.
7. Keep the application lightweight and capable of expanding to multiple parishes and churches.
Product scope
The initial release is a church examination platform, not a complete church management system. It will not include tithes, offerings, member messaging, social networking, AI-generated content, or unnecessary role hierarchies.
2. Master build prompt
The following is the implementation brief to give a developer or coding agent. It establishes the product boundaries, required stack, design rules, business logic, and acceptance criteria.
MASTER BUILD PROMPT: SUNDAY SCHOOL EXAMINATION SYSTEM
1. Project mission
Build a production-ready, lightweight, secure, responsive Sunday School Examination System that enables church members to register, sign in using their phone number, take scheduled examinations, submit answers, and view released results.
The application must provide one comprehensive Admin dashboard for managing members, parishes, examinations, questions, submissions, results, and system settings.
Build a working software product, not a static prototype. All buttons, forms, navigation, permissions, database operations, and examination workflows must function correctly.
2. Required technology stack
- Frontend: Vue.js 3 using the Composition API.
- Build tool: Vite.
- Language: JavaScript or TypeScript. Prefer TypeScript for maintainable production code.
- Vanilla JavaScript: use for small browser utilities when Vue or another dependency is unnecessary.
- Styling: Tailwind CSS as the primary styling system.
- Bootstrap: optional; use only when a specific component or integration benefits from it. Do not load overlapping CSS frameworks without a clear reason.
- Backend: Node.js serverless functions deployed on Vercel.
- Database: Neon PostgreSQL.
- Database access: Drizzle ORM with version-controlled migrations.
- Validation: Zod.
- Authentication: phone-number-based authentication with OTP verification through a suitable SMS/OTP provider.
- PWA: installable web application with a lightweight service worker.
- Version control: Git and GitHub.
- File storage: no external file storage required for the initial MVP. Add Vercel Blob only when real file-upload requirements justify it.
Do not introduce additional frameworks, services, libraries, or infrastructure without a clear technical need.
3. User roles
Implement exactly two application roles:
1. Admin
2. User
Users register through the public registration page. Admin accounts must be created or promoted through a secure administrative process and must never be obtainable through public registration.
Keep administrator authentication and account records separate from ordinary user records where practical.
Do not create teacher, super-admin, moderator, branch-admin, or other application roles.
The Admin can perform all permitted administrative operations. A User can access only their own profile, examination attempts, answers, and released results.
4. Registration and authentication
The registration form must contain exactly these required profile fields:
- Full name
- Parish
- Phone number
Parish selection must use existing parish records. If the church requires free-text parish entry, provide an admin-controlled alternative.
Login must be based on the phone number. Verify phone ownership using OTP during registration and whenever authentication requires renewed verification.
Do not treat a phone number alone as proof of identity. After verification, issue a secure session using an HTTP-only, Secure, SameSite cookie as appropriate.
Implement logout, session expiration, login rate limiting, OTP expiration, OTP attempt limits, duplicate-phone handling, and account suspension.
Never expose authentication secrets or database credentials in frontend code.
5. Member features
Users must be able to:
- Register and sign in.
- View their registered name, parish, and phone number.
- View available, upcoming, ongoing, and completed examinations.
- Read examination instructions.
- Start an eligible examination.
- Answer multiple-choice, true-or-false, and written-answer questions.
- Navigate between questions.
- See answered and unanswered questions.
- View a server-validated countdown timer.
- Save answers incrementally.
- Resume an interrupted attempt when allowed by examination rules.
- Submit an examination.
- Receive submission confirmation.
- View results only when the Admin releases them.
- Review previous released results.
- Log out securely.
6. Admin dashboard
Create a protected /access route.
The Admin must be able to:
- View dashboard statistics.
- Create, edit, schedule, publish, cancel, end, and archive examinations.
- Create, edit, categorize, activate, and deactivate questions.
- Add multiple-choice options and correct-answer keys.
- Set question marks, exam duration, pass mark, instructions, and availability.
- Select questions manually or randomly from the question bank.
- Assign an examination to all eligible users or selected parishes.
- View registered users and their parish information.
- Search and filter users.
- Suspend or reactivate user accounts.
- Monitor participation and submission counts.
- View individual examination attempts.
- Grade written responses manually.
- Publish and withhold examination results.
- Export appropriate reports to CSV and print-friendly PDF.
- Manage parish records and examination settings.
- Review audit logs of important administrative actions.
The dashboard must not expose unnecessary user information or allow unauthorized access to member accounts.
7. Examination engine
Support the following question types:
- Multiple choice with one correct answer.
- True or false.
- Short written answer.
- Essay or long written answer.
Objective questions must be automatically graded on the server. Written questions must remain pending until the Admin grades them.
Each examination must support:
- Draft, scheduled, published, ongoing, ended, cancelled, and archived states where applicable.
- Configurable duration and start/end availability.
- Configurable pass mark.
- Configurable question count and marks.
- Optional randomized question order.
- Optional randomized multiple-choice option order.
- Maximum-attempt rules.
- Server-side deadline enforcement.
- Automatic submission or closure according to configured policy.
- A persistent attempt record.
- Safe, idempotent submission processing.
- A clear policy for incomplete attempts.
Do not trust the browser clock, frontend scores, or client-provided correct answers.
8. Admin-controlled early termination
The Admin must be able to end an ongoing examination for all participants immediately.
Before termination, display a confirmation dialog explaining the consequences.
After confirmation:
1. Validate the Admin's authorization on the server.
2. Atomically change the examination state to ended.
3. Record the termination timestamp and administrator action.
4. Reject new answer changes and submissions after the effective end time, except for any explicitly permitted finalization request.
5. Preserve all answers already saved on the server.
6. Mark submitted, incomplete, and affected attempts accurately.
7. Calculate objective scores for attempts according to the published grading policy.
8. Leave written answers pending manual grading.
9. Notify connected participants promptly and show a clear examination-ended message.
10. Allow the Admin to review the resulting attempts and decide when to release results.
Use a lightweight polling or other suitable mechanism for status updates. Do not add WebSockets solely for this feature unless actual scale or latency requirements justify them.
Ending an examination must not silently erase saved answers. Reopening must be an explicit, audited Admin action governed by the exam policy.
9. Copy restrictions and examination integrity
Within the examination interface, implement reasonable deterrents:
- Disable text selection where appropriate.
- Intercept copy, cut, and context-menu events.
- Block common copy shortcuts where practical.
- Record supported visibility-change and focus-loss events.
- Randomize questions or answer options when configured.
- Protect correct-answer keys from client responses.
- Enforce all deadlines, permissions, and grading rules on the server.
Do not claim that browser restrictions completely prevent cheating. Screenshots, external cameras, other devices, and browser workarounds remain possible.
Copy restrictions must not interfere with accessibility, ordinary navigation, or text entry in written-answer fields. Do not disable copying throughout the entire website.
10. UI/UX and visual design
Build a clean, modern, professional, mobile-first interface suitable for a church environment.
Use a consistent layout, readable typography, clear labels, restrained colors, sufficient spacing, accessible contrast, and straightforward navigation.
Member pages must be simpler than the Admin dashboard.
The examination screen must prioritize question readability, answer selection, remaining time, progress, and submission controls.
Display a confirmation dialog before final submission and before an Admin ends an examination.
Support loading states, empty states, validation messages, errors, connection loss, successful saving, and retry actions.
Image policy
Do not use AI-generated images, AI-generated illustrations, or AI-generated backgrounds.
Use no decorative imagery by default. If imagery is genuinely required, use authentic assets with appropriate usage rights or user-provided files. Use CSS, typography, and verified icons for interface design. Do not use fake church logos, fake member photographs, or invented institutional branding.
11. Database and security
Use Neon PostgreSQL with Drizzle ORM and migrations.
Create normalized tables for users, admins, parishes, examinations, questions, question options, exam-question assignments, attempts, answers, results, and audit logs.
Enforce unique phone numbers according to the chosen normalization policy.
Use database transactions for final submissions, score calculation, and exam termination.
Apply server-side authorization to every protected API operation. Validate all input, use parameterized queries, protect sessions, apply rate limits, and store secrets only in server-side environment variables.
Enforce church or parish data boundaries where applicable.
Keep correct-answer keys and unreleased results out of public API responses.
Create backups or an appropriate recovery plan and document database migration procedures.
12. Performance and scalability
Prioritize fast loading on lower-end phones and slower mobile connections.
Use code splitting, lazy loading, production asset optimization, pagination, indexed queries, small API responses, and appropriate cache headers.
Reuse database connections or a suitable connection pool for serverless workloads.
Do not publicly cache personal data, exam answers, authentication responses, or unreleased scores.
Build a modular monolith rather than introducing microservices.
13. Required deliverables
Before implementation, provide:
1. Product requirements document.
2. MVP scope and phased roadmap.
3. Engineering requirements and acceptance criteria.
4. System architecture and data-flow diagrams.
5. Database schema and migrations.
6. API route specification.
7. Authentication and authorization design.
8. UI/UX screen inventory and responsive design rules.
9. Project folder structure.
10. Working frontend and backend implementation.
11. Automated tests for critical workflows.
12. Deployment instructions for Vercel and Neon.
13. Environment-variable documentation.
14. Admin setup instructions.
15. Security checklist and known limitations.
14. Acceptance criteria
The product is not complete until:
- A new member can register with name, parish, and phone number.
- Phone verification and secure sign-in work.
- Public registration cannot create an Admin account.
- Admin can create and publish an examination.
- An eligible user can take and submit it.
- Saved answers survive a temporary connection interruption.
- Objective questions are marked correctly on the server.
- Written answers can be graded by Admin.
- Admin can end an examination for all participants.
- Ended examinations reject unauthorized subsequent changes.
- Saved answers and attempt records remain intact.
- Results remain hidden until released.
- Members cannot access another member's private records.
- Copy deterrents operate without breaking written-answer fields.
- The interface works on mobile and desktop.
- Deployment, migrations, authentication, and critical workflows are documented and tested.
Implement the simplest secure solution that satisfies these requirements. Do not substitute static demonstrations for working features or add unrelated functionality.




3. PRD: Product Requirements Document
3.1 Problem statement
Churches that conduct Sunday school tests on paper must manually distribute questions, collect scripts, mark answers, calculate scores, record results, and preserve examination records.
This consumes time and makes it harder to track member participation and performance across repeated examinations.
The proposed platform digitizes this workflow while retaining simple registration and centralized administrative control.
3.2 Target users
- Members: Church members who register and take examinations on a phone or computer.
- Admin: The authorized person responsible for the entire examination platform.
No other application roles will be introduced.
3.3 Functional requirements
ID	Requirement	Priority
PR-01	Register with name, parish, and phone number	Must have
PR-02	Phone-based sign-in with ownership verification	Must have
PR-03	Admin-only dashboard and protected /access route	Must have
PR-04	Question bank and exam builder	Must have
PR-05	Timed examinations and question navigation	Must have
PR-06	Incremental answer saving	Must have
PR-07	Admin can end an exam immediately	Must have
PR-08	Server-side objective grading	Must have
PR-09	Manual grading of written answers	Must have
PR-10	Results release and examination history	Must have
PR-11	Copy deterrents and question randomization	Should have
PR-12	CSV export and printable reports	Should have
PR-13	PWA installation	Should have
PR-14	Multiple-church tenancy	Future-ready architecture
3.4 Core user journeys
Member journey
#chatgpt-mermaid-_r_ne_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_ne_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_ne_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_ne_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_ne_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_ne_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_ne_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_ne_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_ne_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_ne_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_ne_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ne_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ne_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_ne_ p{margin:0;}#chatgpt-mermaid-_r_ne_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_ne_ .label text,#chatgpt-mermaid-_r_ne_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ .node rect,#chatgpt-mermaid-_r_ne_ .node circle,#chatgpt-mermaid-_r_ne_ .node ellipse,#chatgpt-mermaid-_r_ne_ .node polygon,#chatgpt-mermaid-_r_ne_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_ne_ .rough-node .label text,#chatgpt-mermaid-_r_ne_ .node .label text,#chatgpt-mermaid-_r_ne_ .image-shape .label,#chatgpt-mermaid-_r_ne_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_ne_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_ne_ .rough-node .label,#chatgpt-mermaid-_r_ne_ .node .label,#chatgpt-mermaid-_r_ne_ .image-shape .label,#chatgpt-mermaid-_r_ne_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_ne_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_ne_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ne_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ne_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_ne_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_ne_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_ne_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_ne_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_ne_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_ne_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_ne_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_ne_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_ne_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_ne_ .icon-shape,#chatgpt-mermaid-_r_ne_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_ne_ .icon-shape p,#chatgpt-mermaid-_r_ne_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_ne_ .icon-shape .label rect,#chatgpt-mermaid-_r_ne_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_ne_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_ne_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_ne_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_ne_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_ne_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_ne_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_ne_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ne_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_ne_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_ne_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_ne_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ne_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_ne_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_ne_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ne_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_ne_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_ne_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ne_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_ne_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_ne_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_ne_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_ne_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_ne_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_ne_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-width:1px;}#chatgpt-mermaid-_r_ne_ .node rect,#chatgpt-mermaid-_r_ne_ .node circle,#chatgpt-mermaid-_r_ne_ .node ellipse,#chatgpt-mermaid-_r_ne_ .node polygon,#chatgpt-mermaid-_r_ne_ .node path{fill:rgb(24, 24, 24);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_ne_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_ne_ .node.mermaid-decision .label-container{fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_ne_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_ne_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_ne_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Open examination websiteRegister name, parish, phoneVerify phoneSign inView available examsRead instructionsStart examAnswer questions andautosaveSubmit or exam endsView submission statusView result when released






Admin journey
#chatgpt-mermaid-_r_nn_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_nn_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_nn_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_nn_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_nn_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_nn_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_nn_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_nn_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_nn_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_nn_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_nn_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_nn_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_nn_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_nn_ p{margin:0;}#chatgpt-mermaid-_r_nn_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_nn_ .label text,#chatgpt-mermaid-_r_nn_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ .node rect,#chatgpt-mermaid-_r_nn_ .node circle,#chatgpt-mermaid-_r_nn_ .node ellipse,#chatgpt-mermaid-_r_nn_ .node polygon,#chatgpt-mermaid-_r_nn_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_nn_ .rough-node .label text,#chatgpt-mermaid-_r_nn_ .node .label text,#chatgpt-mermaid-_r_nn_ .image-shape .label,#chatgpt-mermaid-_r_nn_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_nn_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_nn_ .rough-node .label,#chatgpt-mermaid-_r_nn_ .node .label,#chatgpt-mermaid-_r_nn_ .image-shape .label,#chatgpt-mermaid-_r_nn_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_nn_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_nn_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_nn_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_nn_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_nn_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_nn_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_nn_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_nn_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_nn_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_nn_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_nn_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_nn_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_nn_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_nn_ .icon-shape,#chatgpt-mermaid-_r_nn_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_nn_ .icon-shape p,#chatgpt-mermaid-_r_nn_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_nn_ .icon-shape .label rect,#chatgpt-mermaid-_r_nn_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_nn_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_nn_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_nn_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_nn_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_nn_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_nn_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_nn_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_nn_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_nn_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_nn_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_nn_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_nn_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_nn_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_nn_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_nn_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_nn_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_nn_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_nn_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_nn_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_nn_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_nn_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_nn_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_nn_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_nn_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-width:1px;}#chatgpt-mermaid-_r_nn_ .node rect,#chatgpt-mermaid-_r_nn_ .node circle,#chatgpt-mermaid-_r_nn_ .node ellipse,#chatgpt-mermaid-_r_nn_ .node polygon,#chatgpt-mermaid-_r_nn_ .node path{fill:rgb(24, 24, 24);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_nn_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_nn_ .node.mermaid-decision .label-container{fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_nn_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_nn_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_nn_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Admin signs inOpen /accessCreate questionsConfigure examinationPublish examMonitor participantsExam statusReview submissionsConfirm end examinationServer closes examGrade written answersRelease resultsNormal completionEnd early






3.5 Non-functional requirements
- Performance: Keep the initial frontend bundle small, load nonessential features on demand, and minimize API round trips.
- Reliability: Saved answers must survive temporary disconnections where they have already reached the server.
- Security: Enforce authentication, authorization, deadlines, and grading on the backend.
- Accessibility: Provide keyboard navigation, readable text, visible focus states, and accessible form controls.
- Maintainability: Use modular code, migrations, documented API contracts, and automated tests.
- Scalability: Support increasing numbers of members and simultaneous exam attempts through indexing, efficient queries, and appropriate database connection management.
- Privacy: Collect only necessary member information and restrict access to examination records.
3.6 Business rules
1. Phone numbers must be normalized consistently and unique for individual accounts.
2. The public registration form must not contain an Admin role selector.
3. An examination cannot start before its permitted start time.
4. An examination attempt belongs to one member and one examination.
5. Only server-validated answers count toward the official score.
6. An Admin's termination action overrides the ordinary exam timer.
7. Answers received and saved before termination remain available for grading.
8. Results remain private until the Admin releases them.
9. An ended exam cannot accept new answers unless an explicit, audited reopening policy allows it.
10. Duplicate submissions must not generate duplicate results or double-counted scores.
4. EPR: Engineering Product Requirements
This section translates the product requirements into concrete engineering behavior, system boundaries, and testable implementation rules.
4.1 System architecture
Use a modular monolith with serverless deployment, not microservices. The frontend, API, and database remain separate logical layers but are maintained in one repository.
Presentation layer
Vue 3 · Vite · Tailwind CSS · optional Bootstrap
Member portal · Exam screen · Admin dashboard


Application API
Vercel Functions · Node.js · Zod
Sessions · Authorization · Exams · Grading · Reports


Data access
Drizzle ORM · PostgreSQL transactions


Neon PostgreSQL
Users · Parishes · Questions · Attempts · Answers · Results · Audit logs


Supporting integrations are limited to a phone OTP provider, GitHub, and optional file storage or notifications when actually required.
4.2 Recommended project structure
sunday-school-exam/
├── api/
│   ├── auth/
│   ├── admin/
│   ├── exams/
│   ├── attempts/
│   ├── results/
│   └── reports/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── member/
│   │   ├── exam/
│   │   └── admin/
│   ├── composables/
│   ├── services/
│   ├── router/
│   ├── utils/
│   └── main.js
├── server/
│   ├── auth/
│   ├── middleware/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   └── security/
├── db/
│   ├── schema/
│   ├── migrations/
│   └── seed/
├── public/
│   ├── manifest.webmanifest
│   └── icons/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── drizzle.config.ts
├── vite.config.js
├── package.json
└── README.md


The api/ directory contains Vercel-compatible serverless entry points. Shared business logic lives in server/, so endpoints do not duplicate authentication or grading rules.
The /access URL is a frontend route, not a security boundary by itself. Every Admin API endpoint must independently verify the authenticated administrator's privileges.
4.3 Database design
Table	Essential fields
users	id, full_name, parish_id, phone_e164, status, created_at
admins	id, login_identifier, password_hash or linked authentication identity, status
parishes	id, name, slug, status
exams	id, title, instructions, status, duration_seconds, pass_mark, starts_at, ends_at, ended_at, created_by
questions	id, question_text, question_type, marks, topic, status
question_options	id, question_id, option_text, is_correct
exam_questions	exam_id, question_id, position, marks_override
exam_attempts	id, exam_id, user_id, started_at, deadline_at, submitted_at, status
exam_answers	id, attempt_id, question_id, answer_payload, saved_at, awarded_marks
exam_results	id, attempt_id, score, maximum_score, grade_status, released_at
audit_logs	id, admin_id, action, entity_type, entity_id, created_at, metadata
Additional tables for OTP challenges, sessions, and rate limits should be included where appropriate. Use secure session storage or a carefully designed session mechanism, not plaintext authentication tokens in the database.
Important database constraints:
- Unique normalized phone number for each member.
- Foreign keys for all relevant relationships.
- Unique (attempt_id, question_id) for answer records when each question appears only once per attempt.
- Unique result record per attempt.
- Indexes on exam status, scheduled dates, attempt ownership, and result-release status.
- Transactions around submission, grading, and examination termination.
is_correct must never be included in the member-facing question response. Store or retrieve answer keys only in server-side grading operations.
4.4 API specification
All endpoints must validate the authenticated identity, authorization, request body, and relevant exam state.
Method and endpoint	Purpose
POST /api/auth/register	Create a member registration and initiate verification
POST /api/auth/verify-otp	Verify phone ownership
POST /api/auth/login	Initiate phone-based authentication
POST /api/auth/logout	Invalidate the session
GET /api/me	Retrieve the current member profile
GET /api/exams	List examinations available to the member
GET /api/exams/:id	Retrieve permitted exam information
POST /api/exams/:id/start	Create or resume an eligible attempt
GET /api/attempts/:id	Retrieve an authorized attempt
PUT /api/attempts/:id/answers/:questionId	Save an answer
POST /api/attempts/:id/submit	Finalize an examination attempt
GET /api/results	List the member's released results
POST /api/admin/exams	Create an examination
PATCH /api/admin/exams/:id	Update allowed exam settings
POST /api/admin/exams/:id/publish	Publish an examination
POST /api/admin/exams/:id/end	Terminate an ongoing examination
POST /api/admin/exams/:id/reopen	Reopen an examination under permitted rules
POST /api/admin/attempts/:id/grade	Grade written responses
POST /api/admin/results/:id/release	Release an authorized result
GET /api/admin/reports	Retrieve administrative reports
Use consistent HTTP status codes and error formats. Paginate list endpoints. Do not accept a client-submitted score as authoritative.
4.5 Critical engineering rules
Answer saving
- Save each answer to the server when the member changes it, with sensible debounce and retry behavior.
- Show whether an answer is saved, saving, or waiting for reconnection.
- Do not claim an answer is saved until the server confirms persistence.
- Preserve the latest acknowledged answer after a refresh or temporary network loss.
- Use request ordering or version checks to prevent stale retries from overwriting newer answers.
Exam timer
- Set deadline_at on the server when an attempt begins.
- Calculate remaining time using server timestamps.
- Reject late answer changes and submissions according to the published deadline policy.
- Revalidate exam status and deadline on every answer-saving and submission request.
Admin termination
- Use a database transaction to record the effective termination state and timestamp.
- Ensure concurrent answer writes cannot be accepted after the effective termination time.
- Notify connected participants through lightweight polling or a suitable alternative.
- Preserve previously saved answers and accurately record incomplete attempts.
Scoring
- Score objective questions in trusted backend code.
- Validate the question set and maximum possible score.
- Store manual grading separately from automated grading where useful.
- Prevent duplicate finalization using transactions and idempotency checks.
- Do not publish partially graded results unless the product explicitly supports provisional results.
4.6 Security and privacy
The engineering implementation must include:
- Argon2id password hashing if password-based administrator authentication is used.
- Short-lived OTPs, attempt limits, and resend throttling.
- Secure, HTTP-only cookies with suitable SameSite settings.
- CSRF protection for cookie-authenticated state-changing requests.
- Input validation and parameterized database queries.
- Rate limits for login, OTP, exam starts, answer saving, and submissions.
- Strict server-side authorization on all administrative endpoints.
- Security headers and HTTPS in production.
- Redaction of secrets and sensitive authentication data from logs.
- Audit trails for exam termination, reopening, grading, and result release.
- Retention and deletion policies for personal information and examination records.
- Restricted database credentials and appropriate backup and recovery procedures.
Do not build browser fingerprinting, covert surveillance, or invasive monitoring into the MVP.
4.7 Testing requirements
Critical automated tests must cover:
1. Registration, OTP verification, and duplicate phone numbers.
2. User and Admin access restrictions.
3. Question creation and exam publication.
4. Timer expiration and late submission rejection.
5. Answer saving during temporary network interruption.
6. Duplicate and concurrent submission attempts.
7. Admin termination while multiple members are answering.
8. Rejection of writes after termination.
9. Correct automatic grading and manual grading.
10. Results remaining hidden until authorized release.
11. Unauthorized access to another member's attempts.
12. Keyboard navigation, mobile layouts, and written-answer usability.
Use unit tests for grading and exam-state logic, integration tests for the API and database, and end-to-end tests for complete member and Admin journeys.
5. MVP: Minimum Viable Product
The MVP is the smallest complete version that a real church can use to conduct Sunday school examinations.
5.1 MVP feature scope
A. Registration and authentication
Name, parish, phone number, phone verification, login, logout, and secure sessions.



B. Admin dashboard
Member management, parish management, exam creation, question management, and participation statistics.



C. Examination engine
Question navigation, timer, answer saving, submission, multiple-choice questions, and true-or-false questions.



D. Examination controls
Publish, schedule, end early, close automatically at the deadline, and reopen under controlled rules.



E. Grading and results
Automatic objective marking, manual written-answer grading, result release, and examination history.



F. Security and deployment
Copy deterrents, server-side permissions, audit logs, database migrations, automated tests, and production deployment.



5.2 Features to postpone
Do not build these before the core exam workflow is reliable:
- Payment gateways and subscriptions.
- Native Android and iOS applications.
- SMS or WhatsApp announcements beyond essential phone verification.
- Advanced analytics and leaderboards.
- Certificate generation.
- Complex offline examination mode.
- Live proctoring or webcam monitoring.
- Real-time WebSocket infrastructure.
- AI-generated questions or content.
- Multiple administrative permission levels.
This keeps the first release focused, easier to test, and cheaper to maintain.
6. UI/UX design specification
The product should feel like a purpose-built examination portal, not a generic admin template.
Member screens

Registration
Three required profile fields, clear validation, parish selection, and phone verification.



Member dashboard
Welcome message, upcoming exams, available exams, previous attempts, and released results.



Exam instructions
Duration, number of questions, rules, pass mark where appropriate, and a clear start button.



Examination screen
Readable questions, answer choices, countdown, question navigation, saving status, and submit action.



Results
Score, grade, pass/fail status, feedback when available, and previous examination history.



Admin screens
- Dashboard overview.
- Examination list and status filters.
- Create and edit examination.
- Question bank.
- Examination participants and attempts.
- Live participation monitoring.
- End-exam confirmation dialog.
- Manual grading.
- Results management and release.
- Member and parish management.
- Reports and audit logs.
- Basic system settings.
Visual rules
- Use a restrained, professional color palette.
- Use no more than two font families.
- Prioritize readable text and large touch targets.
- Use consistent buttons, forms, cards, and status indicators.
- Use SVG icons or CSS elements where suitable.
- Do not use AI-generated images.
- Do not include placeholder buttons that do nothing.
- Ensure all primary actions work on mobile screens.
Bootstrap remains optional. Tailwind CSS should be the primary styling system unless a specific component makes Bootstrap worthwhile.
7. Examination lifecycle
The system must use explicit state transitions so the Admin and members see consistent information.
State	Meaning
Draft	Admin is preparing the examination.
Scheduled	Exam is configured for a future start.
Published	Exam is available or awaiting its permitted start time.
Ongoing	Eligible members can take the examination.
Ended	No further answer changes are accepted.
Cancelled	The examination has been cancelled.
Archived	The examination is retained for historical reference.
The implementation must define valid transitions between states. For example, a scheduled examination should not accept answers before its start time, and an ended examination must not silently return to the ongoing state.
An examination being ended does not automatically mean all results are ready for publication. Written answers may still require grading.
8. Deployment and operations
The initial deployment will use:
- GitHub: source code and version control.
- Vercel: frontend hosting and serverless APIs.
- Neon: PostgreSQL database.
- OTP provider: phone verification.
- Automated deployment checks: linting, tests, and production build validation.
Before going live:
1. Create production and development database environments.
2. Configure environment variables securely in Vercel.
3. Run database migrations.
4. Create the first Admin through a secure bootstrap procedure.
5. Test registration and phone verification.
6. Simulate a real examination with multiple participants.
7. Test early termination while answers are being saved.
8. Confirm that results remain private until released.
9. Test mobile layouts and temporary network interruptions.
10. Configure monitoring, backups, and a recovery procedure.
Do not put secrets in the Vue frontend, source control, or public environment variables.
9. Implementation roadmap
These are proposed development phases, not guaranteed delivery dates.
01

Foundation
Project setup, database schema, authentication, parish records, secure Admin bootstrap, and responsive layouts.



02

Examination management
Question bank, exam builder, scheduling, publishing, member dashboard, and exam navigation.



03

Exam integrity
Autosave, server-side deadlines, early termination, objective grading, manual grading, and copy deterrents.



04

Results and launch
Result release, reports, audit logs, automated testing, security review, and pilot deployment.



10. Final technical decisions
Area	Final decision
Frontend	Vue.js 3 + Vite
Programming	TypeScript for core application logic; Vanilla JavaScript where appropriate
Styling	Tailwind CSS, Bootstrap only when needed
Backend	Node.js + Vercel Functions
Database	Neon PostgreSQL
ORM	Drizzle ORM
Validation	Zod
Authentication	Phone OTP and secure sessions
Admin access	Protected /access route
Roles	Admin and User only
Image policy	No AI-generated images
Architecture	Lightweight modular monolith
Deployment	GitHub + Vercel + Neon
Storage	No Blob dependency in the MVP unless file uploads are required
Definition of success
The first release is successful when a member can register, sign in, take a real examination, submit answers, and later view a released result, while the Admin can create the exam, monitor participation, end it early, grade submissions, and publish results without compromising saved answers or examination security.