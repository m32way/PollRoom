# PollRoom - User Stories & Scenarios

<!-- AI-CONTEXT: ESSENTIAL | BUSINESS-LOGIC | USER-FLOWS | REQUIREMENTS -->
<!-- TAGS: business, user-stories, requirements, flows, logic, mvp -->

## 👩‍🏫 Sarah Chen - Corporate Trainer

### Story 1: Workshop Confidence Check

**As a corporate trainer**, I want to gauge my audience's understanding during a workshop so I can adjust my teaching approach in real-time.

**Scenario:**

- Sarah is teaching a new software process to 25 employees
- She creates a room with code "TRAIN789" and displays it on screen
- After explaining step 3, she asks: "Rate your confidence with this process from 1-5"
- All 25 people vote anonymously on their phones
- Results show: 40% at level 2, 35% at level 3, 25% at level 4
- Sarah realizes most people need more practice and adjusts her approach

**Acceptance Criteria:**

- Room code is easy to read and type
- Voting takes less than 30 seconds
- Results appear instantly
- No one can see individual votes

### Story 2: Pre-Workshop Assessment

**As a corporate trainer**, I want to understand my audience's current knowledge level before starting so I can tailor my content appropriately.

**Scenario:**

- Sarah starts a new training session with 30 people
- She creates room "SKILLS456" and asks: "How familiar are you with this software?"
- Options: Never used it, Used it once, Used it monthly, Use it daily
- Results: 60% never used it, 30% used it once, 10% use it monthly
- Sarah adjusts her presentation to focus more on basics

### Story 3: Remote Participant Inclusion

**As a corporate trainer**, I want to include remote participants in my polling so they feel engaged and I get their input too.

**Scenario:**

- Sarah has 20 in-person attendees and 10 remote participants
- She creates room "HYBRID123" and shares the code in the video call chat
- She asks: "Which department do you work in?"
- All 30 people vote, including the remote participants
- Sarah can see responses from both groups and address questions from remote attendees

## 🎤 Mike Rodriguez - Event Organizer

### Story 4: Conference Session Feedback

**As an event organizer**, I want to get real-time feedback from conference attendees so I can improve future events and keep sessions engaging.

**Scenario:**

- Mike is organizing a tech conference with 200 attendees
- During a keynote, he creates room "CONF2024" and displays it on screen
- Speaker asks: "How many of you have used AI tools in your work?"
- Options: Never, Occasionally, Regularly, Daily
- Results show 45% use AI regularly, surprising the speaker
- This leads to a more relevant discussion about AI implementation

### Story 5: Breakout Session Planning

**As an event organizer**, I want to understand attendee preferences for breakout sessions so I can allocate rooms appropriately.

**Scenario:**

- Mike has 3 breakout session options and needs to assign 150 people
- He creates room "BREAKOUTS" and asks: "Which session interests you most?"
- Options: AI & Machine Learning, Cloud Security, DevOps Best Practices
- Results: 50% AI, 30% Security, 20% DevOps
- Mike allocates the largest room to AI session and adjusts accordingly

## 👥 Jennifer Kim - Small Business Team Lead

### Story 6: Team Decision Making

**As a team lead**, I want to get honest input from my team on important decisions so we can make choices that everyone supports.

**Scenario:**

- Jennifer's team of 8 needs to choose between two software vendors
- She creates room "DECISION789" and asks: "Which vendor do you prefer?"
- Options: Vendor A (cheaper, basic features), Vendor B (expensive, advanced features)
- Results: 75% prefer Vendor A, 25% prefer Vendor B
- The team discusses the results and decides on Vendor A with a plan to upgrade later

### Story 7: Meeting Effectiveness Check

**As a team lead**, I want to know if my team meetings are actually useful so I can improve our collaboration.

**Scenario:**

- Jennifer ends a weekly team meeting and creates room "MEETING456"
- She asks: "How useful was today's meeting?"
- Options: Very useful, Somewhat useful, Not very useful, Waste of time
- Results: 50% somewhat useful, 25% not very useful, 25% waste of time
- Jennifer realizes she needs to restructure meetings to be more focused

## 🎓 Dr. Lisa Wang - University Professor

### Story 8: Lecture Engagement

**As a professor**, I want to check student understanding during lectures so I can adjust my teaching pace and content.

**Scenario:**

- Dr. Wang is teaching a statistics class to 40 students
- She creates room "STATS101" and asks: "Do you understand the concept of standard deviation?"
- Options: Yes, completely, Mostly, Somewhat, Not at all
- Results: 30% completely, 40% mostly, 20% somewhat, 10% not at all
- She decides to spend more time on examples before moving to the next topic

### Story 9: Exam Preparation

**As a professor**, I want to know which topics students find most challenging so I can focus my review sessions.

**Scenario:**

- Before a midterm exam, Dr. Wang creates room "REVIEW789"
- She asks: "Which topic do you find most challenging?"
- Options: Probability, Hypothesis Testing, Regression Analysis, Data Visualization
- Results: 45% hypothesis testing, 30% regression, 15% probability, 10% visualization
- She schedules extra office hours focused on hypothesis testing

## 🏢 David Chen - HR Manager

### Story 10: Employee Satisfaction Survey

**As an HR manager**, I want to get anonymous feedback from employees about workplace satisfaction so I can address concerns confidentially.

**Scenario:**

- David wants to check employee morale after a recent policy change
- He creates room "FEEDBACK123" and asks: "How satisfied are you with the new remote work policy?"
- Options: Very satisfied, Satisfied, Neutral, Dissatisfied, Very dissatisfied
- Results: 20% very satisfied, 40% satisfied, 25% neutral, 15% dissatisfied
- David sees the policy is generally well-received but plans to address the 15% who are dissatisfied

## 🎯 Common User Patterns

### The "Quick Check" Pattern

- **When**: During presentations or meetings
- **Goal**: Get immediate feedback on understanding or opinion
- **Typical question**: "How confident are you with this topic?"
- **Expected response time**: 30-60 seconds
- **Follow-up**: Adjust content based on results

### The "Decision Making" Pattern

- **When**: Team needs to choose between options
- **Goal**: Get honest preferences without group pressure
- **Typical question**: "Which option do you prefer?"
- **Expected response time**: 1-2 minutes
- **Follow-up**: Discuss results and make final decision

### The "Engagement Check" Pattern

- **When**: Want to ensure audience is paying attention
- **Goal**: Break up monotony and re-engage participants
- **Typical question**: "How is everyone feeling about this session?"
- **Expected response time**: 30 seconds
- **Follow-up**: Acknowledge feedback and continue

## 🚫 Anti-Patterns (What Users Don't Want)

### The "Overcomplicated" Pattern

- **Problem**: Too many poll types or options
- **User reaction**: Confusion, low participation
- **Solution**: Keep it simple, focus on core poll types

### The "Registration Required" Pattern

- **Problem**: Asking participants to sign up
- **User reaction**: Low participation, frustration
- **Solution**: Anonymous voting with just room codes

### The "Slow Results" Pattern

- **Problem**: Delayed or no real-time updates
- **User reaction**: Loss of engagement, questioning if votes counted
- **Solution**: Instant result updates via WebSockets

---

_Created: December 2024_  
_Focus: Real-world usage scenarios and user behavior patterns_
