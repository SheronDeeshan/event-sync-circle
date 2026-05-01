

# Circle App -- Professional Diagrams and Documentation

I will generate a comprehensive set of professional Mermaid diagrams covering every aspect of the Circle platform. These will be saved as `.mmd` files to `/mnt/documents/`.

## Diagrams to Generate

### 1. System Architecture Diagram
High-level overview showing Frontend (React PWA), State Management (AppContext), Backend (future Supabase), and external integrations (Google Maps, Facebook/Instagram import, FCM).

### 2. Database Entity-Relationship Diagram
Full ERD with tables: Users, Events, CircleGroups, Participants, JoinRequests, Messages, Expenses, Notifications, AnonymousInvites -- showing all relationships and cardinalities.

### 3. User Flow / Navigation Diagram
Complete screen navigation: Auth -> Home Feed -> Discover -> Event Detail -> Collaboration Space (Chat/Budget/Travel), Create Event, Profile, Notifications.

### 4. Event Lifecycle State Diagram
States: Draft -> Open -> Active -> Completed/Cancelled, with transition triggers (publish, first join, organizer action, date pass).

### 5. Use Case Diagram
All actors (User, Organizer, Anonymous User, System) and their use cases: Register, Login, Create Event, Join Event, Approve Request, Chat, Add Expense, Import Event, Discover Events, Manage Profile.

### 6. Matching Algorithm Flowchart
How the interest-based matching works: User interests -> Compare with event tags -> Score calculation -> Sort -> Display "For You" feed with match badges.

### 7. Collaboration Space Component Diagram
Breakdown of the tabbed collaboration space: ChatTab, BudgetTab, TravelTab with their data flows and features.

### 8. UI Screen Map / Wireframe Flow
Visual map of all screens and how they connect, showing the bottom navigation structure and modal overlays (Import, Join Request).

### 9. Authentication Flow Diagram
Sequence: User -> Auth Screen -> Login/Signup -> Set User State -> Navigate to Home Feed, including anonymous session support.

### 10. Join Request / Approval Sequence Diagram
Sequence between User, System, and Organizer for the join request workflow including notifications.

## Implementation
- Each diagram as a separate `.mmd` file in `/mnt/documents/`
- Professional styling using Mermaid's built-in theming
- Clear labels, proper grouping with subgraphs
- No emojis in Mermaid syntax (constraint)

