# Software Requirements Specification: Event Management System

## 1. Introduction

### 1.1 Purpose

The purpose of this Software Requirements Specification (SRS) is to describe the requirements and features of the Event Management System. The system is designed to help users discover and register for events, while allowing hosts to create and manage their events.

### 1.2 Scope

The Event Management System is a web-based application that allows users to either act as Hosts or Attendees. Hosts can create and manage events, while Attendees can search for events based on their location and interests, view event details, register for events, book events, and provide ratings and reviews.

The system will also provide location-based event suggestions and allow hosts to promote their events as featured events. Payment for events will only be simulated, and no actual financial transaction will be carried out.

### 1.3 Definitions, Acronyms \& Abbreviations

| Term | Meaning |

|------|---------|

| SRS | Software Requirements Specification |

| FR | Functional Requirement |

| NFR | Non-Functional Requirement |

| JWT | JSON Web Token |

| MERN | MongoDB, Express, React, Node |

| REST API | Representational State Transfer Application Programming Interface |

### 1.4 Overview

This SRS document describes the overall requirements of the Event Management System.

Section 2 gives an overall description of the system, including its users, functions, constraints, assumptions, and dependencies. Section 3 describes the specific functional and non-functional requirements of the system. Section 4 contains supporting information and appendices.

---

## 2. Overall Description

### 2.1 Product Perspective

#### 2.1.1 System Interfaces

The Event Management System is a web-based application that interacts with users through a web browser and communicates with its backend and databases through defined software interfaces.

The major system interfaces are:

- **Frontend–Backend Interface:** The React frontend communicates with the Node.js/Express backend through REST APIs over HTTP/HTTPS.

- **Backend–Database Interfaces:** The backend communicates with MongoDB for application data and SQLite for authentication records using appropriate database drivers.

- **Authentication Interface:** The system uses JSON Web Tokens (JWT) to authenticate and authorize requests to protected resources.

- **Browser Interface:** Users access the application through a modern web browser such as Google Chrome, Mozilla Firefox, or Microsoft Edge.

#### 2.1.2 User Interfaces

The system has a graphical web-based user interface which can be accessed via web browsers. The interfaces are visually pleasing, intuitive, and responsive to navigate through.

This includes role-based access between the Host user and Attendee user. The interface shall provide the following functionalities based on the role:

- **Landing Page:** Provides information about the platform and options to sign up or log in.

- **Signup Interface:** Allows users to register as either a Host or an Attendee.

- **Login Interface:** Allows users to select their role and enter their credentials.

- **Host Dashboard:** Allows hosts to view their past and upcoming events and access event statistics, ratings, reviews, and revenue information.

- **Attendee Dashboard:** Allows attendees to view past and upcoming registered events and discover new events.

- **Event Discovery Interface:** Allows attendees to search and filter events based on location and interests.

- **Mock Payment Interface:** Provides a simulated payment process for event registration.

- **Feedback Interface:** Allows eligible attendees to submit ratings and reviews for events.

#### 2.1.3 Hardware Interfaces

The system does not require any specialised hardware, and the only requirement is the user's desktop, laptop, or mobile device. The server is to be cloud hosted.

#### 2.1.4 Software Interfaces

The system shall use the following software components:

- **Frontend:** React.js

- **Backend:** Node.js with Express.js

- **Application Database:** MongoDB

- **Authentication Database:** SQLite

- **Authentication:** JWT

- **Web Browser:** A modern browser such as Chrome, Firefox, or Microsoft Edge

MongoDB shall store application data including events, user profiles, reviews, and transactions, while SQLite shall be used for authentication records.

#### 2.1.5 Communications Interfaces

- The system shall use RESTful APIs over HTTP/HTTPS for communication between the React frontend and Node.js/Express backend.

- The backend shall communicate with MongoDB and SQLite using their appropriate database drivers.

- Authenticated requests to protected resources shall include a valid JWT using the authentication mechanism defined by the system.

