# PollRoom - Development Rules and Guidelines

## 🎯 **Overview**

This document establishes clear rules and guidelines for developing PollRoom, including when to use specific tools, how to make decisions, and what standards to follow. Essential reading for all developers and AI agents working on this project.

## 🔧 **Tool Usage Guidelines**

### **🌐 Context7 MCP Server**

#### **When to Use Context7**
✅ **DO use Context7 when**:
- **Learning new technologies** - Get official documentation for libraries you're unfamiliar with
- **Implementing complex features** - Need detailed API references for advanced functionality
- **Debugging integration issues** - Official docs often have troubleshooting sections
- **Performance optimization** - Official performance guides and best practices
- **Security implementation** - Official security recommendations and patterns
- **Version-specific features** - When using specific versions of Next.js, Supabase, etc.

#### **When NOT to Use Context7**
❌ **DON'T use Context7 when**:
- **Basic setup tasks** - Simple npm install, environment variables, basic configuration
- **General programming questions** - Basic JavaScript/TypeScript syntax, React basics
- **Project-specific business logic** - Room code generation, voting logic, UI components
- **Quick configuration** - Standard .env files, basic API routes
- **Debugging project code** - Issues with your specific implementation

#### **Context7 Usage Examples**

**✅ Good Context7 Usage**:
```
"How to implement real-time subscriptions with row-level security in Supabase?"
"What are the performance considerations for Next.js API routes under high load?"
"How to properly handle WebSocket connections in production with Vercel?"
"What are the rate limiting options available in Vercel KV?"
```

**❌ Poor Context7 Usage**:
```
"How to generate a 6-character room code?" (project-specific logic)
"How to style a button with Tailwind?" (basic framework usage)
"How to fix my React component?" (debugging specific code)
"How to set up environment variables?" (basic configuration)
```

### **📚 Documentation vs Implementation**

#### **When to Read Documentation First**
1. **New integrations** - Before integrating any new service or API
2. **Performance requirements** - When latency or throughput targets matter  
3. **Security features** - Authentication, authorization, data protection
4. **Scaling decisions** - Before choosing between different architectural approaches
5. **Deployment configuration** - Production settings, environment variables, optimization

#### **When to Start Coding Immediately**
1. **UI components** - Basic React components, forms, layouts
2. **Business logic** - Room management, voting mechanics, result calculations
3. **Styling and design** - Tailwind classes, responsive design, animations
4. **Basic API routes** - Simple CRUD operations, request validation
5. **State management** - React state, Zustand stores, local data handling

## 🏗️ **Architectural Decision Rules**

### **Technology Choices**

#### **Stick with Serverless Stack Unless**:
- **Performance requirements exceed** 200ms response time consistently
- **Concurrent users consistently exceed** 100 simultaneous users
- **Monthly costs exceed** $50 due to usage growth
- **Custom optimization needs** require infrastructure control

#### **When to Add New Dependencies**:
✅ **Add dependencies when**:
- **Solves a critical MVP requirement** that would take >1 day to build from scratch
- **Official recommendation** from primary stack providers (Vercel, Supabase)
- **Proven track record** with >10k weekly downloads and active maintenance
- **Clear documentation** and TypeScript support available

❌ **Avoid dependencies when**:
- **Experimental or beta** software without production track record
- **Overlaps existing functionality** already provided by current stack
- **Adds complexity** without clear benefit for MVP validation
- **Large bundle size** impact for simple functionality

### **Database Design Rules**

#### **Schema Changes**:
1. **Start simple** - Add columns rather than complex relationships initially
2. **Use Supabase dashboard** for schema changes during MVP phase
3. **Test locally immediately** after any schema change
4. **Document changes** in implementation guide comments
5. **Avoid premature optimization** - focus on working features first

#### **Query Optimization**:
1. **Profile before optimizing** - Use Supabase query analyzer
2. **Add indexes for** frequently queried columns (room_code, poll_id)
3. **Use materialized views** only when query performance becomes problematic
4. **Prefer simple queries** over complex joins during MVP phase

## 🔄 **Development Workflow Rules**

### **Feature Development Process**

#### **1. Planning Phase (15 minutes)**
- [ ] **Check MVP specs** - Is this feature in Tier 1 (Core MVP)?
- [ ] **Review user stories** - Which specific use case does this solve?
- [ ] **Identify dependencies** - What needs to exist before building this?
- [ ] **Estimate complexity** - Simple (2-4 hours), Medium (1 day), Complex (2-3 days)

