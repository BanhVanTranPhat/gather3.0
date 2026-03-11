# Chapter: Requirements Engineering (RE)

## 1. Requirements Engineering Overview

Requirements Engineering (RE) is a foundational phase in the Software Development Life Cycle (SDLC) that transforms stakeholder needs into a verifiable and manageable set of requirements. In the context of The Gathering project, RE provides the formal bridge between the initial technical brief and the implemented software modules in the frontend and backend repositories. The process ensures that product intent, user expectations, and technical constraints are translated into explicit artifacts such as user stories, use case descriptions, functional requirements, non-functional requirements, and traceability mappings.

For this capstone project, RE is particularly important because the system combines multiple domains in one integrated platform: authentication, real-time avatar interaction, communication services (chat and call signaling), realm management, events, resources, forum, and administration. Without a structured RE process, feature boundaries and responsibilities could easily become inconsistent across teams and sprints. The project documentation demonstrates that RE was used to maintain coherence among product scope (`charter.md`, `techbrief.md`), behavioral specification (`User_Story.md`, `UseCase_Description.md`), implementation evidence (`RTM.md`), and quality constraints (`Non_Functional_Requirements.md`, `QualityAttributes.md`).

In summary, RE in this project serves three SDLC-critical roles: (1) scope control, by distinguishing in-scope and out-of-scope capabilities; (2) implementation alignment, by mapping each requirement to concrete modules and APIs; and (3) verification readiness, by defining acceptance criteria and test traceability.

## 2. Stakeholders Identification

Based on the project artifacts, the stakeholder ecosystem includes primary users, governance roles, technical operators, and external service providers.

### 2.1 End Users

End users include Guests and Registered Users who interact with the platform for collaboration activities. Their core needs include account onboarding, joining realms, avatar movement, messaging, participation in events, access to resources, and forum interaction. Realm Owners are a specialized user group with additional permissions for managing realm-level content and settings.

### 2.2 Administrators

System Admin users are responsible for platform-level governance. Their interests include user management, moderation, and dashboard-based monitoring. The requirements indicate restricted access control (`role = admin`) and dedicated management workflows for high-impact operations.

### 2.3 System Maintainers

System maintainers include the development team and supervising lecturer in an academic project setting. Their concerns focus on architectural correctness, maintainability, release quality, and requirement traceability. Sprint planning, risk control, and definition-of-done criteria in `plan.md` reflect this stakeholder perspective.

### 2.4 External Services

The context and use case documents identify several external systems that directly influence requirements:

- Google OAuth service for social authentication.
- Gmail SMTP/Nodemailer path for OTP delivery.
- Agora cloud SFU infrastructure for voice/video transport.
- Browser hardware capabilities (microphone/camera) as a runtime dependency.

These integrations are outside direct implementation ownership but inside system behavior scope; therefore, they are treated as secondary stakeholders whose interfaces and constraints must be captured during RE.

## 3. Types of Requirements

The project requirements can be classified into four complementary categories.

### 3.1 Business Requirements

Business requirements define the product-level value and strategic objectives. From `techbrief.md` and `charter.md`, the project aims to deliver a web-based virtual co-working platform that consolidates collaboration functions in one environment. Key business goals include improving remote interaction quality through spatial presence, supporting community activities (events, resources, forum), and providing a demo-ready MVP for initial private beta users. These requirements justify why the system exists and why integrated features are prioritized over standalone tools.

### 3.2 User Requirements

User requirements express what stakeholder groups need to accomplish. In this project, user requirements are captured primarily in `User_Story.md` and use case artifacts. Examples include secure account access, profile personalization, realm creation/joining, real-time movement, contextual chat, call request workflows, event participation, resource sharing, forum discussion, and admin governance actions. The use of structured acceptance criteria per story provides measurable user-facing outcomes.

### 3.3 System Requirements

System requirements describe the required behavior of the whole socio-technical system, including external interactions and operational constraints. The context diagram and architecture documents indicate system-level requirements for HTTP and WebSocket communication, authentication continuity, role-based access control, payload validation, session state synchronization, and dependency handling for OAuth/SMTP/Agora services. System requirements also include operational reliability behavior such as reconnect handling and position restoration.

### 3.4 Software Requirements

Software requirements specify implementable functions and quality constraints at module/API level. The project formalizes functional software requirements using canonical IDs (e.g., `AUTH-01`, `RM-01`, `RT-01`, `CHAT-02`, `ADM-01`) in `Functional_Requirements.md` and maps them to concrete code targets in `RTM.md`. Non-functional software requirements are defined in `Non_Functional_Requirements.md` and expanded into measurable quality scenarios in `QualityAttributes.md` (security, performance, reliability, usability, compatibility, and validation constraints).

## 4. Requirements Engineering Process

The project follows an iterative RE process aligned with Agile/Scrum planning.

