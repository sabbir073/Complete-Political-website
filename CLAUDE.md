# Claude Settings System Documentation

## Overview
This document outlines the comprehensive settings system implemented for header, footer, and homepage (hero) settings with multilingual support, incremental saves, and proper API architecture.

## Completed Settings Modules

### 1. Header Settings ✅
- **Admin Page**: `src/app/admin/settings/header/page.tsx`
- **API Routes**: 
  - Private: `src/app/api/admin/settings/header/route.ts` (CRUD operations)
  - Public: `src/app/api/settings/header/route.ts` (Read-only)
- **Hook**: `src/hooks/useHeaderSettings.ts`
- **Component**: `src/components/Header.tsx`
- **Features**: Logo, positioning, theme controls, buttons with multilingual support

### 2. Footer Settings ✅
- **Admin Page**: `src/app/admin/settings/footer/page.tsx`
- **API Routes**:
  - Private: `src/app/api/admin/settings/footer/route.ts` (CRUD operations)
  - Public: `src/app/api/settings/footer/route.ts` (Read-only)
- **Hook**: `src/hooks/useFooterSettings.ts`
- **Component**: `src/components/Footer.tsx`
- **Features**: Layout, CTA section, social links, column management, dynamic menus

### 3. Homepage Hero Settings ✅
- **Admin Page**: `src/app/admin/settings/homepage/hero/page.tsx`
- **API Routes**:
  - Private: `src/app/api/admin/settings/home/hero/route.ts` (CRUD operations)
  - Public: `src/app/api/settings/hero/route.ts` (Read-only)
- **Hook**: `src/hooks/useHomeSettings.ts`
- **Component**: `src/components/Hero.tsx`
- **Features**: Dynamic hero items, overlay settings, person image, button controls

## Technical Architecture

### API Structure
```
📁 src/app/api/
├── 📁 admin/settings/          # Private APIs (CRUD with auth)
│   ├── header/route.ts         # Admin header operations
│   ├── footer/route.ts         # Admin footer operations
│   └── home/hero/route.ts      # Admin hero operations
└── 📁 settings/                # Public APIs (Read-only, no auth)
    ├── header/route.ts         # Public header data
    ├── footer/route.ts         # Public footer data
    └── hero/route.ts           # Public hero data
```

### Data Storage Pattern
All multilingual settings store data directly in `setting_value` as JSON:
```json
{
  "en": "English text",
  "bn": "বাংলা টেক্সট"
}
```

### Database Schema
```sql
settings table:
- id (uuid)
- setting_key (text)
- setting_value (jsonb) -- Stores multilingual data directly
- setting_type (text)
- category (text) -- 'header', 'footer', 'home'
- subcategory (text) -- 'hero', 'cta', 'social', etc.
- is_multilingual (boolean)
- default_value (jsonb)
- is_active (boolean)
- display_order (integer)
```

## Key Features Implemented

### 1. Incremental Save System
- Only saves changed fields, not entire form
- Uses `changedFields` Set to track modifications
- Reduces API calls and database operations
- Provides better user experience with faster saves

**Implementation Pattern:**
```typescript
const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
const [hasChanges, setHasChanges] = useState(false);

const handleSave = async () => {
  if (!hasChanges || changedFields.size === 0) return;
  
  // Only process changed settings
  const settingsToUpdate = [];
  Object.values(settings).flat().forEach(setting => {
    if (changedFields.has(setting.setting_key)) {
      settingsToUpdate.push(/* setting data */);
    }
  });
};
```

### 2. Multilingual System
- Supports English (en) and Bengali (bn)
- Uses `useLanguage()` hook for language switching
- `getText()` helper function for language-aware text rendering
- Fallback to English if translation missing

**Usage Pattern:**
```typescript
const getText = (multilingualText: { en: string; bn: string }) => {
  return multilingualText[language] || multilingualText.en || '';
};

// In components
{getText(settings.title)}
```

