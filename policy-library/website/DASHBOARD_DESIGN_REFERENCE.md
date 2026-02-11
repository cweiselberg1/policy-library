# Privacy Officer Dashboard - Design Reference

## Color Scheme

### Section Identity Colors

```
Main Dashboard:    Multi-gradient (overview of all sections)
├─ Employees:      from-blue-600 to-cyan-600      (#2563eb → #0891b2)
├─ Departments:    from-violet-600 to-purple-600  (#7c3aed → #9333ea)
├─ Bundles:        from-emerald-600 to-teal-600   (#059669 → #0d9488)
└─ Compliance:     from-orange-600 to-red-600     (#ea580c → #dc2626)
```

### Status Colors

```
✅ Success/Compliant:     emerald-500/400  (#10b981/#34d399)
⚠️  Warning/Pending:      orange-500/400   (#f97316/#fb923c)
❌ Error/Non-Compliant:   red-500/400      (#ef4444/#f87171)
⏱️  Neutral/Inactive:     slate-500/400    (#64748b/#94a3b8)
```

### Background Layers

```
Level 0 (Page):           bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
Level 1 (Header):         bg-slate-800/50 backdrop-blur-xl border-slate-700/50
Level 2 (Cards):          bg-slate-800/50 backdrop-blur-xl border-slate-700/50
Level 3 (Sub-cards):      bg-slate-900/50 border-slate-700/50
Level 4 (Inputs):         bg-slate-900/50 border-slate-700
```

## Typography Scale

```
Page Title:        text-4xl font-bold (36px)
Section Heading:   text-2xl font-bold (24px)
Card Title:        text-xl font-semibold (20px)
Sub-heading:       text-lg font-semibold (18px)
Body Text:         text-sm (14px)
Small Text:        text-xs (12px)
```

## Component Hierarchy

### Main Dashboard Flow

```
┌─────────────────────────────────────────────────┐
│  Main Dashboard                                 │
│  /dashboard/privacy-officer                     │
│                                                 │
│  ┌─────────────┐ ┌─────────────┐              │
│  │ 📊 Stats    │ │ 📊 Stats    │              │
│  └─────────────┘ └─────────────┘              │
│                                                 │
│  ┌─────────────────────┐ ┌──────────────────┐ │
│  │ 👥 Employees Card   │ │ 🏢 Departments   │ │
│  │ • Invite            │ │ • Tree View      │ │
│  │ • List/Filter       │ │ • Create/Edit    │ │
│  └─────────────────────┘ └──────────────────┘ │
│                                                 │
│  ┌─────────────────────┐ ┌──────────────────┐ │
│  │ 📋 Policy Bundles   │ │ 📈 Compliance    │ │
│  │ • Create            │ │ • Track          │ │
│  │ • Assign            │ │ • Report         │ │
│  └─────────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Employee Management Flow

```
Employees Page
├─ Search/Filter Bar
│  ├─ Search by name/ID
│  ├─ Filter by department
│  └─ Filter by status
│
├─ Stats Cards (4)
│  ├─ Total Employees
│  ├─ Active
│  ├─ On Leave
│  └─ Filtered Count
│
└─ Employee Table
   ├─ Row (collapsed)
   │  ├─ Avatar + Name
   │  ├─ Department
   │  ├─ Status Badge
   │  ├─ Employment Type
   │  ├─ Start Date
   │  └─ Actions
   │
   └─ Row (expanded)
      ├─ Contact Info Card
      ├─ Employment Details Card
      ├─ Skills Card
      └─ Action Buttons
```

### Compliance Dashboard Flow

```
Compliance Page
├─ View Toggle (Departments | Employees)
│
├─ Stats Overview (4)
│  ├─ Organization Rate
│  ├─ Departments Count
│  ├─ Employees Count
│  └─ Fully Compliant
│
├─ Department View
│  └─ Department Card (expandable)
│     ├─ Header (name, icon, rate)
│     ├─ Progress Bar
│     └─ Expanded Stats
│        ├─ Total Employees
│        ├─ Compliant Count
│        └─ Non-Compliant Count
│
└─ Employee View
   ├─ Filters (search, status, sort)
   └─ Employee Table
      ├─ Name + ID
      ├─ Department
      ├─ Progress Bar
      ├─ Compliance Rate
      ├─ Status Badge
      └─ Actions