#### 2.1.6 Memory Constraints

- The system shall use memory efficiently at both the frontend and server levels.

- The frontend shall store only the temporary state and data required for application operation and shall avoid unnecessary storage of large event data or objects.

- The server shall avoid unnecessary records and unbounded caching and shall use efficient database queries.

- Database indexing shall be used for frequently queried fields where appropriate.

#### 2.1.7 Operations

**Application Start**

The system operator shall:

1. Start the MongoDB service/database.

2. Initialize/access the SQLite authentication database.

3. Start the Node.js/Express backend.

4. Start or serve the React frontend.

5. Access the application through a supported browser.

**User Registration Operation**

Users shall be able to:

1. Open the signup page.

2. Select Host or Attendee.

3. Enter registration/sign-up information.

4. Submit the form.

5. Receive registration confirmation or an error message.

**Login Operation**

Users shall:

1. Open the login page.

2. Select their role.

3. Enter credentials.

4. Submit the login form.

5. Receive a JWT after successful authentication as part of the login process.

6. Be redirected to their corresponding dashboard.

**Host shall be able to:**

- Login.

- View historical events and feedback on them.

- View their own upcoming events.

- Select an event.

- View event details.

- View attendee statistics.

- View ratings, reviews, and booking revenue for each event.

- View how their event looks on the page/dashboard.

**Attendee shall be able to:**

- Login.

- View historical events they have attended, i.e., events they have booked previously.

- View new events as they appear on their feed.

- Search for events.

- Filter events.

- View event details.

- Register for an event.

- Complete simulated payment where applicable.

- View the registered event under upcoming events, sorted date-wise.

- Rate eligible events and give feedback accordingly.

- Submit reviews/comments.

- Complete the Payment Operation. The payment operation shall be simulated.

Users shall be able to log out at any time from authenticated portions of the application.

**Error Recovery**

The system shall provide appropriate feedback/error messages when:

- The backend is unavailable.

- A database cannot be accessed.

- Authentication fails.

- A JWT expires.

- An event cannot be found.

- Registration fails.

- Simulated payment fails.

The system should allow the user to retry appropriate operations without requiring a restart.

#### 2.1.8 Site Adaptation Requirements

- The environment-specific variables shall be put into `.env` files which are customised for different environments. These include configured environment variables such as MongoDB URI, Backend Port, SQLite Path, and JWT Secret Token.

- The system shall provide appropriate device support for both PCs and mobile devices via the browser.

### 2.2 Product Functions

- **Landing page:** A very aesthetic, eye-pleasing page which shows the advantages of the website and has the signup/login button.

- **Signup page:** Has two options: (A) Signup as HOST, (B) Signup as ATTENDEE. This requires JWT + SQLite-based authentication.

- **Login page:** The user can select their role from a dropdown box, and the credentials are verified.

- **Dashboards:** After login, the respective dashboards are displayed.

  - **If logged in as Host:** All the events hosted by them in the past [under the History tab] and current events being hosted [under the Upcoming tab] are shown. Upon clicking an event, the entire event details, statistics about the number of attendees, ratings, reviews, revenue, etc. are displayed.

  - **If logged in as Attendee:** The recommended events for the user are shown, along with all the events attended by them in the past [under the History tab] and current events being attended [under the Upcoming tab], which are shown in a different "Personal Events" page. There is also an option to search for new events based on location, interests, etc., and a Find Events tab. In the Find Events tab, upon finding a suitable event, users have the option to pay for the event via the website. This should lead to a false/simulated payment page because it is not in our scope to implement actual payment. This will push the event to the upcoming registered events tab.

### 2.3 User Characteristics

There are two categories of users: the Host and the Attendee. Both users are not expected to be technically proficient, and therefore the application should be easy to use and intuitive to navigate through.

#### Host

A Host is expected to:

- Register an account as a Host.

- Authenticate using valid credentials.

