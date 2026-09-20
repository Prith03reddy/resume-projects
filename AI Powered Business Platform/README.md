AI-Powered Business Operations Platform
An enterprise-grade, multi-tenant SaaS support platform featuring a "Human-in-the-Loop" AI architecture. This system streamlines customer service by leveraging AI for ticket categorization, sentiment analysis, priority routing, and RAG-based (Retrieval-Augmented Generation) response drafting.

Built as an MCA Final Project by Prithvi Kumar Reddy.

🚀 Key Features
👤 Customer Portal
Secure Authentication: Role-based login and registration.

Ticket Management: Create requests, upload attachments, and track real-time status.

Interactive Chat UI: View previous conversations and reply to support agents directly.

Notification Center: Real-time updates on ticket activity.

🎧 Support Agent Workspace
Smart Dashboard: View open tickets filtered by AI-determined priority and category.

Human-in-the-Loop AI: Review, edit, or approve AI-generated draft responses before sending.

Intelligent Routing: SLA breach warnings and automated priority escalation.

Ticket Analytics: Instant visibility into customer sentiment and AI confidence scores.

⚙️ Admin & Manager Hub
Knowledge Base (RAG): Upload company policies (PDFs, DOCX) to be chunked and vectorized for the AI's context engine.

Analytics Dashboard: Pure CSS visualizations tracking SLA compliance, resolution times, and AI accuracy.

Workspace Settings: Manage team roles, adjust AI confidence thresholds, and configure SLA deadlines.

💻 Tech Stack
Frontend Framework: React 18 + Vite

Styling: Custom CSS with utility-class architecture (Tailwind-inspired)

Icons: Lucide React

State Management: React Hooks (useState, useEffect)

Animations: Pure CSS Keyframes and Transitions

📂 Project Structure
Plaintext
src/
├── App.jsx                  # Main router and role-based access control
├── Login.jsx                # Multi-tenant authentication (Customer/Employee)
├── CustomerPortal.jsx       # Client-facing ticket management
├── AgentDashboard.jsx       # AI-triaged ticket queue
├── TicketDetail.jsx         # Human-in-the-loop AI review interface
├── KnowledgeBase.jsx        # RAG document upload and vectorization UI
└── AnalyticsDashboard.jsx   # Real-time metrics and CSS data visualization
🛠️ Getting Started
To run this project locally:

Clone the repository:

Bash
git clone https://github.com/yourusername/ai-ops-platform.git
cd ai-ops-platform
Install dependencies:

Bash
npm install
npm install lucide-react
Run the development server:

Bash
npm run dev
Access the application:
Open your browser and navigate to http://localhost:5173.
Note: Use the toggle on the login screen to explore both Customer and Employee views.

🔮 Future Roadmap (Backend Integration)
API Layer: FastAPI / Node.js implementation.

AI Engine: Integration with LLMs for processing ticket text and generating responses.

Vector Database: PostgreSQL with pgvector for storing knowledge base embeddings.

Relational DB: Managing user states, authentication, and ticket history.

Designed and developed by Prithvi Kumar Reddy.