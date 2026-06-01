# Feature: Hierarchical Form Filters in Species List

## Overview
Redesign the species list form filter to use a hierarchical two-level selector, mirroring the structure in the /learn page. Instead of showing all 20+ form categories in a flat list, only top-level categories (bird, mammal, plant, insect, frog) are initially visible. When a user selects a top-level category, sub-categories (e.g., woodpecker, raptor, songbird under bird) appear with a visual prefix to distinguish them.

## Problem
The current species list filter shows all form categories in a single flat dropdown, which is overwhelming and doesn't leverage the hierarchical structure already defined in `FORM_HIERARCHY`. This makes it harder for users to find specific sub-categories and doesn't match the educational hierarchy already established on the /learn page.

## Solution
Implement a two-level hierarchical form filter in the FilterPanel component:

1. **Primary selector**: Dropdown showing only top-level forms (bird, mammal, plant, insect, frog)
2. **Secondary selector**: When a top-level form is selected, display checkboxes for its sub-categories
3. **Visual distinction**: Sub-categories are prefixed (e.g., "└─ Woodpecker", "└─ Raptor") to make the hierarchy clear

## Implementation Details

### Files to Modify
- **app/src/components/FilterPanel.tsx** - Main UI component
- **app/src/lib/learnContent.ts** - Add utility functions for working with the form hierarchy

### Key Changes

#### 1. Add Utility Functions (learnContent.ts)
```typescript
// Extract top-level form keys from FORM_HIERARCHY
function getTopLevelForms(): string[]

// Get children for a given form key
function getChildForms(parentKey: string): string[]

// Get all descendant forms (for filtering logic)
function getAllDescendantForms(parentKey: string): string[]
```

#### 2. Refactor Form Filter Section (FilterPanel.tsx)
- Replace simple select dropdown with a hierarchical selector
- Show top-level forms in initial dropdown
- When a top-level form is selected, display section with sub-category checkboxes
- Use prefix like `"└─ "` or `"  • "` for sub-categories
- Maintain backward compatibility with existing filter state and URL parameters

### User Flow
1. User visits species list page → sees form dropdown with: "Bird", "Mammal", "Plant", "Insect", "Frog"
2. User selects "Bird" → dropdown closes, sub-categories appear below:
   - ☐ └─ Woodpecker
   - ☐ └─ Raptor
   - ☐ └─ Owl
   - ☐ └─ Songbird
   - ☐ └─ Wading Bird
3. User checks "Woodpecker" and "Raptor" → URL updates with `?form=woodpecker&form=raptor`
4. Users can select a different top-level form (e.g., "Plant") while retaining bird selections, or click "Clear filters" to reset

## Technical Notes
- The form hierarchy is already defined in `FORM_HIERARCHY` (learnContent.ts)
- The filter logic in `filters.ts` already supports multiple forms via the `forms` array
- URL parameters use query params like `?form=woodpecker&form=raptor` (already supported)
- The feature is backward-compatible: existing URLs with form parameters will continue to work

## Verification
1. Load species list page, verify form filter shows only 5 top-level categories
2. Select "Bird", verify sub-categories appear with prefix and species are filtered correctly
3. Select "Plant", verify sub-categories switch to plant hierarchy
4. Select multiple sub-categories, verify URL params update and filtering works
5. Test deep-link: visit `?form=warbler&form=hummingbird` to verify pre-selection works
6. Test "Clear filters" button

## Benefits
- Reduces visual clutter and cognitive load
- Mirrors the /learn page's organizational structure for consistency
- Makes hierarchy explicit and clear
- Maintains all existing filtering functionality
- Improves discoverability of sub-categories through progressive disclosure
