# ADHD-CADDI Test Matrix

## Page/Button Inventory

### Navigation Structure (from AppNavigator.tsx)
- **Tab Navigator**: HOME, FOCUS, TASKS, CALENDAR, CHAT
- **Stack Screens**: MAIN, FOG_CUTTER, POMODORO, ANCHOR, INBOX

### All Screens & Components

#### HomeScreen
- [ ] Page loads without crash
- [ ] Displays streak summary (STREAK.XXX format)
- [ ] Displays mode cards: ignite, fogcutter, pomodoro, anchor, checkin, cbtguide
- [ ] Bottom tab navigation visible (HOME, FOCUS, TASKS, CALENDAR)
- [ ] System status badge (SYS.ONLINE)
- [ ] Weekly metrics display
- [ ] Capture bubble visible
- [ ] Navigate to Fog Cutter from card
- [ ] Navigate to all mode screens

#### IgniteScreen (FOCUS tab)
- [ ] IGNITE_PROTOCOL header visible
- [ ] Timer display functional
- [ ] Start/pause/reset controls
- [ ] Brown noise toggle
- [ ] Task input field
- [ ] Complete session flow

#### BrainDumpScreen (TASKS tab)
- [ ] BRAIN_DUMP header visible
- [ ] Text input for new items
- [ ] Add item via Enter key
- [ ] Voice recording toggle
- [ ] AI Sort button
- [ ] Clear all button
- [ ] Delete individual items
- [ ] Items persist across reload
- [ ] Items persist across tab navigation
- [ ] Google OAuth connect button (NEW)
- [ ] Todoist sync button (NEW)
- [ ] Integration status indicators (NEW)

#### TasksScreen
- [ ] Task list displays
- [ ] Add new task
- [ ] Toggle task completion
- [ ] Delete task
- [ ] Filter tabs (ALL, ACTIVE, DONE)
- [ ] Priority badges display
- [ ] Stats dashboard (URGENT, ACTIVE, DONE)
- [ ] Sync button (placeholder for integrations)

#### CalendarScreen
- [ ] CALENDAR header visible
- [ ] Monthly view renders
- [ ] Navigation between months
- [ ] Event display

#### ChatScreen
- [ ] CADDI_ASSISTANT header visible
- [ ] Message input field
- [ ] Send button
- [ ] Message history display
- [ ] Mock API response handling
- [ ] Error handling for failed API

#### FogCutterScreen
- [ ] FOG_CUTTER header visible
- [ ] Task input field
- [ ] Micro-step input
- [ ] Add micro-step button
- [ ] EXECUTE_SAVE button
- [ ] Display saved tasks
- [ ] ACTIVE_OPERATIONS display after save

#### PomodoroScreen
- [ ] START TIMER button
- [ ] PAUSE button (after start)
- [ ] Timer display decrements
- [ ] Phase transition to REST
- [ ] Timer persists across reload
- [ ] Timer continues after tab switch

#### AnchorScreen
- [ ] BREATHING EXERCISES header
- [ ] Pattern selection (4-7-8, Box, Energize)
- [ ] BREATHE IN animation
- [ ] HOLD animation
- [ ] Session completion

#### CheckInScreen
- [ ] HOW ARE YOU FEELING RIGHT NOW? header
- [ ] Mood selection (1-5 options)
- [ ] Energy selection (1-5 options)
- [ ] RECOMMENDED FOR YOU display
- [ ] Recommendation action button
- [ ] Literary vignettes display

#### CBTGuideScreen
- [ ] EVIDENCE-BASED STRATEGIES header
- [ ] Strategy content display
- [ ] Navigation between strategies

#### InboxScreen
- [ ] INBOX header visible
- [ ] Unreviewed items list
- [ ] Promote to task button
- [ ] Discard button
- [ ] Filter tabs (unreviewed, all, promoted)
- [ ] Empty state display

### Capture Bubble Features
- [ ] Bubble visible on home screen
- [ ] Badge count when unreviewed items exist
- [ ] Tap opens drawer
- [ ] All 5 capture modes visible (voice, text, photo, paste, meeting)
- [ ] Text capture in ≤3 interactions
- [ ] Meeting mode accepts multi-line
- [ ] Cancel closes drawer without saving
- [ ] Bubble hidden on fullscreen modals

### Integration Features (NEW)

#### Google OAuth
- [ ] Connect Google button visible in task pages
- [ ] OAuth flow initiates
- [ ] Success callback handled
- [ ] Token stored securely
- [ ] User email displayed
- [ ] Disconnect option
- [ ] Token refresh on expiry
- [ ] Error states: denied, network, timeout

#### Todoist Integration
- [ ] Connect Todoist button visible
- [ ] OAuth flow initiates
- [ ] Project selection
- [ ] Sync tasks to Todoist
- [ ] Two-way sync status
- [ ] Disconnect option
- [ ] Error handling

## Test Tags

## Android APK-Ready Acceptance

- [ ] Clean install launch
- [ ] Returning-user local data launch
- [ ] Offline startup
- [ ] Tutorial visibility
- [ ] Capture entry
- [ ] Tab navigation survivability
- [ ] Denied optional permissions do not crash launch
- [ ] Disconnected optional integrations do not block launch

### @critical (must pass for release)
- All navigation flows
- Task CRUD operations
- Timer functionality
- Data persistence
- OAuth connection flows
- Todoist sync

### @smoke (quick validation)
- Page loads
- Tab navigation
- Basic CRUD
- Timer start/stop

### @edge (error/edge cases)
- Offline behavior
- API failures (429, 500, timeout)
- Corrupted storage
- Rapid interactions
- Background/foreground transitions

### @oauth (Google integration)
- Sign-in flow
- Token management
- Refresh logic
- Error states

### @todoist (Todoist integration)
- Connection flow
- Task export
- Sync status
- Error handling

### @android (native specific)
- Navigation
- Permissions
- Recording
- Overlay
- OAuth native flow

## Browser Coverage

### Desktop
- [ ] Chromium (primary)
- [ ] Firefox
- [ ] WebKit (Safari)

### Mobile Viewports
- [ ] iPhone SE (375x667)
- [ ] iPhone 14 (390x844)
- [ ] Pixel 7 (412x915)
- [ ] iPad Mini (768x1024)

## Error Scenarios

### Network
- [ ] Complete offline mode
- [ ] Slow 3G simulation
- [ ] API timeout (30s+)
- [ ] API 429 rate limit
- [ ] API 500 server error
- [ ] API 503 unavailable
- [ ] Intermittent connectivity

### Storage
- [ ] LocalStorage full
- [ ] Corrupted storage data
- [ ] Storage quota exceeded
- [ ] Private browsing mode

### Authentication
- [ ] OAuth popup blocked
- [ ] OAuth denied by user
- [ ] Token expired mid-session
- [ ] Token revoked externally
- [ ] Network failure during OAuth

## Accessibility
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Screen reader labels
- [ ] Color contrast
- [ ] Touch target sizes

## Performance
- [ ] First paint < 3s
- [ ] Interactive < 5s
- [ ] No layout shift on load
- [ ] Smooth animations (60fps)
