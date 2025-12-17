# Agreement Step 3: Quick Reference Guide

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Step 3 of 5: Pricing / Items                               │
│ Select variable items and set pricing                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔍 [Search for items...]                                   │
│                                                             │
│ Variable Inventory Items                     (2 selected)   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ☑ Copper Pipe - 1/2 inch                           │   │
│ │   SKU: PLUMB-PIPE-002 • Default: $8.50            │   │
│ │   Price: $ [8.50]                                  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ☑ PVC Pipe - 3 inch                                │   │
│ │   SKU: PLUMB-PIPE-005 • Default: $12.75           │   │
│ │   Price: $ [12.75]                                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [◀ Back]                                      [Next ▶]      │
└─────────────────────────────────────────────────────────────┘
```

## Interaction Flow

### 1. Item Selection
```
User clicks checkbox → Item selected
                    ↓
                Price field enabled
                    ↓
                Default price pre-filled
```

### 2. Price Editing
```
User enters price → Value validated
                  ↓
         If invalid (≤ 0) → Red border + error message
                  ↓
         If valid (> 0) → Green validation
```

### 3. Item Deselection
```
User unchecks box → Item deselected
                  ↓
              Price cleared
                  ↓
          Price field disabled
```

### 4. Navigation
```
User clicks Next → Validation check
                 ↓
       If items selected + valid prices → Step 4
                 ↓
       If no items / invalid prices → Error toast
```

## State Flow

```typescript
// Initial State
selectedInventoryIds: Set<string>()  // Empty set
itemPrices: Record<string, number>   // Empty object

// After Selecting Item "INV-ITEM-002"
selectedInventoryIds: Set<string>('INV-ITEM-002')
itemPrices: { 'INV-ITEM-002': 8.50 }

// After Editing Price to $10.00
selectedInventoryIds: Set<string>('INV-ITEM-002')
itemPrices: { 'INV-ITEM-002': 10.00 }

// After Deselecting Item
selectedInventoryIds: Set<string>()
itemPrices: {}
```

## Validation Rules

| Condition | Result | Action |
|-----------|--------|--------|
| No items selected | ❌ Invalid | Show amber warning banner |
| 1+ items selected, all prices > 0 | ✅ Valid | Enable Next button |
| Selected item with price ≤ 0 | ❌ Invalid | Red border, error message |
| Selected item with empty price | ❌ Invalid | Red border, error message |

## Component Hierarchy

```
Agreements
├── TabletHeader
├── Add Agreement Panel (40%)
│   └── Step 3 Content
│       ├── Step Header
│       ├── Search Input
│       ├── Inventory List
│       │   ├── Checkbox
│       │   ├── Item Info
│       │   └── Price Input
│       ├── Validation Warning (conditional)
│       └── Navigation Buttons
└── Agreement List (60%)
```

## Key Features

### ✅ Implemented
- Multi-select with checkboxes
- Real-time search (name + SKU)
- Only variable inventory items (type "V")
- Editable pricing with validation
- Default price pre-fill
- Visual selection feedback
- Inline error messages
- Empty state handling
- Responsive scrolling

### ❌ Not Implemented (Out of Scope)
- Quantity selection per item
- Bulk select/deselect
- Item images
- Category filtering
- Sorting options

## Usage Example

### Step-by-Step User Flow

1. **Navigate to Step 3**
   - Complete Steps 1 & 2
   - Click "Next" from Step 2

2. **Search for Items** (Optional)
   - Type "pipe" in search box
   - List filters to show only matching items

3. **Select Items**
   - Check "Copper Pipe" → Price field enables with $8.50
   - Check "PVC Pipe" → Price field enables with $12.75

4. **Edit Prices** (Optional)
   - Click in price field
   - Change value to custom amount
   - Validation runs automatically

5. **Proceed to Step 4**
   - Click "Next" button
   - Agreement saved with selected items and prices

## Error Scenarios

### No Variable Items Available
```
┌─────────────────────────────────────┐
│ ⚠️ No variable items available     │
│                                     │
│ Add variable items in Inventory     │
│ to continue                         │
└─────────────────────────────────────┘
```

### Search Returns No Results
```
┌─────────────────────────────────────┐
│ No items match your search          │
└─────────────────────────────────────┘
```

### Validation Failed
```
⚠️ At least one item with valid pricing
   is required to proceed
```

## Testing Checklist

- [ ] Variable items display correctly
- [ ] Fixed-price items excluded
- [ ] Search filters properly
- [ ] Checkbox selection works
- [ ] Price input enables on select
- [ ] Default price pre-fills
- [ ] Price validation shows errors
- [ ] Next button disabled when invalid
- [ ] Back button returns to Step 2
- [ ] Toast shows on validation error
- [ ] Empty state displays correctly
- [ ] Scroll works with many items

## Browser Testing

- [ ] Chrome (Desktop)
- [ ] Safari (Desktop)
- [ ] iPad Safari (Primary target)
- [ ] Chrome (Tablet emulation)
- [ ] Edge (Desktop)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Move between checkboxes/inputs |
| Space | Toggle checkbox |
| Enter | Submit (if on Next button) |
| Esc | Clear search (if focused) |

---

**Dev Server:** http://localhost:8082/  
**Route:** `/agreements` → Click "+" → Step 3  
**File:** `tablet-version/src/pages/Agreements.tsx`
