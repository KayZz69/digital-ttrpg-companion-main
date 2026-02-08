# 🎮 Digital TTRPG Companion - Learning Path

A structured guide to learning web development through your tabletop RPG companion app.

---

## Your Tech Stack

| Technology | What It Does | Learning Priority |
|------------|--------------|-------------------|
| **HTML/JSX** | Structure of the UI | 🔴 Start here |
| **CSS/Tailwind** | Styling and layout | 🔴 Start here |
| **TypeScript** | JavaScript with types | 🟡 Learn gradually |
| **React** | UI components & state | 🟡 Learn gradually |
| **Vite** | Build tool | 🟢 Learn later |

---

## Level 1: Text & Color Changes (Zero Risk)

**Goal:** Get comfortable editing code and seeing changes instantly.

### 🎯 Exercise 1.1: Change Page Titles
**File:** [NotFound.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/NotFound.tsx)

This 33-line file is perfect for your first edit:

```tsx
// Find this line (around line 22):
<h1 className="mb-4 text-4xl font-bold">404</h1>

// Change "404" to something fun like:
<h1 className="mb-4 text-4xl font-bold">🐉 Dragon Not Found!</h1>
```

**Learning:** You just edited JSX! The `<h1>` is HTML inside JavaScript.

---

### 🎯 Exercise 1.2: Customize the Dice Roller Header
**File:** [DiceRoller.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/DiceRoller.tsx)

```tsx
// Find line 25-28:
<h1 className="text-3xl font-bold mb-2">Dice Roller</h1>
<p className="text-muted-foreground">
  Roll dice for your solo adventures
</p>

// Change the text to personalize it:
<h1 className="text-3xl font-bold mb-2">⚔️ Battle Dice</h1>
<p className="text-muted-foreground">
  May the dice gods favor you!
</p>
```

---

### 🎯 Exercise 1.3: Change Theme Colors
**File:** [index.css](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/index.css)

The colors are defined as CSS variables using HSL (Hue, Saturation, Lightness):

```css
/* Line 17 - Primary color (currently warm brown) */
--primary: 25 60% 45%;

/* Try changing to different colors: */
--primary: 220 70% 50%;  /* Blue theme */
--primary: 160 60% 40%;  /* Teal/green theme */
--primary: 350 70% 50%;  /* Red/crimson theme */
```

**Learning:** HSL format is `hue(0-360) saturation% lightness%`. The hue wheel: 0=red, 60=yellow, 120=green, 180=cyan, 240=blue, 300=magenta.

---

## Level 2: Layout & Styling (Low Risk)

**Goal:** Understand how Tailwind CSS classes work.

### 🎯 Exercise 2.1: Decode Tailwind Classes
Look at this line from [NotFound.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/NotFound.tsx):

```tsx
<div className="flex min-h-screen items-center justify-center bg-muted">
```

| Class | Meaning |
|-------|---------|
| `flex` | Use flexbox layout |
| `min-h-screen` | Minimum height = full viewport |
| `items-center` | Center items vertically |
| `justify-center` | Center items horizontally |
| `bg-muted` | Background uses the "muted" color variable |

**Challenge:** Try changing `bg-muted` to `bg-primary` - what happens?

---

### 🎯 Exercise 2.2: Change Button Styles
**File:** [DiceRoller.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/DiceRoller.tsx)

```tsx
// Line 30 - find this button:
<Button variant="outline" onClick={() => navigate("/")}>

// Try different variants:
<Button variant="default" ...>   // Filled background
<Button variant="ghost" ...>     // No background until hover
<Button variant="destructive" ...> // Red/danger style
```

**Learning:** The `Button` component has pre-defined variants. This is the shadcn/ui design system at work!

---

### 🎯 Exercise 2.3: Add Spacing and Borders
**File:** [NotFound.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/NotFound.tsx)

```tsx
// Find the inner div (around line 21):
<div className="text-center">

// Add more styling:
<div className="text-center p-8 rounded-xl border bg-card shadow-lg">
```

| New Class | Effect |
|-----------|--------|
| `p-8` | Padding on all sides (8 units = 2rem) |
| `rounded-xl` | Extra-large border radius |
| `border` | 1px border using theme color |
| `bg-card` | Card background color |
| `shadow-lg` | Large drop shadow |

---

## Level 3: Understanding Components (Medium)

**Goal:** Learn how React components work together.

### 🎯 Exercise 3.1: Trace the Component Tree

Start at [DiceRoller.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/DiceRoller.tsx) (line 36):

```tsx
<DiceRollerInterface />
```

**Questions to answer:**
1. Where is `DiceRollerInterface` defined? (Hint: check the imports at the top)
2. Open that file and identify what other components IT uses
3. Draw a simple tree of which components contain which

