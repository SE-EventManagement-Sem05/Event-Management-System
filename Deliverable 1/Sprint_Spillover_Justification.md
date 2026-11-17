\# Iteration Plan Difference and Schedule Re-baselining



\## Event Management System



\*\*Document date:\*\* 17 November 2026



\*\*Iterations covered:\*\* 6 October–2 November 2026



\## 1. Purpose



This document explains the difference between the initial two-iteration delivery assumption and the revised three-iteration allocation used during implementation. The change was a scheduling and work-allocation adjustment; it did not remove any of the 14 functional requirements or 6 non-functional requirements from the planned project scope.



\## 2. Initial two-iteration planning assumption



At the beginning of the project, the team estimated that the complete set of 20 requirements could be delivered in two iterations, with approximately 12, 8 requirements allocated to each iteration. The initial estimate assumed that the requirements could be implemented with relatively limited cross-feature integration and that implementation, validation and regression testing would fit within the planned iteration capacity.



The following table records the distribution of the original scope for comparison.



| Initial iteration | Planned period | Functional requirements | Non-functional requirements | Total |

| --- | --- | --- | --- | --- |

| Initial Iteration 1 | 6–12 October | FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-08, FR-09 | NFR-01, NFR-02, NFR-03, NFR-04 | 12 |

| Initial Iteration 2 | 13–19 October | FR-07, FR-10, FR-11, FR-12, FR-13, FR-14 | NFR-05, NFR-06 | 8 |



The initial allocation was an estimation baseline. The detailed implementation effort became clearer as the team worked through the dependencies between the frontend, backend, authentication, data persistence and validation paths.



\## 3. Reason for revising the plan



The initial estimate did not fully account for the implementation and verification effort associated with cross-layer dependencies. Several requirements that appeared independent at the planning stage depended on shared application behavior and needed to be developed and validated together.



Examples included:



\* \*\*Authentication and role-based routing\*\* required coordination between credential validation, JWT issuance, protected backend endpoints, session handling and role-specific frontend navigation.

\* \*\*Host event management\*\* required consistent event validation, ownership checks, persistence, listing, details retrieval and edit behavior.

\* \*\*Attendee discovery and registration\*\* involved event search/filtering, upcoming/past classification, registration eligibility, duplicate prevention and capacity validation.

\* \*\*Simulated payment and reviews\*\* required additional authorization, transaction/review persistence, eligibility rules, duplicate handling and event-detail integration.

\* \*\*Non-functional requirements\*\* required separate verification work, including performance measurement, responsive checks, environment configuration, failure handling and pagination/efficiency checks.



As implementation progressed, the actual effort required for integration, edge-case handling, testing and correction was greater than the original estimate. Completing all remaining requirements within the original two-iteration window would have increased the risk of incomplete integration or insufficient verification.



The team therefore revised the schedule and distributed the outstanding work across a third iteration. This was a scope-preserving re-planning decision: unfinished work was moved to a later iteration rather than being treated as completed.



\## 4. Revised iteration allocation



| Iteration | Period | Functional requirements | Non-functional requirements |

| --- | --- | --- | --- |

| Iteration 1 | 6–12 October | FR-01, FR-02, FR-03 | — |

| Iteration 2 | 13–19 October | FR-05, FR-06, FR-07, FR-12, FR-14 | NFR-01, NFR-03, NFR-05 |

| Iteration 3 | 26 October–2 November | FR-04, FR-08, FR-09, FR-10, FR-11, FR-13 | NFR-02, NFR-04, NFR-06 |



\## 5. Explanation of the redistribution



\*\*Iteration/Sprint 1 — foundational access and authentication (6–12 October)\*\*



The first iteration concentrated on the public entry point, account registration and login. These features established the foundation required by the role-specific workflows. FR-01, FR-02 and FR-03 were retained in this iteration.



\*\*Iteration/Sprint 2 — host workflows, feedback and core quality requirements (13–19 October)\*\*



The second iteration focused on host event management and event details, together with ratings/reviews and user-facing error handling. Performance, responsive layout and environment configuration were also allocated to this iteration. This grouping allowed the team to validate the event-management foundation and its supporting quality requirements. In this sprint, the testing was done as and when the code files were constructed to show the proper working of the code.



\*\*Iteration/Sprint 3 — role integration and attendee transaction workflows (26 October–2 November)\*\*



The third iteration completed role-specific routing and the attendee-facing event lifecycle: viewing events, searching/filtering, registering, completing simulated payment and logging out. Usability, reliability and efficiency requirements were allocated here because their verification depended on a more complete end-to-end application flow and the integrated event/data operations. In the sprint, additional testing for coverage, system acceptance and coverage were implemented, and the test architecture was changed in order to centralise all different types of tests under one folder (`/tests`) to make the control and report-generation more controlled.



\## 6. Effect on project scope and delivery



\* The project retained the original 14 functional requirements and 6 non-functional requirements.

\* No requirement was removed to accommodate the revised schedule.

\* Work was redistributed to allow dependent features and their validation to be completed in a more controlled sequence.

\* The revised plan provided additional time for integration, edge-case handling and regression testing.

\* Iteration 3 represents the completion of requirements that were not included in the completed scope of the first two iterations.



\## 7. Formal justification



The transition from two iterations to three was the result of an estimation variance identified during implementation. The original schedule was based on a high-level assessment of requirement count and anticipated implementation effort. Once detailed development began, the team identified additional integration dependencies and validation scenarios that were not fully represented in the initial estimate. These included role-based access enforcement, consistency between API and UI behavior, data integrity constraints, error recovery and the verification of non-functional requirements.



Rather than reducing the quality of implementation or recording partially completed functionality as complete, the team re-baselined the iteration plan and allocated the remaining requirements to a third iteration. This adjustment provided a more realistic delivery schedule while preserving the original project scope and allowing the remaining functionality to be integrated and tested.