#### **2. Research Phase (0-60 minutes)**
- **If using new APIs/services**: Use Context7 to understand official patterns
- **If building business logic**: Start coding with existing knowledge
- **If unsure about approach**: Check similar implementations in documentation
- **If performance critical**: Research official optimization recommendations

#### **3. Implementation Phase**
- **Start with simplest working version** - No premature optimization
- **Test locally frequently** - Verify each piece works before moving on
- **Use TypeScript strictly** - No `any` types in production code
- **Follow existing patterns** - Match code style from implementation guide

#### **4. Validation Phase**
- **Test core functionality** - Does it solve the user story requirement?
- **Test edge cases** - Empty states, error conditions, invalid inputs
- **Test real-time features** - Open multiple browser tabs, verify synchronization
- **Test mobile experience** - Use responsive design tools, test on actual device

### **Code Quality Standards**

#### **TypeScript Requirements**
```typescript
// ✅ Good: Explicit types
interface CreateRoomRequest {
  name: string
  description?: string
}

// ❌ Bad: Any types
function createRoom(data: any): any
```

#### **Error Handling Standards**
```typescript
// ✅ Good: Proper error handling
try {
  const { data, error } = await supabase.from('rooms').insert(roomData)
  if (error) throw error
  return { success: true, data }
} catch (error) {
  console.error('Room creation failed:', error)
  return { success: false, error: error.message }
}

// ❌ Bad: Silent failures
const data = await supabase.from('rooms').insert(roomData)
return data
```

#### **API Route Standards**
```typescript
// ✅ Good: Consistent API structure
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    // Implementation
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

## 🚀 **Deployment and Environment Rules**

### **Environment Management**

#### **Development Environment**
```bash
# .env.local (local development)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
VERCEL_KV_REST_API_URL=https://xxx.kv.vercel-storage.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **Production Environment**
- **Use Vercel dashboard** for environment variable management
- **Never commit secrets** to git repository
- **Test environment variables** immediately after deployment
- **Use preview deployments** for testing before production

### **Deployment Rules**

#### **When to Deploy**
✅ **Deploy when**:
- **Feature is complete** and tested locally
- **All tests pass** and TypeScript compiles without errors
- **Real-time functionality verified** across multiple browser tabs
- **Mobile experience tested** and working

#### **Deployment Process**
1. **Commit with clear message** describing the feature/fix
2. **Push to feature branch** first for preview deployment
3. **Test preview deployment** with actual usage scenarios
4. **Merge to main** only after preview testing passes
5. **Verify production deployment** works correctly

## 📊 **Performance and Monitoring Rules**

### **Performance Targets**
- **API Response Time**: <500ms for MVP (aim for <200ms)
- **Page Load Time**: <3 seconds on mobile 3G
- **Real-time Update Latency**: <2 seconds (aim for <500ms)
- **Database Query Time**: <100ms for simple queries

### **When to Optimize**
🔴 **Immediate optimization needed**:
- API responses consistently >1 second
- Page loads consistently >5 seconds
- Real-time updates consistently >5 seconds
- Database errors due to timeouts

🟡 **Plan optimization soon**:
- API responses consistently >500ms
- Page loads consistently >3 seconds
- Real-time updates consistently >2 seconds
- Users reporting "slow" experience

🟢 **No optimization needed**:
- Meeting all performance targets
- Users not reporting performance issues
- Growth not causing degradation

### **Monitoring Requirements**
- **Use Vercel Analytics** for performance monitoring
- **Use Supabase Dashboard** for database performance
- **Monitor error rates** in Vercel Functions dashboard
- **Track user feedback** on performance experience

## 🔒 **Security Rules**

### **Data Protection Standards**
1. **Never log sensitive data** - Avoid logging session IDs, user data
2. **Use environment variables** for all API keys and secrets
3. **Validate all inputs** using Zod or similar validation library
4. **Use Supabase RLS** for database access control
5. **Rate limit API endpoints** to prevent abuse

### **Session Management**
```typescript
// ✅ Good: Secure session handling
import { kv } from '@vercel/kv'

export async function createSession(userId: string) {
  const sessionId = crypto.randomUUID()
  await kv.set(`session:${sessionId}`, { userId, createdAt: Date.now() }, { ex: 3600 })
  return sessionId
}

// ❌ Bad: Insecure session handling
let sessions = {} // Global variable
```

