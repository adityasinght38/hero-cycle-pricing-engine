# Prompts Used

This file documents every AI prompt used during the development of this project, as required by the assignment.

---

## 1. Problem Analysis & Breakdown

**Prompt:**
> "I'm a fresher engineer joining Hero Cycles. My manager gave me this brief: 'We sell thousands of cycle configurations with different frames, gear sets, and tyre types. Part costs change every few months. Everything is on Excel. We need a pricing engine salespersons can use to manage cycle configs and parts, and instantly get the total price broken down by component.' Help me break this down as a product: stakeholders, requirements, key questions, and assumptions."

**Used for:** Writing Part 1 of the assignment (Problem Breakdown in README)

---

## 2. MongoDB Schema Design

**Prompt:**
> "Design a MongoDB schema for a bicycle pricing engine. I need two collections: Parts (with price history tracking — every time a price changes, record the old price, when it changed, and a note) and Configurations (which should snapshot part prices at creation time so a config is not affected by future price changes). Show me the Mongoose model code."

**Used for:** Creating `models/Part.js` and `models/Configuration.js`

---

## 3. Express API Structure

**Prompt:**
> "Create Express.js REST API routes for a bicycle parts management system. I need:
> - GET /api/parts (with optional category and isActive filter)
> - POST /api/parts
> - PUT /api/parts/:id (should auto-log price changes to history)
> - DELETE /api/parts/:id
> - GET /api/parts/:id/price-history
> Use async/await, proper error handling, and HTTP status codes."

**Used for:** `routes/parts.js`

---

## 4. Configuration Builder UI

**Prompt:**
> "Generate a React component for a cycle configuration builder. It should:
> - Show a list of parts as checkboxes
> - Update the total price live as user selects/deselects parts
> - Show a price breakdown sidebar with subtotal + GST (18%)
> - Have a form to name the configuration and pick target audience
> - On submit, POST to /api/configurations with selected part IDs
> Use only React hooks (useState, useEffect), no external state library."

**Used for:** `pages/ConfigurationBuilder.js`

---

## 5. Price History Feature

**Prompt:**
> "How do I track price history in Mongoose? I want: whenever a part's price is updated, the old price and timestamp are saved in a priceHistory array embedded in the same document. The current price should always be the latest one. Show me the Mongoose pre-save hook approach."

**Used for:** Price history logic in `models/Part.js`

---

## 6. Unit Tests

**Prompt:**
> "Write Jest unit tests for a bicycle pricing engine. Test the core pricing logic as pure functions:
> - calculateTotal: sum of priceAtTime across selected parts
> - price history tracking
> - GST calculation at 18%
> - input validation (empty name, negative price, missing category)
> Do not mock MongoDB — test only the pure business logic."

**Used for:** `pricing.test.js`

---

## 7. Recalculate Feature

**Prompt:**
> "I have a saved cycle configuration that snapshotted part prices at creation. Now part prices have changed. Write an Express endpoint POST /api/configurations/:id/recalculate that fetches the latest prices for all parts in the config, updates the priceAtTime values, recalculates the total, and returns the old total, new total, and difference."

**Used for:** `routes/configurations.js` — recalculate endpoint

---

## 8. UI Design System

**Prompt:**
> "I'm building a dark-themed internal tool for Hero Cycles — a bicycle manufacturer. Design a CSS design system: color palette (background, surface, border colors, and accent colors for price/money display and brand), typography (distinctive font pairing — one display/header face and one body face), and component classes for cards, buttons, tables, badges by category, modals, and form inputs. Make it feel industrial and professional, not generic."

**Used for:** `index.css`

---

## 9. README

**Prompt:**
> "Write a professional README for a full-stack bicycle pricing engine built with React, Node.js/Express, and MongoDB. Include: project overview, features list, tech stack, local setup instructions (with MongoDB Atlas setup), environment variables, API documentation, database schema, assumptions made, questions asked during design, and deployment instructions for Vercel (frontend) and Render (backend)."

**Used for:** `README.md`

---

## 10. Dashboard Stats

**Prompt:**
> "Write a MongoDB aggregation query that returns: total parts count, active parts count, total configurations count, category-wise part count with average price, and the top 5 most expensive configurations. Use Promise.all for parallel queries."

**Used for:** `routes/dashboard.js`