### 3. Dynamic Field Generation
Hero settings generate dynamic fields based on item count:
```typescript
// Generates fields for each hero item
for (let i = 1; i <= itemCount; i++) {
  // home_hero_item_1_title, home_hero_item_2_title, etc.
  // home_hero_item_1_description, home_hero_item_2_description, etc.
  // home_hero_item_1_background_image, home_hero_item_2_background_image, etc.
  // home_hero_item_1_person_image, home_hero_item_2_person_image, etc.
}
```

### 4. MediaPicker Integration
- Used for image uploads in all settings
- Provides alt text management
- CDN integration for image optimization
- Proper error handling and validation

### 5. Public vs Private API Separation
- **Private APIs**: Require authentication, full CRUD operations
- **Public APIs**: No authentication, read-only access for frontend components
- Proper error handling and data processing in both

## Component Integration Pattern

### 1. Server-Side Settings (SSR Support)
```typescript
// For components that need SSR
export async function getHeaderSettings(): Promise<HeaderSettings> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/settings/header`);
  return response.json();
}

// Usage in server components
const headerSettings = await getHeaderSettings();
return <Header initialSettings={headerSettings} />;
```

### 2. Client-Side Settings
```typescript
// For client components
const { settings, loading, getText } = useHeaderSettings();

if (loading) return <LoadingSpinner />;

return (
  <header>
    <h1>{getText(settings.title)}</h1>
  </header>
);
```

## Error Handling & Fallbacks

### 1. API Error Handling
```typescript
try {
  const response = await fetch('/api/settings/header');
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
} catch (error) {
  console.error('Settings fetch error:', error);
  // Fall back to default settings
  setSettings(defaultSettings);
}
```

### 2. Default Settings Pattern
Each module maintains comprehensive default settings:
```typescript
const defaultSettings: HeaderSettings = {
  header_logo_light: '/logo.png',
  header_logo_alt: { en: 'Logo', bn: 'লোগো' },
  header_position: 'sticky',
  // ... all required fields with sensible defaults
};
```

## Language Switching Implementation

### 1. Hook Integration
```typescript
const { language } = useLanguage();

const getText = (text: { en: string; bn: string }) => {
  return text[language] || text.en || '';
};
```

### 2. Component Reactivity
Components automatically re-render when language changes through context updates.

### 3. Database Structure
Multilingual data stored as JSON objects in `setting_value`:
```json
{
  "setting_key": "header_title",
  "setting_value": {
    "en": "Welcome",
    "bn": "স্বাগতম"
  },
  "is_multilingual": true
}
```

## Testing & Validation

### 1. API Testing
```bash
# Test public APIs
curl "http://localhost:3000/api/settings/header"
curl "http://localhost:3000/api/settings/footer" 
curl "http://localhost:3000/api/settings/hero"

# Test language switching data
curl "http://localhost:3000/api/settings/header?translations=true"
```

### 2. Frontend Testing
- Language switcher functionality
- Save/load operations
- MediaPicker integration
- Form validation
- Error states

## Performance Optimizations

### 1. Incremental Updates
- Only changed fields sent to server
- Reduces payload size and processing time
- Better user experience with faster saves

### 2. Efficient Data Loading
- Public APIs optimized for frontend consumption
- Proper caching headers
- Minimal data transfer

### 3. Component Optimization
- Proper loading states
- Error boundaries
- Memoization where appropriate

## Future Enhancements

### Remaining Homepage Sections
- Leaders section settings
- Events section settings  
- About section settings
- Gallery section settings
- Blog section settings
- Video section settings

### Planned Features
- Settings import/export
- Settings versioning
- Bulk operations
- Advanced validation rules
- Custom field types

## Development Commands

```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build project
npm run build
```

## File Organization
```
📁 src/
├── 📁 app/
│   ├── 📁 admin/settings/          # Admin pages
│   └── 📁 api/                     # API routes
├── 📁 components/                  # React components
├── 📁 hooks/                       # Custom hooks
└── 📁 lib/                         # Utility functions
```

This architecture provides a scalable, maintainable foundation for the entire settings system with proper separation of concerns, multilingual support, and optimal performance.