## 🧪 **Testing Guidelines**

### **Manual Testing Requirements**
Before any deployment, verify:
- [ ] **Room creation** works and generates unique codes
- [ ] **Room joining** works with valid codes, rejects invalid ones
- [ ] **Poll creation** works for all poll types (yes/no, rating, multiple choice)
- [ ] **Voting** works and prevents duplicate votes
- [ ] **Real-time updates** appear in all connected clients
- [ ] **Mobile interface** is touch-friendly and responsive
- [ ] **Error handling** shows appropriate messages

### **Cross-browser Testing**
Test on:
- [ ] **Chrome** (primary development browser)
- [ ] **Safari** (iOS compatibility)
- [ ] **Firefox** (alternative desktop browser)
- [ ] **Mobile Chrome/Safari** (actual mobile device preferred)

### **Multi-user Testing**
- [ ] **Multiple browser tabs** - Test real-time synchronization
- [ ] **Multiple devices** - Test cross-device real-time updates
- [ ] **High-frequency voting** - Test rapid vote submission
- [ ] **Network interruption** - Test reconnection behavior

## 📋 **Decision Making Framework**

### **When Facing Technical Choices**

#### **1. Check MVP Priority**
- Is this for Tier 1 (Core MVP) features? → Prioritize simple, working solution
- Is this for Tier 2+ features? → Can be deferred or simplified

#### **2. Evaluate Against Goals**
- Does it help **validate the business** hypothesis?
- Does it improve **user experience** significantly?
- Does it maintain **development velocity**?
- Does it keep **costs low** during validation?

#### **3. Research Approach**
- **Quick wins** (< 2 hours): Start coding, research while building
- **Medium features** (2-8 hours): Research first, then implement
- **Complex features** (> 1 day): Research thoroughly, consider alternatives

#### **4. Implementation Strategy**
- **Start with simplest working version**
- **Add complexity only when needed**
- **Prefer configuration over code**
- **Use official examples as starting point**

### **When to Ask for Help**

#### **Internal Team Questions** 
- Business logic decisions (voting rules, room expiration)
- UI/UX design choices (layout, styling, user flow)
- Feature prioritization (what to build next)
- Testing strategy (what scenarios to test)

#### **External Research Needed**
- Technical implementation patterns (use Context7)
- Performance optimization techniques (use Context7)
- Security best practices (use Context7)
- Scaling considerations (use Context7)

## 🎯 **Success Metrics and Validation**

### **Development Success Metrics**
- **Feature completion rate**: Tier 1 features completed vs planned
- **Bug rate**: Issues found in production vs features deployed
- **Performance consistency**: Staying within latency targets
- **Development velocity**: Features delivered per week

### **MVP Success Metrics**
- **User engagement**: % of room participants who actually vote
- **Session completion**: % of polls that receive at least 3 votes
- **Technical reliability**: <1% error rate for core functions
- **User feedback**: Qualitative feedback on ease of use

### **When to Iterate vs Ship**

#### **Ship When**:
- Core user story works end-to-end
- Error handling prevents crashes
- Mobile experience is usable
- Performance meets MVP targets

#### **Iterate When**:
- Users report confusion about how to use features
- Error rates >5% for any core functionality
- Performance consistently below targets
- Real-time features fail to synchronize

---

## 🎉 **Quick Reference Checklist**

### **Before Starting Any Feature**
- [ ] Feature is in MVP-Specs.md Tier 1 or approved for development
- [ ] User story clearly defined in User-Stories.md
- [ ] Technical approach decided (simple first, optimize later)
- [ ] Required research completed (Context7 if needed for new APIs)

### **During Development**
- [ ] Following TypeScript standards (no `any` types)
- [ ] Error handling implemented for all async operations
- [ ] Testing locally after each significant change
- [ ] Committing frequently with clear messages

### **Before Deployment**
- [ ] All manual testing scenarios pass
- [ ] TypeScript compiles without errors
- [ ] Performance meets targets (use browser dev tools)
- [ ] Real-time features tested across multiple tabs/devices
- [ ] Preview deployment tested before merging to main

---

*Development Rules and Guidelines created: December 2024*  
*Essential reference for all PollRoom development work*
