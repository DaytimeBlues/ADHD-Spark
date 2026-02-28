/**
 * P5 Screens - Persona 5 Design System Screens
 *
 * Export all P5-styled screens for the ADHD productivity app.
 *
 * @example
 * import { P5DashboardScreen, P5FocusTimerScreen, P5PageTemplate } from '../screens/p5';
 */

// Main P5 Screens
export { P5DashboardScreen, default as P5DashboardDefault } from '../P5DashboardScreen';
export { P5FocusTimerScreen, default as P5FocusTimerDefault } from '../P5FocusTimerScreen';
export { P5JournalScreen, default as P5JournalDefault } from '../P5JournalScreen';
export { P5TasksScreen, default as P5TasksDefault } from '../P5TasksScreen';

// Page Template (Section 6.1)
export { P5PageTemplate, default as P5PageTemplateDefault } from './P5PageTemplate';
export type { P5PageTemplateProps } from './P5PageTemplate';