### 4.1 Elicitation

Requirements elicitation begins with the client-oriented technical brief and project charter, then expands through stakeholder role analysis and feature decomposition. Practical elicitation inputs include product goals, target user workflows, and integration constraints from external platforms. Techniques evidenced in the repository include document-based elicitation, use case workshops, and scenario-driven discussion through user stories.

### 4.2 Analysis

During analysis, the team decomposes high-level goals into feature groups and actor-specific interactions. The use case model identifies actor boundaries (user, realm owner, admin), while functional requirement IDs organize behavior into coherent domains (authentication, realtime, communication, content, administration, stability). Analysis also addresses feasibility and risk, as shown by prototyping outcomes (e.g., selecting cloud SFU architecture over mesh-based calling).

### 4.3 Specification

Specification is performed through multiple synchronized artifacts:

- `User_Story.md` for user-centric behavior and acceptance criteria.
- `Functional_Requirements.md` for canonical, implementation-oriented requirement summaries.
- `UseCase_Description.md` for detailed operational flows, exceptions, business rules, and pre/post-conditions.
- `Non_Functional_Requirements.md` and `QualityAttributes.md` for quality constraints and measurable scenarios.
- `RTM.md` for end-to-end mapping to implementation modules and verification cases.

This layered specification strategy improves readability for both technical and non-technical reviewers.

### 4.4 Validation

Validation is supported through acceptance criteria, quality attribute scenarios, and traceability links to test case IDs (`TC-*`). The RTM demonstrates whether each requirement has implementation coverage and verification targets. Additional validation mechanisms include sprint reviews, code reviews, and manual end-to-end testing defined in the project plan. In an academic context, mid-term and final defense checkpoints also serve as formal validation gates for requirement completeness and consistency.

### 4.5 Requirements Management

Requirements management is handled via controlled IDs, traceability governance, sprint prioritization, and document synchronization rules. The project explicitly avoids duplicate ID systems and requires updates to related artifacts when changes occur. Priorities (P0/P1/P2) and sprint planning provide change control for scope and schedule. This management practice reduces requirement drift and supports auditable evolution from intent to implementation.

## 5. Requirements Elicitation Techniques

The project applies several elicitation and refinement techniques documented in dedicated artifacts.

### 5.1 Use Case Modeling

`Use_Case_Modeling.md` structures actor-system interactions and clarifies role boundaries. This technique is suitable for The Gathering because permissions differ significantly among users, realm owners, and system admins. The model also helps communicate behavior to stakeholders without requiring code-level detail.

### 5.2 User Stories

`User_Story.md` captures functional expectations in role-goal-benefit format with detailed acceptance criteria. This supports iterative delivery and sprint-based development because stories can be prioritized, estimated, implemented, and tested incrementally.

### 5.3 Prototyping

`Prototyping.md` shows both UI prototyping (Figma layout validation) and technical proof-of-concept experiments (multimedia architecture and rendering strategy). Prototyping reduced requirement uncertainty, transformed assumptions into evidence-based decisions, and generated concrete usability/performance requirements.

### 5.4 Context Diagram

`Context_Diagram.md` defines system boundaries and external entities. This technique is essential for separating internal development responsibility from external dependencies (OAuth, SMTP, Agora, browser media devices), thereby reducing ambiguity in system scope and interface expectations.

### 5.5 Requirement Traceability Matrix (RTM)

`RTM.md` links each requirement ID to SRS references, implementation files, and verification case IDs. This technique strengthens governance by making coverage gaps visible and by supporting impact analysis whenever a requirement changes.

## 6. Requirement Analysis

Requirement analysis in this project is organized around domain decomposition, priority levels, and traceability-based verification.

First, the team groups requirements by capability domain (authentication, profile, realm, realtime, chat/call, events, resources, forum, admin, and system stability). This improves modular ownership and reduces cross-feature ambiguity.

Second, requirements are prioritized using explicit levels (P0, P1, P2) and sprint planning. Core operational capabilities (e.g., authentication, protected sessions, realm join/create, realtime movement, message exchange, validation/error handling) are marked as high priority, while secondary or enhancement-level features are sequenced later. This prioritization supports MVP delivery under time constraints while preserving strategic scope.

Third, analysis outcomes are connected to implementation and testing through RTM mappings. Each major requirement has associated backend/frontend targets and verification case identifiers, enabling requirement-by-requirement progress tracking.

Finally, quality-oriented analysis is integrated through non-functional attributes and measurable scenarios. Security, performance, reliability, usability, and compatibility constraints are translated into testable acceptance metrics, ensuring that the project evaluates not only whether features exist, but whether they behave acceptably in realistic operating conditions.

Overall, the analysis approach demonstrates a structured transition from business intent to user value, then to technical specification, implementation, and verification evidence.
