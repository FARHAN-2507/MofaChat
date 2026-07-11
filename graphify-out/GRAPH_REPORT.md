# Graph Report - .  (2026-07-12)

## Corpus Check
- Corpus is ~10,610 words - fits in a single context window. You may not need a graph.

## Summary
- 101 nodes · 108 edges · 28 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_React App Shell|React App Shell]]
- [[_COMMUNITY_Design System Brand Identity|Design System Brand Identity]]
- [[_COMMUNITY_Typography & Styling|Typography & Styling]]
- [[_COMMUNITY_API Client Layer|API Client Layer]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_Auth API Routes|Auth API Routes]]
- [[_COMMUNITY_Admin Seeding|Admin Seeding]]
- [[_COMMUNITY_Database Connection|Database Connection]]
- [[_COMMUNITY_Error Handler|Error Handler]]
- [[_COMMUNITY_Markdown Rendering|Markdown Rendering]]
- [[_COMMUNITY_Settings Panel|Settings Panel]]
- [[_COMMUNITY_Dev Panel|Dev Panel]]
- [[_COMMUNITY_Server Entry Point|Server Entry Point]]
- [[_COMMUNITY_Data Migration|Data Migration]]
- [[_COMMUNITY_Conversations Route|Conversations Route]]
- [[_COMMUNITY_Chat Stream Route|Chat Stream Route]]
- [[_COMMUNITY_Settings Route|Settings Route]]
- [[_COMMUNITY_Models Route|Models Route]]
- [[_COMMUNITY_Health Route|Health Route]]
- [[_COMMUNITY_Auth Route|Auth Route]]
- [[_COMMUNITY_Conversation Model|Conversation Model]]
- [[_COMMUNITY_Message Model|Message Model]]
- [[_COMMUNITY_Settings Model|Settings Model]]
- [[_COMMUNITY_User Model|User Model]]
- [[_COMMUNITY_Model Config|Model Config]]
- [[_COMMUNITY_Provider Config|Provider Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_React Entry|React Entry]]

## God Nodes (most connected - your core abstractions)
1. `Claude.com Design System` - 20 edges
2. `Mofa Chat Application` - 13 edges
3. `apiFetch()` - 10 edges
4. `Cream Canvas #faf9f5` - 8 edges
5. `useAuth()` - 6 edges
6. `Coral Primary #cc785c` - 6 edges
7. `Copernicus Tiempos Headline Serif` - 6 edges
8. `Dark Navy Surface #181715` - 6 edges
9. `AppContent()` - 4 edges
10. `Sidebar()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Mofa Chat Application` --references--> `Claude.com Design System`  [EXTRACTED]
  README.md → DESIGN.md
- `Mofa Chat Application` --references--> `Cream Canvas #faf9f5`  [EXTRACTED]
  README.md → DESIGN.md
- `Mofa Chat Application` --references--> `Coral Primary #cc785c`  [EXTRACTED]
  README.md → DESIGN.md
- `Google Fonts Loading` --references--> `Copernicus Tiempos Headline Serif`  [INFERRED]
  client/index.html → DESIGN.md
- `Mofa Chat Application` --references--> `Dark Navy Surface #181715`  [EXTRACTED]
  README.md → DESIGN.md

## Hyperedges (group relationships)
- **Core Brand Identity Elements** — DESIGN_CreamCanvas, DESIGN_CoralPrimary, DESIGN_CopernicusSerif, DESIGN_StyreneBSans, DESIGN_DarkNavySurface, DESIGN_AnthropicSpikeMark [EXTRACTED 1.00]
- **Technology Stack** — READEME_MERNStack, READEME_GroqAPI [EXTRACTED 1.00]

## Communities

### Community 0 - "React App Shell"
Cohesion: 0.13
Nodes (10): AppContent(), AuthPage(), ChatWindow(), groupByDate(), Sidebar(), useAuth(), useConversations(), getSystemTheme() (+2 more)

### Community 1 - "Design System Brand Identity"
Cohesion: 0.16
Nodes (19): Accent Teal and Amber, Anthropic Radial Spike Mark, Button Primary Component, Callout Card Coral Component, Claude.com Design System, Code Window Card Component, Color Block Elevation Rationale, Coral Primary #cc785c (+11 more)

### Community 2 - "Typography & Styling"
Cohesion: 0.17
Nodes (15): Copernicus Tiempos Headline Serif, Editorial Typography Rationale, Open Source Font Substitutes, StyreneB Inter Sans, Whitespace Editorial Pacing Rationale, Entry HTML Page, Google Fonts Loading, React Root Mount Point (+7 more)

### Community 3 - "API Client Layer"
Cohesion: 0.32
Nodes (11): apiFetch(), authHeaders(), createConversation(), deleteConversation(), fetchConversation(), fetchConversations(), fetchModels(), fetchSettings() (+3 more)

### Community 4 - "Auth Middleware"
Cohesion: 0.5
Nodes (0): 

### Community 5 - "Auth API Routes"
Cohesion: 0.5
Nodes (0): 

### Community 6 - "Admin Seeding"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Database Connection"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Error Handler"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Markdown Rendering"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Settings Panel"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Dev Panel"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Server Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Data Migration"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Conversations Route"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Chat Stream Route"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Settings Route"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Models Route"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Health Route"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Auth Route"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Conversation Model"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Message Model"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Settings Model"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "User Model"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Model Config"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Provider Config"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "React Entry"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **14 isolated node(s):** `Anthropic Radial Spike Mark`, `Color Block Elevation Rationale`, `Pricing Tier Card Component`, `4px Base Spacing System`, `Design Do and Dont Principles` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Admin Seeding`** (2 nodes): `seedAdmin()`, `seed.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Connection`** (2 nodes): `connectDB()`, `db.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Error Handler`** (2 nodes): `errorHandler()`, `errorHandler.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Markdown Rendering`** (2 nodes): `MarkdownRenderer.jsx`, `MarkdownRenderer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Panel`** (2 nodes): `SettingsPanel.jsx`, `SettingsPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dev Panel`** (2 nodes): `DevPanel.jsx`, `DevPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Server Entry Point`** (1 nodes): `server.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Migration`** (1 nodes): `migrate.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversations Route`** (1 nodes): `conversations.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat Stream Route`** (1 nodes): `chat.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Route`** (1 nodes): `settings.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Models Route`** (1 nodes): `models.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Health Route`** (1 nodes): `health.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Route`** (1 nodes): `auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversation Model`** (1 nodes): `Conversation.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Message Model`** (1 nodes): `Message.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Model`** (1 nodes): `Settings.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `User Model`** (1 nodes): `User.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Model Config`** (1 nodes): `models.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Provider Config`** (1 nodes): `provider.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Entry`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Claude.com Design System` connect `Design System Brand Identity` to `Typography & Styling`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `Mofa Chat Application` connect `Typography & Styling` to `Design System Brand Identity`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Mofa Chat Application` (e.g. with `Entry HTML Page` and `Google Fonts Loading`) actually correct?**
  _`Mofa Chat Application` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `useAuth()` (e.g. with `AppContent()` and `Sidebar()`) actually correct?**
  _`useAuth()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Anthropic Radial Spike Mark`, `Color Block Elevation Rationale`, `Pricing Tier Card Component` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._