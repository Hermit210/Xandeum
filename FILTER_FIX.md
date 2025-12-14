# Filter and My Node Fix

## Issues Fixed

### 1. Filter Buttons Not Working
**Problem**: Active/Offline/Warning filter buttons weren't updating the table when clicked.

**Root Cause**: The `motion.tr` components had animation delays based on index (`delay: index * 0.02`) which prevented proper re-rendering when filters changed.

**Solution**: 
- Removed the index-based delay
- Added `layout` prop for smooth transitions
- Wrapped tbody content with `AnimatePresence mode="popLayout"`
- Changed animation to simple fade in/out with `duration: 0.2`

### 2. My Node Not Showing at Top
**Problem**: When entering a node's public key in "My Node" input, it wasn't being sorted to the top of the list.

**Root Cause**: 
1. The `myNodePubkey` wasn't included in the `useMemo` dependencies
2. No sorting logic to prioritize "My Node"
3. Case-sensitive matching and whitespace issues

**Solution**:
- Added `myNodePubkey` to the `filteredAndSortedNodes` useMemo dependencies
- Added case-insensitive matching with `.toLowerCase()`
- Added `.trim()` to handle pasted text with extra spaces
- Added visual feedback showing if node is found
- Added sorting logic to always put "My Node" at the top:
```typescript
// Always put "My Node" at the top if myNodePubkey is set
const trimmedMyNodePubkey = myNodePubkey.trim().toLowerCase();
const aIsMyNode = trimmedMyNodePubkey && a.pubkey?.toLowerCase().includes(trimmedMyNodePubkey);
const bIsMyNode = trimmedMyNodePubkey && b.pubkey?.toLowerCase().includes(trimmedMyNodePubkey);

if (aIsMyNode && !bIsMyNode) return -1;
if (!aIsMyNode && bIsMyNode) return 1;
```

## Changes Made

1. Updated `filteredAndSortedNodes` useMemo:
   - Added myNodePubkey sorting logic
   - Added myNodePubkey to dependencies array

2. Updated table row animations:
   - Changed from `initial={{ opacity: 0, y: 20 }}` with delay to simple fade
   - Added `layout` prop for smooth position transitions
   - Added `exit={{ opacity: 0 }}` for smooth removal
   - Wrapped with `AnimatePresence mode="popLayout"`

## Result

✅ Filter buttons now work correctly - clicking Active/Warning/Offline filters the table
✅ My Node appears at the top when pubkey is entered
✅ Smooth animations when filtering and sorting
✅ Table updates immediately when filters change
