# 🎨 Color Scheme Update - Dark Green Theme

## Color Palette

### Background
- **Main Background**: `#0d3b2e` (Dark Green)
- **Card Background**: White with transparency overlays

### Text Colors
- **Primary Text (Titles, Metrics)**: Black
- **Secondary Text (Descriptions, Data)**: White
- **Muted Text**: White with 70% opacity

### UI Elements
- **Buttons**: White background with black text
- **Hover States**: Gray-200 for white buttons
- **Active/Selected**: Black background with white text
- **Borders**: White

### Status Indicators
- **Active**: Green-500 (kept for health indicators)
- **Warning**: Yellow-500 (kept for health indicators)
- **Offline**: Red-500 (kept for health indicators)

## Updated Components

### 1. Header
- Title: Black text
- Subtitle: White text
- Buttons: White background, black text
- Docs button added

### 2. Stats Cards
- Background: White
- Labels: Gray-500
- Numbers: Black (bold)
- Removed emoji icons

### 3. Charts
- Background: White cards
- Titles: Black
- Chart colors: Dark green palette
- Axes: Black
- Lines/Bars: Black or green shades

### 4. Filter Bar
- Background: White card
- Buttons (inactive): Gray-100 background, black text
- Buttons (active): Black background, white text
- Removed emoji from filter buttons
- Inputs: Black text, black focus border

### 5. Table
- Header: White/20 background, white text
- Rows: Transparent with white text
- Hover: White/10 background
- My Node highlight: White/20 background
- Version badges: White background, black text
- Dividers: White/20

### 6. Side Panel
- Background: Dark green (#0d3b2e)
- Title: Black text
- Labels: White text
- Content boxes: White/10 background with white borders
- Text: White
- Version badge: White background, black text

### 7. Docs Modal
- Background: White
- Title: Black
- Content: Black for headings, gray-700 for body text
- Sections: Gray-50 background for info boxes
- Status indicators: Colored backgrounds (green/yellow/red-50)

## Design Principles

1. **High Contrast**: Black text on white cards, white text on dark green background
2. **Consistency**: All primary content uses black, all secondary uses white
3. **Simplicity**: Removed decorative emojis, kept only functional status indicators
4. **Accessibility**: Maintained proper contrast ratios for readability
5. **Clean Aesthetic**: Minimalist design with focus on data

## Features Added

### 📚 Documentation Modal
- Comprehensive guide to using the dashboard
- Sections: Overview, Features, How to Use, Status Indicators, Technical Details, Support
- Accessible via "Docs" button in header
- Full-screen modal with scroll
- Clean white design with black text

### Key Documentation Sections:
1. **Overview**: Introduction to the dashboard
2. **Key Features**: List of main capabilities
3. **How to Use**: Step-by-step guides for:
   - Filtering nodes
   - Tracking your node
   - Searching
   - Sorting
   - Viewing node details
4. **Node Status Indicators**: Explanation of Active/Warning/Offline
5. **Technical Details**: Data source, update frequency, tech stack
6. **Support**: Contact information

## User Experience Improvements

1. **Better Readability**: High contrast text on appropriate backgrounds
2. **Cleaner Interface**: Removed unnecessary visual clutter
3. **Consistent Theme**: Dark green throughout with white/black contrast
4. **Professional Look**: Minimalist, data-focused design
5. **Helpful Documentation**: Built-in help system for new users

## Technical Implementation

- All color changes use Tailwind CSS classes
- Maintained all existing functionality
- No breaking changes to backend or API
- Responsive design preserved
- Animations and transitions intact
- Accessibility maintained

## Result

A professional, clean dashboard with:
- Dark green background (#0d3b2e)
- Black text for primary content
- White text for secondary content
- No unnecessary colors or decorations
- Built-in documentation system
- Excellent readability and usability