```

## Modal Patterns

### Standard Modal Structure

```
┌────────────────────────────────────┐
│ Header                         [X] │
│ • Title (text-2xl bold)            │
├────────────────────────────────────┤
│ Content                            │
│ • Form fields                      │
│ • Error message area               │
│ • Info box (optional)              │
├────────────────────────────────────┤
│ Actions                            │
│ [Cancel] [Primary Action]          │
└────────────────────────────────────┘
```

### Modal Variants

1. **Create Department Modal**
   - Name (required)
   - Description
   - Parent Department (dropdown)
   - Budget

2. **Invite Employee Modal**
   - Email (required)
   - Employee ID (required)
   - Position Title (required)
   - Department (required)
   - Employment Type
   - Start Date
   - Phone
   - Location

3. **Create Bundle Modal**
   - Name (required)
   - Description
   - Policy Selection (searchable list)
     - Search bar
     - Category filter
     - Checkbox list

## Interactive States

### Button States

```css
Default:    bg-gradient-to-r from-{color}-600 to-{color2}-600
Hover:      hover:shadow-xl hover:shadow-{color}-500/20
Active:     transform active:scale-95
Disabled:   opacity-50 cursor-not-allowed
Loading:    opacity-75 with spinner
```

### Card States

```css
Default:    border-slate-700/50
Hover:      hover:border-slate-600
Active:     border-{accent}-500/50
Expanded:   bg-slate-900/30 (different shade)
```

### Progress Bars

```css
Container:  h-2 bg-slate-700 rounded-full
Fill:       h-full bg-gradient-to-r from-{color} to-{color2}
Animation:  transition-all duration-500
```

## Spacing System

```
Container Padding:   px-6 py-12
Card Padding:        p-6 or p-8
Card Gap:            gap-6 or gap-8
Section Gap:         space-y-6
Grid Gap:            gap-6
```

## Icon Usage

### Heroicons 24/outline

```
👥 UserGroupIcon         - Employees, team members
🏢 BuildingOfficeIcon    - Departments, organization
📄 DocumentTextIcon      - Policies, documents
📊 ChartBarIcon          - Analytics, compliance
🔔 BellIcon              - Notifications, alerts
⚙️  Cog6ToothIcon        - Settings
✅ CheckCircleIcon       - Success, completed
❌ XCircleIcon           - Error, non-compliant
⏱️  ClockIcon            - Pending, time
⚠️  ExclamationTriangleIcon - Warning
🔍 MagnifyingGlassIcon   - Search
🗑️  TrashIcon            - Delete
✏️  PencilIcon           - Edit
➕ PlusIcon              - Add, create
← ArrowLeftIcon          - Back navigation
```

## Accessibility Features

### Keyboard Navigation
- Tab order follows visual hierarchy
- Enter/Space activate buttons
- Escape closes modals
- Arrow keys navigate lists

### Screen Reader Support
- Semantic HTML (header, main, nav, section)
- ARIA labels on icon buttons
- Status announcements for loading states
- Error messages associated with form fields

### Color Contrast
- All text meets WCAG AA standards (4.5:1)
- Status colors are reinforced with icons
- Focus indicators visible on all interactive elements

## Responsive Breakpoints

```
Mobile:    < 768px   - Single column, stacked
Tablet:    768-1024  - 2 columns
Desktop:   > 1024px  - 3-4 columns
```

### Mobile Adaptations
- Full-width cards
- Stacked form fields
- Hamburger menu (when implemented)
- Bottom action sheets for modals
- Larger touch targets (min 44px)

## Animation Timing

```
Instant:      50ms   - Hover state changes
Fast:         150ms  - Button clicks
Standard:     300ms  - Modal open/close, card expand
Slow:         500ms  - Progress bar fills
```

## Design Principles

### 1. Information Hierarchy
- Most important info at top
- Visual weight indicates importance
- Consistent spacing creates rhythm

### 2. Progressive Disclosure
- Start with overview
- Expand for details
- Modals for complex actions

### 3. Feedback
- Loading states for async operations
- Success/error messages
- Visual confirmation of actions

### 4. Consistency
- Same patterns throughout
- Predictable locations
- Unified color language

### 5. Efficiency
- Quick actions visible
- Filters persist
- Minimal clicks to complete tasks

## Future Enhancements

### Data Visualization
- Add Chart.js or Recharts for:
  - Compliance trends over time
  - Department performance comparison
  - Employee progress tracking

### Advanced Interactions
- Drag-and-drop department reordering
- Bulk employee import
- CSV export of compliance reports
- Print-friendly compliance reports

### Real-time Updates
- WebSocket for live compliance updates
- Notifications for new assignments
- Real-time employee status changes

---

**Created**: 2026-02-09
**Design System**: v1.0
**Status**: Production Ready
