# User Story Template

## 📝 **Context Writing Template for User Stories**

Use this template to maintain consistent context structure across all user stories.

### **Story Format**
```
As a [user type],
I want to [action/goal],
So that [benefit/value].
```

### **Context Structure**

#### **1. User Context**
- **Primary User**: Who is the main user?
- **User Role**: What is their role/responsibility?
- **User Goal**: What are they trying to achieve?
- **User Environment**: Where/when do they use this?

#### **2. Functional Context**
- **Trigger**: What initiates this user story?
- **Main Flow**: Step-by-step primary flow
- **Alternative Flows**: What other paths exist?
- **Error Scenarios**: What can go wrong?

#### **3. Acceptance Criteria**
```
Given [initial context/state],
When [action/trigger occurs],
Then [expected outcome/behavior].
```

#### **4. Technical Context**
- **API Requirements**: What backend support is needed?
- **UI Requirements**: What interface elements are needed?
- **Performance Requirements**: Response time, load requirements
- **Security Requirements**: Any special security considerations

#### **5. Testing Context**
- **Happy Path Test**: Primary successful scenario
- **Edge Case Tests**: Boundary conditions and errors
- **Integration Tests**: Cross-system requirements
- **User Acceptance Tests**: End-to-end validation

### **Example Implementation**

#### **User Story**: Room Creation
```
As a corporate trainer,
I want to create a poll room with a shareable code,
So that my workshop participants can join and provide feedback.
```

#### **User Context**
- **Primary User**: Corporate trainer running workshops
- **User Role**: Facilitator managing group feedback
- **User Goal**: Collect anonymous participant feedback
- **User Environment**: Conference room with projector, participants with mobile devices

#### **Functional Context**
- **Trigger**: Trainer clicks "Create Room" button
- **Main Flow**: 
  1. System generates unique 6-character code
  2. Room created with 24-hour expiration
  3. Trainer receives shareable room code
  4. Room URL displayed for easy sharing
- **Alternative Flows**: Custom room name, extended duration
- **Error Scenarios**: Code generation failure, database unavailable

#### **Acceptance Criteria**
```
Given a trainer is on the landing page,
When they click "Create Room",
Then a unique 6-character room code is generated and displayed.

Given a room is created,
When 24 hours pass,
Then the room automatically expires and becomes inaccessible.
```

#### **Technical Context**
- **API Requirements**: POST /api/rooms/create endpoint
- **UI Requirements**: Create room button, code display, sharing options
- **Performance Requirements**: <500ms room creation time
- **Security Requirements**: Unique code generation, no collision handling

#### **Testing Context**
- **Happy Path Test**: Create room → Receive valid code → Share successfully
- **Edge Case Tests**: Simultaneous creation, code collisions, network failures
- **Integration Tests**: Database storage, real-time updates
- **User Acceptance Tests**: End-to-end room creation and participant joining

---

*Template optimized for context engineering and consistent story structure*