- Create and manage event information.

- Monitor upcoming and active events.

- Review historical events.

- Monitor attendee participation.

- View event ratings, reviews, and feedback.

- View event-related statistics such as registration count and revenue.

The Host is assumed to have basic familiarity with:

- Web browsers and navigating through a website.

- Forms.

- Searching and viewing information.

- Basic event-management concepts.

#### Attendee

An Attendee is expected to:

- Register as an Attendee.

- Log into the system.

- Search for events.

- Evaluate event information.

- Register for suitable events.

- Complete the simulated payment process when required.

- View upcoming registered events.

- View historical events.

- Submit ratings and reviews.

The Attendee is expected to possess only basic web browsing and form-entry skills.

### 2.4 Constraints

- The technology stack which will be used is the MERN Stack, JWT, and SQLite.

- The payment constraint is that no actual payment application shall be deployed in the test version, and only the transaction records shall be logged.

- The browser constraint is that any modern web browser can be used to navigate through the application.

- The security constraint is that no sensitive authentication information shall be exposed through the frontend.

- The system shall be implemented as a web-based application and shall be accessed through a web browser. Native Android, iOS, or desktop applications are outside the scope of the system.

### 2.5 Assumptions and Dependencies

The system assumes that:

- SQLite is available to the backend.

- Authentication records can be successfully created and retrieved.

- JWT generation and verification mechanisms are available.

- The JWT secret and related configuration are correctly configured.

- The client can retain and transmit the authentication token as required by the implementation.

The dependencies include MongoDB, SQLite, npm modules, a functional modern web browser, and a stable network connection.

The accuracy of information displayed depends upon the hosts having provided the correct information on the event pages.

### 2.6 Apportioning of Requirements

The current version of the Event Management System will implement the core functionality required for event discovery, registration, hosting, authentication, and user feedback.

**Included in the current version:**

- User registration as either a Host or Attendee.

- Role-based user authentication using JWT and SQLite.

- Host event management and viewing of event-related statistics.

- Attendee event search and filtering based on location and interests.

- Viewing event details.

- Event registration.

- Simulated payment for event registration.

- Viewing upcoming and historical events.

- Ratings and reviews for eligible events.

- Secure access to role-specific functionality.

- Responsive web-based user interface.

**Outside the scope of the current version (may be considered for future releases):**

- Integration with real payment gateways such as Razorpay or Stripe.

- Native Android or iOS mobile applications.

- Advanced event recommendation and personalization mechanisms beyond the basic recommendation functionality provided in the current version.

- Additional third-party service integrations.

- Advanced analytics and reporting features beyond the statistics currently specified.

Requirements identified for future releases may be incorporated based on user needs, technical feasibility, and project priorities.

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces

- **Landing Page:** An aesthetic, engaging landing page highlighting all platform features, benefits, and buttons for Signup and Login.

- **Authentication Pages**

  - **Signup Interface:** Option to select user role (Host or Attendee) with form inputs for user details.

  - **Login Interface:** Dropdown selector for user role (Host/Attendee) alongside email/username and password credentials.

- **Event Browsing \& Recommendations Page:** A dedicated browsing page shall display a collection of events recommended to the attendee based on factors such as their location, interests, event categories, and previously viewed or registered events. The page shall present events in an easily browsable format, allowing attendees to discover events without performing a specific search. Each event listing shall provide key information such as the event name, category, location, date, and relevant event details. Selecting an event shall open its detailed event page, where the attendee can view additional information and register for the event.

- **Host Dashboard**

  - **Event Lists:** Tabbed navigation between History (past hosted events) and Upcoming hosted events.

  - **Event Analytics View:** Detailed view per event showing total attendees, ratings, reviews, and total revenue metrics.

