# Filter Testing Guide

## How to Test the Filters

### Step 1: Open Browser Console
1. Press F12 to open DevTools
2. Go to the Console tab
3. You should see logs like:
   ```
   Filtering with status: all
   Filtered nodes count: 50 from 50
   ```

### Step 2: Test Active Filter
1. Click the "Active" button (should turn teal)
2. Check the console - should show:
   ```
   Filtering with status: active
   Filtered nodes count: X from 50
   ```
3. Check the stats line - should show:
   ```
   50 nodes · 30 active · 5 versions · 45 IPs · Showing X active nodes
   ```
4. The table should show ALL nodes, but Active nodes appear FIRST at the top
5. Active nodes have green dot and "Active" label

### Step 3: Test Warning Filter
1. Click the "Warning" button
2. Console should show: `Filtering with status: warning`
3. Warning nodes appear FIRST at the top
4. Warning nodes have gray dot and "Warning" label

### Step 4: Test Offline Filter
1. Click the "Offline" button
2. Console should show: `Filtering with status: offline`
3. Offline nodes appear FIRST at the top
4. Offline nodes have dark gray dot and "Offline" label

### Step 5: Test Version Filter
1. Select a version from the dropdown (e.g., "1.18.23")
2. Nodes with that version appear FIRST at the top
3. Stats line shows: "Showing X v1.18.23 nodes"

### Step 6: Test Combined Filters
1. Select "Active" + a specific version
2. Nodes matching BOTH filters appear first
3. Stats line shows: "Showing X active v1.18.23 nodes"

### Step 7: Test All Filter
1. Click the "All" button
2. Select "All Versions" from dropdown
3. Console should show: `Filtering with status: all`
4. All nodes visible in default sort order

## What to Look For

### Visual Indicators:
- ✅ Selected filter button turns teal (bg-[#14b8a6])
- ✅ Stats line shows "Showing X [status] nodes" when filtered
- ✅ Table only shows matching nodes
- ✅ Console logs show correct filter status

### If Filters Don't Work:

1. **Check Console Logs**:
   - If you don't see "Filtering with status: X", the useMemo isn't running
   - If filtered count equals total count, the filter logic isn't working

2. **Check Button Clicks**:
   - Click a button and watch the console
   - Should immediately see a new log with the new status

3. **Check Node Status**:
   - Look at the "Status" column in the table
   - Verify nodes have "Active", "Warning", or "Offline" labels

## Expected Behavior

### Important: Filters Now Use Priority Sorting!

The filters DON'T hide nodes - they PRIORITIZE them to the top!

### Active Filter (< 30 seconds since last seen):
- Active nodes appear FIRST at the top
- All other nodes appear below
- Active nodes have green dot and "Active" label
- Status color: bg-[#14b8a6]

### Warning Filter (30-120 seconds):
- Warning nodes appear FIRST at the top
- All other nodes appear below
- Warning nodes have gray dot and "Warning" label
- Status color: bg-gray-500

### Offline Filter (> 120 seconds):
- Offline nodes appear FIRST at the top
- All other nodes appear below
- Offline nodes have dark gray dot and "Offline" label
- Status color: bg-gray-700

### Version Filter:
- Nodes with selected version appear FIRST at the top
- All other versions appear below
- Version badge shows in teal gradient

### Combined Filters:
- Priority 1: Status filter (if active)
- Priority 2: Version filter (if active)
- Priority 3: Normal column sorting

## Debug Information

The code now includes:
1. Console log showing current filter status
2. Console log showing filtered count vs total count
3. Visual indicator in stats line showing filtered count
4. Button highlighting showing active filter

If filters still don't work after checking these, there may be an issue with:
- React state not updating
- useMemo not re-running
- Filter logic not matching node status values
