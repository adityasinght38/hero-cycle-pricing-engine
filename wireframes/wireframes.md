# Wireframes — Hero Cycle Pricing Engine

## Screen 1: Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  DASHBOARD                                  │
│  ─────────────    │  Live overview of parts, pricing and configs│
│  ▣ Dashboard  ←   │                                             │
│  ⊞ Parts Library  │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  + New Config     │  │ TOTAL    │ │ CONFIGS  │ │ CATEG-   │   │
│  ≡ Saved Configs  │  │ PARTS    │ │          │ │ ORIES    │   │
│                   │  │          │ │          │ │          │   │
│                   │  │   24     │ │   12     │ │    8     │   │
│                   │  │ 22 active│ │ 10 active│ │ all parts│   │
│                   │  └──────────┘ └──────────┘ └──────────┘   │
│                   │                                             │
│                   │  ┌─────────────────┐ ┌─────────────────┐   │
│                   │  │ Parts by        │ │ Top Configs     │   │
│                   │  │ Category        │ │ by Price        │   │
│                   │  │                 │ │                 │   │
│                   │  │ ● Frame   3     │ │ 1 Mountain Pro  │   │
│                   │  │ ● Tyre    5     │ │   ₹18,500       │   │
│                   │  │ ● Gear    4     │ │ 2 City Cruiser  │   │
│                   │  │ ● Seat    2     │ │   ₹12,200       │   │
│                   │  │ ...             │ │ ...             │   │
│                   │  └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Screen 2: Parts Management

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  PARTS LIBRARY               [+ Add Part]  │
│                   │  Manage all bicycle components              │
│                   │                                             │
│                   │  [Search by name or SKU...] [Category ▼]   │
│                   │                                             │
│                   │  ┌───────────────────────────────────────┐  │
│                   │  │ Name      │ Cat   │ SKU  │ Price │ ... │  │
│                   │  ├───────────────────────────────────────┤  │
│                   │  │ Mtn Tyre  │[Tyre] │ T001 │ ₹250  │ ...│  │
│                   │  │ Alum Frame│[Frame]│ F001 │ ₹5000 │ ...│  │
│                   │  │ Shimano 21│[Gear] │ G001 │ ₹2000 │ ...│  │
│                   │  │           │       │      │       │    │  │
│                   │  │  [📈 History] [Edit] [Delete]         │  │
│                   │  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Add Part Modal

```
┌──────────────────────────────────────┐
│  Add New Part                   [✕]  │
│  ──────────────────────────────────  │
│  Part Name *         Category *      │
│  [Mountain Tyre   ]  [Tyre      ▼]   │
│                                      │
│  Price (INR) *       SKU             │
│  [₹ 250          ]  [TYR-MTN-001]   │
│                                      │
│  Description                         │
│  [26 inch all-terrain tyre...     ]  │
│                                      │
│            [Cancel]  [Add Part]      │
└──────────────────────────────────────┘
```

### Price History Modal

```
┌──────────────────────────────────────┐
│  Price History — Mountain Tyre  [✕]  │
│  Current price: ₹250                 │
│  ──────────────────────────────────  │
│  ● 18 Jun 2026  ₹250                 │
│    Updated from ₹220 to ₹250         │
│                                      │
│  ● 1 Mar 2026   ₹220                 │
│    Updated from ₹200 to ₹220         │
│                                      │
│  ● 1 Jan 2026   ₹200                 │
│    Initial price                     │
│                              [Close] │
└──────────────────────────────────────┘
```

## Screen 3: Configuration Builder

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  CONFIGURATION BUILDER                      │
│                   │  Select parts — prices update in real-time  │
│                   │                                             │
│                   │  ┌────────────────────┐ ┌───────────────┐   │
│                   │  │ SELECT PARTS       │ │ PRICE BREAKDOWN│  │
│                   │  │ [Search] [Cat ▼]   │ │               │   │
│                   │  │                    │ │ Alum Frame     │   │
│                   │  │ ☑ Alum Frame ₹5000│ │         ₹5,000 │   │
│                   │  │ ☑ Mtn Tyre  ₹250  │ │ Mtn Tyre       │   │
│                   │  │ ☐ Road Tyre ₹180  │ │           ₹250 │   │
│                   │  │ ☑ Shimano21 ₹2000 │ │ Shimano 21     │   │
│                   │  │ ☐ Sports Seat ₹400│ │         ₹2,000 │   │
│                   │  │ ☑ Disc Brake ₹800 │ │ Disc Brake     │   │
│                   │  │ ...               │ │           ₹800 │   │
│                   │  │                   │ │ ─────────────  │   │
│                   │  │                   │ │ Subtotal ₹8,050│   │
│                   │  │                   │ │ GST 18%  ₹1,449│   │
│                   │  │                   │ │ ─────────────  │   │
│                   │  │                   │ │ TOTAL   ₹9,499 │   │
│                   │  └────────────────────┘ │               │   │
│                   │                         │ CONFIG DETAILS │   │
│                   │                         │ Name: ________ │   │
│                   │                         │ Audience: [▼]  │   │
│                   │                         │ [Save · ₹8,050]│   │
│                   │                         └───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Screen 4: Saved Configurations (Card Grid)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  CONFIGURATIONS          [+ New Config]    │
│                   │  All saved cycle builds                     │
│                   │                                             │
│                   │  [Search configs...]  12 configs            │
│                   │                                             │
│                   │  ┌──────────────┐ ┌──────────────┐         │
│                   │  │ Mountain Pro │ │ City Cruiser │         │
│                   │  │ [Active]     │ │ [Active]     │         │
│                   │  │ Adult · 5pcs │ │ Youth · 4pcs │         │
│                   │  │ Jun 18, 2026 │ │ Jun 15, 2026 │         │
│                   │  │ [Frame][Tyre]│ │ [Frame][Seat]│         │
│                   │  │ [Gear][Brake]│ │ [Gear][Tyre] │         │
│                   │  │ By R. Sharma │ │ By M. Patel  │         │
│                   │  │ ₹18,500      │ │ ₹12,200      │         │
│                   │  └──────────────┘ └──────────────┘         │
│                   │                                             │
│                   │  (Click any card to see full breakdown      │
│                   │   + Recalculate with latest prices)         │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

1. **Dark industrial theme** — Hero Cycles is a manufacturer. The dark UI with red accent feels mechanical, not like a generic SaaS tool.

2. **Price in amber/gold** — Prices are visually distinct from all other data. You can scan any table and immediately find the cost information.

3. **Card grid for configs** — Salespersons scan visually, not linearly. A card grid is faster to skim than a table when you're looking for a specific cycle model.

4. **Price breakdown visible before save** — The whole point of the tool is knowing the price instantly. The breakdown is always live, never hidden behind a button.

5. **Recalculate is a deliberate action** — Price updates don't automatically apply to old configs. The salesperson chooses when to refresh, which mirrors how quotes work in the real world.