- **Attendee Dashboard**

  - **Event Lists:** Tabbed navigation between History (past attended events) and Yet-to-Come (upcoming booked events).

  - **Event Discovery \& Search:** Search and filter tools based on location, interests, and category, including a dedicated Find Events tab.

  - **Mock Payment Gateway Interface:** A simulated payment checkout page to confirm event registration.

  - **Feedback \& Review Interface:** Input form for leaving star ratings and comments on past events.

#### 3.1.2 Software Interfaces

- **Frontend:** React.js Single Page Application styled using CSS frameworks and libraries.

- **Backend:** Node.js with Express.js handling REST API routes.

- **Database:**

  - MongoDB for storing events, user profiles, reviews, and transactions.

  - SQLite for relational authentication records.

- **Authentication Protocol:** JSON Web Tokens (JWT) for secure session management.

### 3.2 System Features / Functional Requirements

#### 3.2.1 Authentication \& Authorization

- **User Registration:** System will allow users to register either as a Host or Attendee.

- **Role-Based Login:** System will authenticate users via a role dropdown (Host vs Attendee) and issue a JWT upon successful SQLite validation.

- **Session Persistence:** Frontend shall store and transmit the JWT token in headers for secure, authenticated requests.

#### 3.2.2 Host Capabilities

- **Dashboard Overview:** Hosts will be able to view their hosted events split into History and Upcoming sections.

- **Event Analytics:** System will display aggregate metrics for selected events, including ticket sales count, revenue generated, star ratings, and attendee comments.

#### 3.2.3 Attendee Capabilities

- **Dashboard Overview:** Attendees will be able to view events they registered for, categorized by History and Upcoming.

- **Event Search \& Filtering:** System will allow searching available events by location and interest categories.

- **Payment Processing:** After selecting an event to join, the user will complete a payment flow, which automatically adds the event to their Upcoming tab.

- **Rating \& Feedback:** Attendees will be able to post ratings and written reviews for events they have attended.

### 3.3 Performance Requirements

- **Response Time:** Authentication and dashboard data loading should execute within 2 seconds under standard network conditions.

- **Recommendation Refresh Time:** The system shall refresh and display updated event recommendations within 2 seconds of a recommendation refresh request under standard network conditions.

- **UI Responsiveness:** The landing page, dashboards, event browsing page, and recommendation interface must render smoothly across major desktop screen resolutions.

### 3.4 Design Constraints

- **Scope Limit:** Real-world payment gateway integrations (e.g., Stripe, Razorpay) are out of scope; the system relies on a mock payment UI flow.

- **Tech Stack:** Backend services should be built using Node.js/Express.js, MongoDB for data storage, and SQLite for user authentication data.

### 3.5 Software System Attributes

- **Security**

  - Authentication credentials must not be stored in plain text.

  - JWT secrets must be securely configured on the server side.

- **Usability:** Intuitive UX with clear tabbed navigation between past and upcoming events for both roles.

---

## 4. Security Requirements

- Protect user authentication credentials from exposure or unauthorized access, both at rest and in transit.

- Ensure that only authenticated, authorized users can access role-specific functionality (Host vs Attendee data/actions).

- All passwords shall be hashed using bcrypt (or equivalent) before storage in SQLite; plaintext passwords shall never be persisted or logged.

- All API endpoints requiring authentication shall reject requests lacking a valid, non-expired JWT with a 401 status code.

- JWT secrets shall be stored only in server-side `.env` files and shall never be exposed to the frontend or included in client-side bundles.

- Session tokens shall expire after a defined interval (e.g., 24 hours), after which the user shall be required to re-authenticate.

---

## UML Diagram

### Use Case Diagram

![UML](images/UML.png)

**Notes on the diagram**

- Both actors connect to **Register / Login**. **Logout** is an `«extend»` of Login, so it has no direct actor link.

- **Register for Event** `«include»`s **Make Simulated Payment**.

- **View Attendee Statistics**, **View Ratings**, **View Reviews** and **View Revenue** are `«extend»` use cases of **View Event Analytics**. Arrows point from the extending use case to the base use case, as in standard UML.
