# 🧭 PollRoom Documentation Navigation

## 🎯 **Purpose**

Single source of truth for navigating PollRoom documentation. Optimized for both human developers and AI agents with context selection matrix and quick reference guides.

## 📋 **Context Selection Matrix**

### **By Task Type**

| Task Type                    | Primary Context                                                                                  | Secondary Context                                                                              | Quick Reference                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Feature Development**      | [03-implementation/development-rules.md](./03-implementation/development-rules.md)               | [02-architecture/serverless-mvp.md](./02-architecture/serverless-mvp.md)                       | [01-business/user-stories.md](./01-business/user-stories.md)                       |
| **API Implementation**       | [02-architecture/serverless-implementation.md](./02-architecture/serverless-implementation.md)   | [context-templates/api-spec-template.md](./context-templates/api-spec-template.md)             | [04-security/security-architecture.md](./04-security/security-architecture.md)     |
| **Database Design**          | [02-architecture/serverless-mvp.md](./02-architecture/serverless-mvp.md)                         | [04-security/security-architecture.md](./04-security/security-architecture.md)                 | [03-implementation/development-rules.md](./03-implementation/development-rules.md) |
| **Security Implementation**  | [04-security/security-architecture.md](./04-security/security-architecture.md)                   | [04-security/compliance-framework.md](./04-security/compliance-framework.md)                   | [03-implementation/development-rules.md](./03-implementation/development-rules.md) |
| **Performance Optimization** | [02-architecture/performance-implementation.md](./02-architecture/performance-implementation.md) | [02-architecture/tech-stack-evaluation.md](./02-architecture/tech-stack-evaluation.md)         | [05-operations/deployment-guide.md](./05-operations/deployment-guide.md)           |
| **Business Logic**           | [01-business/user-stories.md](./01-business/user-stories.md)                                     | [01-business/mvp-specs.md](./01-business/mvp-specs.md)                                         | [03-implementation/development-rules.md](./03-implementation/development-rules.md) |
| **Deployment**               | [05-operations/deployment-guide.md](./05-operations/deployment-guide.md)                         | [02-architecture/serverless-implementation.md](./02-architecture/serverless-implementation.md) | [04-security/testing-strategy.md](./04-security/testing-strategy.md)               |

### **By Question Type**

| Question Type          | Context to Check                                                                       | Example Questions                        |
| ---------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| **"How do I..."**      | [03-implementation/development-rules.md](./03-implementation/development-rules.md)     | "How do I implement real-time features?" |
| **"What is..."**       | [02-architecture/serverless-mvp.md](./02-architecture/serverless-mvp.md)               | "What is the database schema?"           |
| **"Why did we..."**    | [02-architecture/tech-stack-evaluation.md](./02-architecture/tech-stack-evaluation.md) | "Why did we choose Supabase?"            |
| **"When should I..."** | [03-implementation/development-rules.md](./03-implementation/development-rules.md)     | "When should I use Context7 MCP?"        |
| **"What are the..."**  | [01-business/mvp-specs.md](./01-business/mvp-specs.md)                                 | "What are the MVP requirements?"         |
| **"How does..."**      | [01-business/user-stories.md](./01-business/user-stories.md)                           | "How does the voting flow work?"         |

## 🔍 **Quick Context Lookup**

### **Essential Files (Always Reference First)**

1. **[development-rules.md](./03-implementation/development-rules.md)** - Core development guidelines and tool usage
2. **[serverless-mvp.md](./02-architecture/serverless-mvp.md)** - Primary architecture and database schema
3. **[user-stories.md](./01-business/user-stories.md)** - Business logic and user flows

### **Context-Specific Files**

- **Architecture Decisions**: [tech-stack-evaluation.md](./02-architecture/tech-stack-evaluation.md)
- **Security Requirements**: [security-architecture.md](./04-security/security-architecture.md)
- **Implementation Guide**: [serverless-implementation.md](./02-architecture/serverless-implementation.md)
- **Testing Strategy**: [testing-strategy.md](./04-security/testing-strategy.md)

### **Template Files**

- **API Documentation**: [api-spec-template.md](./context-templates/api-spec-template.md)
- **User Stories**: [user-story-template.md](./context-templates/user-story-template.md)

## 🎯 **Context Selection Rules for AI**

### **Always Check These First**

1. **[development-rules.md](./03-implementation/development-rules.md)** - Contains tool usage guidelines and decision frameworks
2. **[serverless-mvp.md](./02-architecture/serverless-mvp.md)** - Contains database schema and core architecture
3. **[user-stories.md](./01-business/user-stories.md)** - Contains business logic and user flows

### **Context7 MCP Usage Rules**

- **Use Context7 for**: New technology learning, complex API integration, performance optimization
- **Don't use Context7 for**: Project-specific business logic, basic setup, debugging existing code
- **Reference**: [development-rules.md](./03-implementation/development-rules.md) section "Tool Usage Guidelines"

### **Decision Making Framework**