---

### 🎯 Exercise 3.2: Understand Props

Look at [Index.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/Index.tsx) lines 12-16:

```tsx
interface IndexProps {
  editMode?: boolean;
}
```

This defines what data the component can receive:
- `editMode` is a **prop** (input to the component)
- `?` means it's optional
- `boolean` means it can only be `true` or `false`

**Challenge:** Can you add a new prop called `title` of type `string` and use it in the JSX?

---

### 🎯 Exercise 3.3: Add a New Simple Component
Create a new file: `src/components/Footer.tsx`

```tsx
/**
 * Simple footer component for the app.
 */
const Footer = () => {
  return (
    <footer className="text-center p-4 text-muted-foreground text-sm">
      Made with ❤️ for TTRPG adventurers
    </footer>
  );
};

export default Footer;
```

Then import and use it in a page like `NotFound.tsx`:
```tsx
import Footer from "@/components/Footer";

// Add before the final closing </div>:
<Footer />
```

---

## Level 4: TypeScript Basics (Medium)

**Goal:** Understand type definitions and why they help.

### 🎯 Exercise 4.1: Read Type Definitions
**File:** [types/dice.ts](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/types/dice.ts)

This file defines the "shape" of dice data:

```tsx
export type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";
```

**Reading this:** A `DiceType` can ONLY be one of these exact strings. If you try to use `"d7"`, TypeScript will show an error!

**Challenge:** Add a new die type, like `"d3"`. What files might need updating?

---

### 🎯 Exercise 4.2: Explore the DiceRoll Interface

```tsx
export interface DiceRoll {
  id: string;           // Unique identifier
  timestamp: Date;      // When rolled
  diceType: DiceType;   // Uses the type we defined above!
  numberOfDice: number; // How many dice (e.g., 2 for 2d6)
  modifier: number;     // +/- to add
  // ... more fields
}
```

**Learning:** Interfaces define the "contract" for data objects. Every `DiceRoll` MUST have these fields.

---

## Level 5: State & Interactivity (Advanced)

**Goal:** Understand how React manages changing data.

### 🎯 Exercise 5.1: Find useState in Action
**File:** [Index.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/Index.tsx)

```tsx
const [selectedSystem, setSelectedSystem] = useState<GameSystem | null>(null);
```

Breaking this down:
- `selectedSystem` = current value (starts as `null`)
- `setSelectedSystem` = function to change the value
- `useState` = React hook that makes the component re-render when value changes

**Experiment:** Add `console.log(selectedSystem)` inside the component and watch the console as you click different game systems.

---

## 📋 File Complexity Guide

Use this to pick appropriate files for your skill level:

| File | Lines | Complexity | Good For Learning |
|------|-------|------------|-------------------|
| [NotFound.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/NotFound.tsx) | 33 | ⭐ Easy | First edits, Tailwind basics |
| [DiceRoller.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/DiceRoller.tsx) | 41 | ⭐ Easy | Component composition, navigation |
| [NavLink.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/components/NavLink.tsx) | 48 | ⭐⭐ Medium | Props, forwardRef |
| [Index.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/Index.tsx) | 67 | ⭐⭐ Medium | State, conditional rendering |
| [types/dice.ts](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/types/dice.ts) | 47 | ⭐⭐ Medium | TypeScript types |
| [index.css](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/index.css) | 97 | ⭐ Easy | CSS variables, theming |
| [DiceRollerInterface.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/components/DiceRollerInterface.tsx) | ~300 | ⭐⭐⭐ Hard | Complex state, UI logic |
| [CharacterView.tsx](file:///C:/Users/user/.antigravity/digital-ttrpg-companion-main/digital-ttrpg-companion-main/src/pages/CharacterView.tsx) | ~800 | ⭐⭐⭐⭐ Expert | Full feature implementation |

---

## 🚀 Quick Start Checklist

1. [ ] Run `npm run dev` to start the development server
2. [ ] Open the app in your browser (usually http://localhost:8080)
3. [ ] Make a text change in `NotFound.tsx` and save - see it update instantly!
4. [ ] Change a color in `index.css` and watch the theme change
5. [ ] Try adding a Tailwind class like `shadow-lg` to an element

---

## 💡 Tips for Learning

1. **Break things on purpose** - Change something, see it break, then fix it
2. **Use the browser console** - Press F12 to see errors and logs
3. **Read the comments** - This codebase has good JSDoc documentation
4. **Ask questions** - Use me to explain any code you don't understand
5. **Small commits** - Make tiny changes and test frequently

---

## 🔗 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Look up any class
- [React Docs (Beta)](https://react.dev) - Official React tutorials
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) - Type system reference
