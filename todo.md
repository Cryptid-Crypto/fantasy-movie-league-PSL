# Fantasy Movie League - Project TODO

## Core Infrastructure
- [x] Database schema for movies, scenes, performers, actions, tournaments
- [x] Web3 wallet integration with Ethers.js/Wagmi for Polygon
- [x] Dark mode cinematic UI theme setup

## Admin Features
- [x] Admin authentication and role-based access control
- [x] Movie management (add, edit, delete movies)
- [x] Scene management within movies
- [x] Performer management (profiles, bios, images)
- [x] Action types management with point values (e.g., facial=10pts, double penetration=20pts)
- [x] Scene-performer-action logging system

## User Features
- [x] User authentication with wallet connection
- [x] Performer profile pages with bio and recent performances feed
- [x] NFT inventory page reading from Polygon wallet
- [x] User dashboard showing owned NFTs and tournaments

## Tournament System
- [x] Tournament creation with start/end dates
- [x] NFT-gated entry logic (require specific Performer NFT ownership)
- [x] Tournament entry tracking
- [x] Active/upcoming/past tournament views

## Scoring & Leaderboard
- [x] Scene scorer logic aggregating action points
- [x] Real-time leaderboard calculation during tournament timeframe
- [x] Tournament results and winner determination

## Smart Contract
- [x] Mock ERC-2981 Performer NFT contract structure
- [x] Contract documentation and integration guide

## Testing & Polish
- [ ] Unit tests for scoring logic
- [ ] Integration tests for tournament flow
- [ ] UI/UX polish and responsive design
- [x] Documentation for deployment

## Branding Update
- [x] Rename platform from "Fantasy Movie League" to "Porn Star League"
- [x] Integrate PornStarLeagueLogoTB.png logo across all pages
- [x] Update all text references to use new branding

## Design Update
- [x] Replace cyberpunk theme with clean, high-end luxury aesthetic
- [x] Update color palette to sophisticated, premium colors (charcoal & gold)
- [x] Refine typography and spacing for minimalist look
- [x] Remove neon effects and glow animations

## Color Scheme Update
- [x] Replace gold/charcoal palette with black, white, blue, and red
- [x] Update primary color to blue
- [x] Update accent color to red
- [x] Maintain clean, high-end aesthetic with new colors

## Remove Gradients
- [x] Remove all gradient effects from text and backgrounds
- [x] Replace gradient text with solid color text
- [x] Keep all colors solid throughout the platform

## Sample Data Population
- [x] Create seed script to populate database with sample data
- [x] Add 10-15 sample porn stars with profiles
- [x] Add 5-10 sample movies with release dates
- [x] Add scenes with performer actions and points
- [x] Create 2-3 sample tournaments (active, upcoming, completed)
- [x] Add action types with point values

## Movie-Performer Workflow Improvement
- [x] Add movie_performers junction table to link performers to movies
- [x] Update admin movie manager to add/remove performers from movies
- [x] Update scene manager to only show performers from the selected movie
- [x] Allow multiple actions per performer per scene
- [x] Update database schema and migrations
- [x] Update seed script to include movie-performer relationships

## Authentication Fix
- [x] Fix login redirect issue - users not being redirected to login when accessing protected pages
- [x] Ensure admin dashboard is accessible after login
- [x] Test complete authentication flow

## Login UI Improvement
- [ ] Add prominent "Sign In" button to homepage navigation when not logged in
- [ ] Ensure login button is visible and accessible from all pages

## Performer Autocomplete Feature
- [x] Replace performer dropdown with autocomplete/combobox in MoviePerformersManager
- [x] Show matching performers as user types
- [x] Add "Create new performer" option when no matches found
- [x] Implement inline performer creation dialog

## Performer Creation Error Fix
- [x] Debug and fix error when creating new performer
- [x] Check database schema and mutation logic
- [x] Test performer creation flow end-to-end

## Performer Addition Error Fix
- [x] Debug error when adding performer to movie through MoviePerformersManager
- [x] Check if issue is in frontend component or backend mutation
- [x] Verify the add performer to movie mutation is working correctly

## Performer Type Feature
- [x] Add performerType enum field to performers table in database schema
- [x] Update createPerformer and updatePerformer functions to handle performer type
- [x] Add performer type dropdown to PerformersManager create/edit forms
- [x] Add performer type dropdown to MoviePerformersManager create form
- [x] Display performer type badge on performer profile pages
- [ ] Add performer type filter to Performers list page
- [x] Update seed script to include performer types for sample data

## Tournament Roster Requirements
- [x] Add tournamentRosterRequirements table to database schema
- [x] Create UI for admins to define roster requirements when creating tournaments
- [x] Allow specifying number of performers needed per type (Legend, Anal Queen, etc.) or "Any Type"
- [ ] Update tournament entry validation to check if user's selected performers meet requirements
- [ ] Display roster requirements on tournament cards and detail pages
- [ ] Show user's progress toward meeting requirements in entry UI
- [x] Update seed script to include roster requirements for sample tournaments

## Display Roster Requirements on Tournament Cards
- [x] Add backend query to fetch roster requirements for tournaments
- [x] Display roster requirements on tournament list page
- [x] Display roster requirements on tournament detail page
- [x] Format requirements clearly (e.g., "2 Legends, 1 Anal Queen, 2 Any Type")

## Tournament Entry UI
- [x] Create tournament entry page/modal
- [x] Build performer selection interface with user's NFT collection
- [x] Add real-time validation showing which roster requirements are met
- [x] Show visual feedback for fulfilled vs unfulfilled requirements
- [x] Validate NFT ownership before allowing entry
- [x] Submit tournament entry with selected performers
- [x] Write vitest tests for tournament entry validation
- [x] Update database schema to support multiple performers per entry (roster)
- [x] Create tournamentEntryPerformers junction table
- [x] Update backend functions for roster-based entries
- [x] Update leaderboard to display rosters instead of single performers

## Number Input Fix
- [x] Fix roster requirement count input to allow deleting existing value
- [x] Allow users to select all and type new number without field resetting

## Performer Statistics Page
- [x] Create database queries to aggregate performer statistics
- [x] Calculate total points earned across all scenes
- [x] Show action breakdown (count and points per action type)
- [x] Display movies and scenes performed in
- [x] Show average points per scene
- [ ] List tournament participation history
- [x] Create statistics page UI with charts and metrics
- [x] Add navigation link from performer profile to statistics page
- [x] Write and pass vitest tests for statistics feature
