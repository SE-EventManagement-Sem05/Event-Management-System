# Usability Test Report — EMS-NFR-02

## Event Management System

**Document date:** 17 November 2026

**Requirement:** EMS-NFR-02

**Status:** Complete.

## 1. Requirement

A first-time user should be able to sign up and log in within two minutes without assistance.

## 2. Objective

To evaluate whether a first-time user can independently complete the signup and login journey within the specified two-minute limit.

## 3. Test method

Five first-time participants are to complete the same task using the same application build and browser configuration. Participants must not have used the EMS application before the test. No coaching or task-specific assistance is to be provided.

For each participant:

1. Start the timer when the participant begins the signup task.
2. Record the time at which the account creation confirmation is displayed.
3. Continue timing while the participant proceeds to the login page and enters valid credentials.
4. Stop the timer when the participant successfully reaches the dashboard corresponding to the registered role.
5. Record signup duration, login duration, combined duration, errors encountered and whether assistance was required.

**Pass criterion:** If the requirement is interpreted as the complete signup-plus-login journey taking no more than two minutes, the combined duration for each participant must be less than or equal to 120 seconds, with no assistance.

## 4. Test environment

| Item | Value to record during the actual test |
| --- | --- |
| Frontend URL | http://localhost:5173/ |
| Browser | Google Chrome |
| Operating system | Windows 11 |
| Test date | 17-11-2026 |
| Test coordinator | Sharanya R |

## 5. Participant results

| Participant | Signup time | Login time | Combined time | Within 120 seconds? |
| --- | --- | --- | --- | --- |
| U1 | 1 min 03 sec | 28 sec | 1 min 31 sec | Yes |
| U2 | 1 min 11 sec | 34 sec | 1 min 45 sec | Yes |
| U3 | 57 sec | 31 sec | 1 min 28 sec | Yes |
| U4 | 1 min 14 sec | 38 sec | 1 min 52 sec | Yes |
| U5 | 1 min 06 sec | 32 sec | 1 min 38 sec | Yes |

**Calculation:** The sample combined durations range from 1 minute 28 seconds to 1 minute 52 seconds. All 5 participants were able to successfully complete sign-in and login without external help such as instruction manual or explicit verbal instruction. Thus, the test has passed.

## 6. Video evidence

As see from the uploaded Videos for Sprint 1 and Sprint 2 demonstration, the entire login and sign-up took 31 seconds when done consecutively.

## 7. Result and conclusion

**Result: PASS**

The usability test for EMS-NFR-02 was successfully conducted with five different participants to evaluate whether a first-time user could independently complete the signup and login process within the specified two-minute limit.

All five participants successfully completed the signup and login workflows within the required time. No assistance was required during the process.

The test results confirmed that:

* All five participants successfully completed user registration.
* All five participants successfully logged in using their registered credentials.
* Each participant completed the signup and login process within two minutes.
* The application successfully redirected users to the appropriate interface after login.
* The demonstrated signup workflow was also reviewed through the videos, which shows that registration can be completed in less than two minutes.

Therefore, the system satisfies EMS-NFR-02, which specifies that a first-time user should be able to sign up and log in within two minutes without assistance.

**Final Status: PASS — 5 out of 5 participants successfully met the requirement.**
