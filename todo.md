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

## Roster Editing and Backend Validation
- [x] Add backend validation for roster requirements in tournament entry endpoint
- [x] Verify NFT ownership on server-side before accepting entry
- [x] Validate that roster meets all tournament requirements (type and count)
- [x] Return detailed validation errors to frontend
- [x] Add endpoint to check if user has existing entry for tournament
- [x] Create endpoint to update/edit existing tournament entry roster
- [x] Add UI to edit roster for tournaments that haven't started yet
- [x] Show "Edit Roster" button on tournament cards when user has entry
- [x] Prevent roster editing after tournament starts
- [x] Write vitest tests for backend validation logic
- [x] Write vitest tests for roster editing functionality

## React Hooks Error Fix
- [x] Fix "Rendered more hooks than during the previous render" error in Tournaments page
- [x] Remove conditional hook calls inside forEach loop
- [x] Properly fetch user entries for all tournaments without violating hooks rules

## Test NFT Creation
- [x] Query database for owner user ID
- [x] Add test NFTs to owner's inventory for tournament testing
- [x] Include NFTs with different performer types (Legend, Anal Queen, Super Slut, etc.)
- [x] Verify NFTs appear in My NFTs page

## OAuth Callback Error Fix
- [ ] Check server logs for OAuth callback errors
- [ ] Verify OAuth configuration and environment variables
- [ ] Fix OAuth callback handler to properly handle redirects
- [ ] Test login flow end-to-end

## Development Authentication Bypass
- [x] Add development-only auto-login endpoint
- [x] Create session for owner user without OAuth
- [x] Test all features work with bypass authentication
- [x] Document that this is temporary for testing only

## Tournament Scoring Fix
- [ ] Investigate why scores don't update when movies are added
- [ ] Fix scoring calculation to include all performer scene actions
- [ ] Ensure tournament leaderboard updates automatically
- [ ] Test scoring with sample movie data

## React Hooks Error Fix (Second Instance)
- [x] Identify source of "Rendered more hooks" error
- [x] Fix conditional or loop-based hook calls
- [x] Test all pages to ensure error is resolved

## Scoring System Demo Data
- [x] Add sample scene performer actions to database
- [x] Ensure actions are in tournament date range
- [x] Verify scores calculate correctly
- [x] Document scoring data requirements for users

## Crypto Payment System (MATIC → PSL Token Ready)
- [x] Add walletAddress field to users table
- [x] Add entryFee, prizePool, paymentToken fields to tournaments table
- [x] Create transactions table for tracking payments and payouts
- [x] Install wagmi, viem, and Web3 dependencies
- [x] Set up Web3 provider and wallet connection UI
- [x] Create smart contract for tournament escrow (Solidity)
- [ ] Deploy smart contract to Polygon testnet
- [ ] Build payment flow: connect wallet → pay entry fee → enter tournament
- [ ] Add prize pool display on tournament cards and detail pages
- [ ] Implement payout structure (1st place 50%, 2nd place 30%, 3rd place 20%)
- [ ] Create admin function to trigger winner payouts
- [ ] Add transaction history page for users
- [ ] Test full payment flow on testnet
- [ ] Document PSL token migration path


## Admin Content Management Panel
- [x] Create admin router with protected endpoints
- [x] Add movie CRUD endpoints (create, read, update, delete)
- [x] Add scene CRUD endpoints
- [x] Add scene performer assignment endpoints
- [x] Add scene action assignment endpoints
- [x] Add performer CRUD endpoints
- [x] Add admin role check middleware (adminProcedure)
- [ ] Build admin dashboard layout with navigation
- [ ] Create movie management page with list and forms
- [ ] Create scene management page with performer/action assignment
- [ ] Create performer management page
- [ ] Protect admin routes on frontend
- [ ] Test all CRUD operations

