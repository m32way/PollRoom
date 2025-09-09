# API Specification Template

## 📝 **Context Writing Template for API Documentation**

Use this template to maintain consistent context structure across all API specifications.

### **API Context Structure**

#### **1. Endpoint Overview**
```
METHOD /api/endpoint/path
Purpose: [Clear description of what this endpoint does]
Context: [When and why this endpoint is used]
```

#### **2. Request Context**
```typescript
// Request Headers
interface RequestHeaders {
  'Content-Type': 'application/json';
  'Authorization'?: string;  // If authentication required
}

// Request Body
interface RequestBody {
  // Define all request parameters with types
  parameter: string;
  optional?: number;
}

// Path Parameters
interface PathParams {
  id: string;  // URL parameters
}

// Query Parameters
interface QueryParams {
  limit?: number;
  offset?: number;
}
```

#### **3. Response Context**
```typescript
// Success Response
interface SuccessResponse {
  success: true;
  data: ResponseData;
  meta?: {
    total?: number;
    page?: number;
  };
}

// Error Response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

#### **4. Business Logic Context**
- **Validation Rules**: What inputs are validated and how?
- **Processing Logic**: What business logic is applied?
- **Side Effects**: What other systems/data are affected?
- **State Changes**: How does this endpoint change application state?

#### **5. Security Context**
- **Authentication**: Who can access this endpoint?
- **Authorization**: What permissions are required?
- **Input Validation**: How are inputs sanitized?
- **Rate Limiting**: Are there usage limits?

#### **6. Performance Context**
- **Expected Latency**: Typical response time
- **Scalability**: How does it perform under load?
- **Caching**: Are responses cacheable?
- **Database Impact**: Query complexity and optimization

#### **7. Error Scenarios**
```typescript
// Common Error Codes
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;
```

### **Example Implementation**

#### **Endpoint**: Create Poll
```
POST /api/polls/create
Purpose: Create a new poll in a specific room
Context: Used by room creators to add polls for participant voting
```

#### **Request Context**
```typescript
// Request Headers
interface CreatePollHeaders {
  'Content-Type': 'application/json';
}

// Request Body
interface CreatePollRequest {
  roomId: string;           // Required: Room UUID
  question: string;         // Required: Poll question (1-200 chars)
  type: 'yes-no' | 'rating' | 'multiple-choice';
  options?: string[];       // Required for multiple-choice
  scale?: {                 // Required for rating
    min: number;
    max: number;
  };
}
```

#### **Response Context**
```typescript
// Success Response
interface CreatePollSuccess {
  success: true;
  data: {
    id: string;
    roomId: string;
    question: string;
    type: string;
    options?: string[];
    scale?: { min: number; max: number };
    createdAt: string;
    isActive: boolean;
  };
}

// Error Response
interface CreatePollError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'ROOM_NOT_FOUND' | 'UNAUTHORIZED';
    message: string;
    details?: {
      field?: string;
      reason?: string;
    };
  };
}
```

#### **Business Logic Context**
- **Validation Rules**: 
  - Question length: 1-200 characters
  - Multiple choice: 2-5 options, each 1-50 characters
  - Rating scale: min < max, range 2-10
- **Processing Logic**: Generate UUID, validate room existence, store in database
- **Side Effects**: Real-time notification to room participants
- **State Changes**: Poll becomes available for voting

#### **Security Context**
- **Authentication**: Room creator session validation
- **Authorization**: Only room creators can create polls
- **Input Validation**: Sanitize question and options, validate types
- **Rate Limiting**: 10 polls per minute per session

#### **Performance Context**
- **Expected Latency**: <200ms typical, <500ms p95
- **Scalability**: Database write + real-time notification
- **Caching**: Not cacheable (creates new resource)
- **Database Impact**: Single INSERT, room validation query

#### **Error Scenarios**
```typescript
// 400 - Validation Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid poll configuration',
    details: {
      field: 'question',
      reason: 'Question cannot be empty'
    }
  }
}

// 404 - Room Not Found
{
  success: false,
  error: {
    code: 'ROOM_NOT_FOUND',
    message: 'Room does not exist or has expired'
  }
}

// 401 - Unauthorized
{
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'Only room creators can create polls'
  }
}

// 429 - Rate Limited
{
  success: false,
  error: {
    code: 'RATE_LIMITED',
    message: 'Too many polls created. Please wait before creating another.'
  }
}
```

#### **Testing Context**
```typescript
// Test Cases
describe('POST /api/polls/create', () => {
  it('creates valid yes-no poll', async () => {
    // Happy path test
  });
  
  it('validates question length', async () => {
    // Edge case: empty question, too long question
  });
  
  it('requires valid room', async () => {
    // Error case: invalid room ID
  });
  
  it('enforces rate limiting', async () => {
    // Performance case: rapid poll creation
  });
});
```

---

*Template optimized for comprehensive API documentation with context engineering principles*