1. **Check MVP Priority**: Is this Tier 1 (Core MVP) or Tier 2+?
2. **Evaluate Against Goals**: Does it help validate business hypothesis?
3. **Research Approach**: Quick wins vs complex features
4. **Reference**: [development-rules.md](./03-implementation/development-rules.md) section "Decision Making Framework"

## 📚 **Documentation Hierarchy**

### **Level 1: Essential Context (Always Read)**

- [development-rules.md](./03-implementation/development-rules.md)
- [serverless-mvp.md](./02-architecture/serverless-mvp.md)
- [user-stories.md](./01-business/user-stories.md)

### **Level 2: Implementation Context (When Building)**

- [serverless-implementation.md](./02-architecture/serverless-implementation.md)
- [security-architecture.md](./04-security/security-architecture.md)
- [mvp-specs.md](./01-business/mvp-specs.md)

### **Level 3: Advanced Context (When Optimizing)**

- [performance-implementation.md](./02-architecture/performance-implementation.md)
- [tech-stack-evaluation.md](./02-architecture/tech-stack-evaluation.md)
- [compliance-framework.md](./04-security/compliance-framework.md)

### **Level 4: Operational Context (When Deploying)**

- [deployment-guide.md](./05-operations/deployment-guide.md)
- [testing-strategy.md](./04-security/testing-strategy.md)

## 🚀 **Quick Start by Role**

### **👨‍💻 Developer**

1. [development-rules.md](./03-implementation/development-rules.md) - Development standards
2. [serverless-mvp.md](./02-architecture/serverless-mvp.md) - Architecture overview
3. [serverless-implementation.md](./02-architecture/serverless-implementation.md) - Implementation guide

### **📊 Product Manager**

1. [user-stories.md](./01-business/user-stories.md) - User scenarios
2. [mvp-specs.md](./01-business/mvp-specs.md) - Feature requirements
3. [pitch.md](./01-business/pitch.md) - Business case

### **🔒 Security Engineer**

1. [security-architecture.md](./04-security/security-architecture.md) - Security framework
2. [compliance-framework.md](./04-security/compliance-framework.md) - Compliance requirements
3. [testing-strategy.md](./04-security/testing-strategy.md) - Testing approach

### **🔧 DevOps Engineer**

1. [deployment-guide.md](./05-operations/deployment-guide.md) - Deployment procedures
2. [serverless-mvp.md](./02-architecture/serverless-mvp.md) - Infrastructure overview
3. [testing-strategy.md](./04-security/testing-strategy.md) - Testing procedures

## 🔍 **Context Search by Keywords**

### **Development Keywords**

- **"Context7"** → [development-rules.md](./03-implementation/development-rules.md)
- **"MCP"** → [development-rules.md](./03-implementation/development-rules.md)
- **"TypeScript"** → [development-rules.md](./03-implementation/development-rules.md)
- **"API"** → [api-spec-template.md](./context-templates/api-spec-template.md)
- **"Database"** → [serverless-mvp.md](./02-architecture/serverless-mvp.md)
- **"Real-time"** → [serverless-mvp.md](./02-architecture/serverless-mvp.md)

### **Business Keywords**

- **"User story"** → [user-stories.md](./01-business/user-stories.md)
- **"MVP"** → [mvp-specs.md](./01-business/mvp-specs.md)
- **"Requirements"** → [mvp-specs.md](./01-business/mvp-specs.md)
- **"Business case"** → [pitch.md](./01-business/pitch.md)
- **"Market"** → [pitch.md](./01-business/pitch.md)

### **Architecture Keywords**

- **"Serverless"** → [serverless-mvp.md](./02-architecture/serverless-mvp.md)
- **"Performance"** → [performance-implementation.md](./02-architecture/performance-implementation.md)
- **"Tech stack"** → [tech-stack-evaluation.md](./02-architecture/tech-stack-evaluation.md)
- **"Implementation"** → [serverless-implementation.md](./02-architecture/serverless-implementation.md)

### **Security Keywords**

- **"Security"** → [security-architecture.md](./04-security/security-architecture.md)
- **"Compliance"** → [compliance-framework.md](./04-security/compliance-framework.md)
- **"Testing"** → [testing-strategy.md](./04-security/testing-strategy.md)
- **"GDPR"** → [compliance-framework.md](./04-security/compliance-framework.md)

### **Operations Keywords**

- **"Deployment"** → [deployment-guide.md](./05-operations/deployment-guide.md)
- **"Monitoring"** → [deployment-guide.md](./05-operations/deployment-guide.md)
- **"Production"** → [deployment-guide.md](./05-operations/deployment-guide.md)

## 📝 **Context Update Guidelines**

### **When to Update This Navigation**

- New documentation files added
- Context selection rules change
- New tool usage patterns emerge
- Architecture decisions are made

### **How to Update**

1. Add new files to appropriate context levels
2. Update context selection matrix with new task types
3. Revise quick lookup sections as needed
4. Update context selection rules based on learnings

---

**🧭 Navigation** - _Single source of truth for PollRoom documentation navigation_

_Optimized for efficient context selection and documentation navigation for both humans and AI agents_

_Last updated: December 2024 | Part of PollRoom's context engineering system_