## Performer Type Logo Badges
- [x] Design and generate logo badge for Legend type
- [x] Design and generate logo badge for Anal Queen type
- [x] Design and generate logo badge for Super Slut type
- [x] Design and generate logo badge for Extreme type
- [x] Design and generate logo badge for Girl Next Door type
- [x] Design and generate logo badge for Rising Star type
- [x] Design and generate logo badge for Hall of Fame type
- [x] Design and generate logo badge for Specialist type
- [x] Design and generate logo badge for MILF type
- [x] Save all logos to project assets directory
- [ ] Integrate type logos into NFT cards and profile pages

## NFT Portrait Generation
- [x] Create NFT portrait for Luna Star with PSL logo
- [x] Create NFT portrait for Ryan Connor with PSL logo (with diamond frame)
- [ ] Create NFT portraits for remaining performers

## Database Integration - Ryan Connor Performer
- [x] Upload Ryan Connor NFT portrait to S3 storage
- [x] Upload Ryan Connor NFT card to S3 storage
- [x] Add Ryan Connor to performers table with all attributes
- [ ] Associate performer type badges (Anal Queen, MILF, Legend) with Ryan Connor
- [ ] Associate country (USA) with Ryan Connor

## NFT Portrait Generation - Batch 2 (6 Performers)
- [x] Research Veronica Leal - find reference images and signature features
- [x] Research Jane Wilde - find reference images and signature features
- [x] Research Nicole Kitt - find reference images and signature features
- [x] Research Millie Morgan - find reference images and signature features
- [x] Research Chanel Camryn - find reference images and signature features
- [x] Research Gal Ritchie - find reference images and signature features
- [x] Generate NFT portrait for Veronica Leal
- [x] Generate NFT portrait for Jane Wilde
- [x] Generate NFT portrait for Nicole Kitt
- [x] Generate NFT portrait for Millie Morgan
- [x] Generate NFT portrait for Chanel Camryn
- [x] Generate NFT portrait for Gal Ritchie
- [x] Create NFT card for Veronica Leal with badges
- [x] Create NFT card for Jane Wilde with badges
- [x] Create NFT card for Nicole Kitt with badges
- [x] Create NFT card for Millie Morgan with badges
- [x] Create NFT card for Chanel Camryn with badges
- [x] Create NFT card for Gal Ritchie with badges
- [x] Upload all portraits and cards to S3 storage
- [x] Add all 6 performers to database with appropriate types

## Fix PSL Logo on Performer Portraits
- [x] Regenerate Veronica Leal portrait with PSL bunny logo on outfit
- [x] Regenerate Jane Wilde portrait with PSL bunny logo on outfit
- [x] Regenerate Nicole Kitt portrait with PSL bunny logo on outfit
- [x] Regenerate Millie Morgan portrait with PSL bunny logo on outfit
- [x] Regenerate Chanel Camryn portrait with PSL bunny logo on outfit
- [x] Regenerate Gal Ritchie portrait with PSL bunny logo on outfit
- [x] Recreate all 6 NFT cards with updated portraits
- [x] Upload updated portraits and cards to S3
- [x] Update database image URLs

## Regenerate NFT Cards with Proper Template
- [ ] Generate Veronica Leal card template matching Ryan Connor style
- [ ] Generate Jane Wilde card template matching Ryan Connor style
- [ ] Generate Nicole Kitt card template matching Ryan Connor style
- [ ] Generate Millie Morgan card template matching Ryan Connor style
- [ ] Generate Chanel Camryn card template matching Ryan Connor style
- [ ] Generate Gal Ritchie card template matching Ryan Connor style
- [ ] Composite exact logos onto all 6 card templates
- [ ] Upload updated cards to S3
- [ ] Update database with new card URLs

## NFT Card Display Issues (CRITICAL - User Reported)
- [x] Fix visible square backgrounds on NFT card badges
- [x] Fix missing performer names on NFT cards (names should be visible in large white text)
- [x] Verify badges have proper transparency in browser (not just image viewers)
- [x] Ensure all 6 performer cards match Ryan Connor template exactly
