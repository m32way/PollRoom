# 💻 Implementation Documentation

## ⚡ **TL;DR - Development Context**

**3-day serverless implementation** with **Context7 MCP** guidance. Structured development process with validation checkpoints and research-based learning.

**Tools**: Next.js + Supabase + Vercel deployment. **Process**: Setup → API → UI → Real-time → Deploy.

## 🎯 **Context Selection for Development**

### **🚀 Quick Start (First-Time Developers)**

1. **Read**: [development-rules.md](./development-rules.md) 🔧 **ESSENTIAL FIRST**
2. **Follow**: [serverless-implementation.md](./serverless-implementation.md) (3-day guide)
3. **Reference**: [linear-tickets.md](./linear-tickets.md) for task tracking

### **📚 Complete Implementation Context**

| Document                                                           | Purpose                          | When to Use                   | Complexity |
| ------------------------------------------------------------------ | -------------------------------- | ----------------------------- | ---------- |
| **[development-rules.md](./development-rules.md)**                 | 🔧 **Context engineering rules** | Before any development work   | ⭐         |
| **[serverless-implementation.md](./serverless-implementation.md)** | 3-day MVP implementation guide   | Active serverless development | ⭐⭐       |
| **[step-by-step-guide.md](./step-by-step-guide.md)**               | 12-day performance-first guide   | Future scale implementation   | ⭐⭐⭐⭐   |
| **[local-development.md](./local-development.md)**                 | Local environment setup          | Development environment       | ⭐⭐       |
| **[linear-tickets.md](./linear-tickets.md)**                       | Project management tickets       | Task tracking and planning    | ⭐⭐       |

## 🧠 **Context Engineering for Development**

### **Tool Usage Guidelines**

See [development-rules.md](./development-rules.md) for complete Context7 MCP usage rules and development guidelines.

### **Quick Reference**

- **Navigation**: [../NAVIGATION.md](../NAVIGATION.md) - Complete documentation navigation
- **Development Rules**: [development-rules.md](./development-rules.md) - Essential development guidelines
- **Implementation Guide**: [serverless-implementation.md](./serverless-implementation.md) - 3-day MVP guide

## 📋 **Implementation Roadmap Context**

### **Phase 1: Foundation (Day 1)**

```
Setup Context:
├── Project foundation (GitHub, Next.js, dependencies)
├── Supabase database (schema, RLS, real-time)
└── Environment configuration (Vercel KV, env vars)

Context Sources:
- Serverless Implementation Guide: Day 1
- Development Rules: Project setup standards
- Architecture docs: Technology justification
```

### **Phase 2: Core Features (Day 2)**

```
API Context:
├── Room management (create, join, codes)
├── Poll creation (yes/no, rating, multiple choice)
├── Voting logic (sessions, deduplication)
└── Results aggregation (real-time updates)

Context Sources:
- MVP Specs: Feature requirements
- User Stories: Usage scenarios
- Security Architecture: Vote integrity
```

### **Phase 3: Frontend & Deployment (Day 3)**

```
UI Context:
├── Mobile-first components (Tailwind CSS)
├── Real-time subscriptions (Supabase)
├── Optimistic UI updates
└── Production deployment (Vercel)

Context Sources:
- User Stories: UI interaction patterns
- Implementation Guide: Component structure
- Testing Strategy: Validation scenarios
```

## 🔧 **Development Tools Context**

### **Required Development Stack**

```bash
# Core Framework
Next.js 15        # React framework with App Router
TypeScript        # Type safety and better DX
Tailwind CSS      # Mobile-first styling

# Backend Services
Supabase          # Database + Real-time + Auth
Vercel KV         # Session management
Vercel Functions  # Serverless API

# Development Tools
Context7 MCP      # Documentation and learning
GitHub MCP        # Code repository management
Vercel MCP        # Deployment and monitoring
```

### **Context Engineering Workflow**

1. **Plan Task**: Check implementation guides for context
2. **Research**: Use Context7 MCP for unfamiliar technologies
3. **Implement**: Follow development rules and patterns
4. **Validate**: Test against user stories and acceptance criteria
5. **Document**: Update rules with new learnings

## 🎯 **Context Isolation by Development Phase**

### **Infrastructure Context**

- **Local Setup**: [local-development.md](./local-development.md)
- **Environment**: Supabase + Vercel accounts and configuration
- **Dependencies**: Package.json with exact versions

### **Backend Context**

- **Database**: Schema design and Row-Level Security policies
- **API Routes**: REST endpoints for rooms, polls, votes
- **Sessions**: Anonymous user tracking with Vercel KV

### **Frontend Context**

- **Components**: Reusable UI components with Tailwind
- **State Management**: Zustand for client state
- **Real-time**: Supabase subscriptions for live updates

### **Testing Context**

- **User Scenarios**: Test against all user stories
- **Performance**: Validate latency and mobile experience
- **Cross-browser**: Ensure compatibility across devices

## 📊 **Development Quality Context**

### **Code Quality Standards**

```typescript
// Context: Clean, typed, documented code
interface PollData {
  id: string;
  question: string;
  type: "yes-no" | "rating" | "multiple-choice";
  options?: string[];
}

// Context: Error handling patterns
try {
  const result = await createPoll(pollData);
  return { success: true, data: result };
} catch (error) {
  console.error("Poll creation failed:", error);
  return { success: false, error: error.message };
}
```

### **Testing Standards**

- **Unit Tests**: Core business logic (vote validation, room codes)
- **Integration**: API endpoints with database operations
- **E2E Tests**: Complete user scenarios from user stories
- **Performance**: Load testing with 10+ concurrent users

## 🚀 **Next Steps by Experience Level**

### **👶 Junior Developers**

1. **Start**: [development-rules.md](./development-rules.md) - Learn the rules
2. **Follow**: [serverless-implementation.md](./serverless-implementation.md) - Step-by-step
3. **Use**: Context7 MCP for learning new technologies
4. **Validate**: Test against user stories frequently

### **👨‍💻 Senior Developers**

1. **Review**: [development-rules.md](./development-rules.md) - Understand standards
2. **Plan**: [linear-tickets.md](./linear-tickets.md) - Task breakdown
3. **Optimize**: Focus on performance and security contexts
4. **Mentor**: Help junior developers with context selection

### **🏗️ Team Leads**

1. **Strategy**: Choose serverless vs performance-first route
2. **Planning**: Break down work using Linear tickets
3. **Quality**: Ensure adherence to development rules
4. **Context**: Guide team on when to use Context7 MCP

---

_Implementation context optimized for efficient development workflow and learning_
