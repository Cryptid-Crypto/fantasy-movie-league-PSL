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

## Portrait Updates (User Requested)
- [x] Regenerate Jane Wilde portrait with more revealing outfit in 3D animation style
- [x] Regenerate Millie Morgan portrait with more revealing outfit in 3D animation style
- [x] Create updated NFT cards with new portraits
- [x] Upload to S3 and update database

## Country Badge Generation (User Requested)
- [x] Generate Colombia flag badge matching USA badge style
- [x] Generate UK flag badge matching USA badge style
- [x] Update Veronica Leal NFT card with Colombia badge
- [x] Update Gal Ritchie NFT card with UK badge

## Performer Resemblance Fix (User Requested)
- [x] Research Jane Wilde's distinctive features and characteristics
- [x] Research Millie Morgan's distinctive features and characteristics
- [x] Regenerate Jane Wilde portrait with accurate resemblance in 3D animation style
- [x] Regenerate Millie Morgan portrait with accurate resemblance in 3D animation style
- [x] Update NFT cards and upload to S3

## Badge Order Fix (User Requested)
- [x] Update badge order: country flag first, then performer type badge
- [x] Regenerate all 6 NFT cards with correct badge order
- [x] Upload to S3 and update database

## New Performer NFT Cards (User Requested - 18 performers)
- [x] Research performer details and assign badges for: Angela White, Anna Claire Clouds, Violet Myers, Abella Danger, Riley Reid, Lana Rhoades, Cherie DeVille, Kenna James, Lauren Phillips, Gianna Dior, Blake Blossom, Leana Lovings, Octavia Red, Willow Ryder, Kendra Lust, Mia Malkova, Adriana Chechik, Cherry Kiss
- [x] Generate missing country flag badges (Australia, Serbia, etc.)
- [x] Generate missing performer type badges (MILF, Legend, Hall of Fame, etc.)
- [x] Generate 18 performer portraits in 3D animation style with accurate resemblance
- [x] Create NFT cards with proper badge order (country first, then type)
- [x] Upload all cards to S3
- [x] Add all performers to database
- [x] Verify display on website

## Fix ALL 25 Performer Cards (CRITICAL - User Reported)
- [ ] Create Python script to add official PSL bunny logo to portraits
- [ ] Generate clean portraits for 18 new performers (without logo)
- [ ] Process all 25 portraits to add PSL logo programmatically
- [ ] Generate all 25 NFT cards using V3 script with Ryan Connor template
- [ ] Upload all corrected cards to S3 and update database
- [ ] Verify all cards match Ryan Connor template in browser

## NFT Card Quality Review (User Requested)
- [ ] Review all 25 performer cards for cropped arms on sides
- [ ] Verify all cards have proper PSL logo (white diamond + black bunny)
- [ ] Confirm all cards have pure black backgrounds
- [ ] Regenerate any cards with quality issues
- [ ] Update database with fixed card URLs

## Fix Cropped Arms on NFT Cards (User Requested - Option A)
- [x] Identify all performers with arms cropped on sides
- [x] Regenerate portraits for those performers with full arms visible
- [x] Regenerate NFT cards with corrected portraits
- [x] Upload fixed cards to S3
- [x] Update database with new card URLs

## Mobile Optimization (User Requested)
- [x] Audit current mobile experience and identify pain points
- [x] Implement responsive navigation (hamburger menu for mobile)
- [x] Optimize performer cards for mobile (1 column on mobile, 2 on tablet)
- [x] Add mobile-friendly tournament UI with responsive grid
- [x] Implement touch-friendly CSS (larger tap targets, active states)
- [x] Add mobile-specific breakpoints and layouts
- [x] Update viewport meta tag for proper mobile rendering
- [x] Make all buttons and CTAs full-width on mobile
- [ ] Test on various mobile screen sizes (ready for testing)
- [ ] Add PWA features (optional: install prompt, offline support)

## PWA Features (User Requested)
- [x] Create web app manifest (manifest.json) with app metadata
- [x] Add app icons in multiple sizes (192x192, 512x512)
- [x] Implement service worker for offline caching
- [x] Cache static assets (HTML, CSS, JS, images)
- [x] Implement cache-first strategy for performer images
- [x] Add network-first strategy for API calls with fallback
- [x] Create install prompt UI component
- [x] Detect if app is installable and show prompt
- [x] Handle beforeinstallprompt event
- [x] Implement push notification permission request
- [x] Create NotificationSettings component in Dashboard
- [x] Add push notification subscription/unsubscription
- [ ] Test offline functionality (ready for testing)
- [ ] Test install flow on mobile devices (ready for testing)
- [ ] Test push notifications (ready for testing)

## Crypto Payment System (User Requested - Web3 Only)
- [ ] Create ERC-20 PSL token contract on Polygon
- [ ] Integrate USDC contract (Polygon mainnet address)
- [ ] Implement NFT card pack purchase system (5, 10, 20 packs) with USDC
- [ ] Create randomized pack opening mechanism
- [ ] Implement tournament entry fee payment in PSL token
- [ ] Build prize pool smart contract with automatic PSL distribution
- [ ] Add wallet balance display (USDC, PSL, MATIC)
- [ ] Create payment confirmation modals with gas estimates
- [ ] Implement transaction history in Dashboard
- [ ] Add pack opening animation/UI
- [ ] Test all payment flows on Polygon testnet

## Admin Badge Management System (User Requested)
- [ ] Create performer badge management UI in admin dashboard
- [ ] Add multi-select badge picker for each performer
- [ ] Create tRPC mutation to update performer badges
- [ ] Implement automatic card regeneration when badges change
- [ ] Add badge preview before regenerating card
- [ ] Upload regenerated cards to S3 automatically
- [ ] Update database with new card URLs
- [ ] Add loading states during card regeneration
- [ ] Test badge updates and card regeneration flow

## Badge Image Display Fix (User Reported)
- [x] Investigate why badge images are not displaying in BadgeManager
- [x] Fix image paths to correctly reference badge files in /client/public/
- [x] Update badges table with correct iconUrl paths
- [ ] Test badge display in admin dashboard (ready for testing)
- [ ] Save checkpoint with fix

## React Hooks Error Fix - AdminDashboard (User Reported)
- [x] Identify conditional or loop-based hook calls in AdminDashboard
- [x] Fix hook ordering violations (moved useLocation to top before conditional returns)
- [ ] Test AdminDashboard page loads without errors (ready for testing)
- [ ] Save checkpoint with fix

## Badge Transparency Fix & Super Slut Badge (User Reported)
- [x] Check badge files for transparency - all badges have proper PNG transparency
- [x] Verify Super Slut badge exists in files and database - confirmed present
- [x] Improve badge icon display in BadgeManager (larger icons 40x40, cache-busting v=2)
- [x] Add rounded background container for better badge visibility
- [ ] Test badge display after hard browser refresh (Ctrl+Shift+R)
- [ ] Save checkpoint with UI improvements

## Badge Grey Background Fix (User Reported)
- [x] Remove bg-black/5 background from badge icon container in BadgeManager
- [x] Update cache-busting parameter to v=3
- [x] Test badge display - all 9 badges showing proper transparency
- [x] Visual verification complete - no grey backgrounds visible
- [x] Fix confirmed and ready for checkpoint

## Badge Icon Transparency Fix (User Reported - Root Cause)
- [ ] Regenerate Legend badge icon with transparent PNG background
- [ ] Regenerate MILF badge icon with transparent PNG background
- [ ] Regenerate Anal Queen badge icon with transparent PNG background
- [ ] Regenerate Hall of Fame badge icon with transparent PNG background
- [ ] Regenerate Specialist badge icon with transparent PNG background
- [ ] Regenerate Rising Star badge icon with transparent PNG background
- [ ] Regenerate Girl Next Door badge icon with transparent PNG background
- [ ] Regenerate Extreme badge icon with transparent PNG background
- [ ] Regenerate Super Slut badge icon with transparent PNG background
- [ ] Update database with new badge icon paths
- [ ] Test badge display in BadgeManager
- [ ] Save checkpoint

## Stylized 3D Badge Icon Redesign (User Requested)
- [x] Regenerate all 9 badge icons with stylized 3D look (not photorealistic)
- [x] Use playful creative imagery (e.g., peach with crown for Anal Queen)
- [x] No circle frames around icons
- [x] Illustrated/graphic style with visual richness but not realistic
- [x] Ensure transparent PNG backgrounds
- [x] Update database with new icon paths (v5)
- [x] Test in BadgeManager interface - all badges displaying correctly
- [x] Save checkpoint

## Python Version Mismatch Error Fix (User Reported)
- [x] Fix Python version mismatch in NFT card generation (python3.11 vs python3.13)
- [x] Update server code to use correct Python interpreter (changed to python3)
- [x] Verified Python 3.11 has all required packages
- [x] Ready for user testing
- [ ] Save checkpoint

## Portrait Fixes (User Reported)
- [x] Regenerate Adriana Chechik portrait WITHOUT tattoos (incorrectly added)
- [x] Upload corrected portrait to CDN
- [x] Update database with new image URL

## Baby Kxtten Portrait Fix (User Reported)
- [x] Regenerate Baby Kxtten portrait - should be BLONDE with MINIMAL tattoos (not heavily tattooed)
- [x] Upload corrected portrait to CDN
- [x] Update database with correct image URL

## Tattoo Research & Portrait Regeneration (Critical Fix)
- [x] Research actual tattoo details for first 20 performers using reference images
- [x] Document specific tattoo designs, locations, and imagery for first 20 performers
- [x] Regenerate first 20 portraits with accurate specific tattoo descriptions (not generic "has tattoos")
- [x] Upload first 20 corrected portraits to CDN
- [x] Update database with first 20 corrected image URLs
- [ ] Continue research and regeneration for remaining 82 performers
- [ ] Save checkpoint after completion

## Style Adjustment - Artistic Balance
- [x] Regenerate first 20 portraits with new style: 86% realistic / 10% anime / 4% artistic
- [x] Upload adjusted portraits to CDN
- [x] Update database with new image URLs
- [ ] Get user approval on style before continuing with remaining 82 performers

## Abigail Mac & Abella Danger Corrections
- [x] Regenerate Abigail Mac portrait - should have CLEAN SKIN (no tattoos)
- [x] Regenerate Abella Danger portrait - should have CLEAN SKIN (no tattoos)
- [x] Upload corrected portraits to CDN
- [x] Update database with corrected image URLs

## Batch 2 Generation (Performers 21-40) - Clean Skin First Approach
- [x] Generate 20 portraits with CLEAN SKIN by default (86% realistic / 10% anime / 4% artistic)
- [x] Upload to CDN
- [x] Update database
- [ ] User reviews and identifies which performers need tattoos
- [ ] Regenerate only those with tattoos based on user guidance

## Batches 3-6 Generation (Performers 41-102) - Clean Skin First Approach
- [x] Generate all 62 remaining portraits with CLEAN SKIN by default (86% realistic / 10% anime / 4% artistic)
- [x] Upload all 62 portraits to CDN
- [x] Update database with all portrait URLs
- [ ] User reviews all 102 performers and identifies which need tattoos
- [ ] Regenerate performers with tattoos based on user guidance

## Feature - Country Dropdown in BadgeManager
- [ ] Add country dropdown filter to BadgeManager component
- [ ] Filter badges to show only country badges when country is selected
- [ ] Test country filtering functionality in admin panel


## Feature - Country Dropdown in BadgeManager
- [x] Add country dropdown filter to BadgeManager component
- [x] Filter badges to show only country badges when country is selected
- [x] Test country filtering functionality in admin panel


## Bug Fix - Country Dropdown Not Visible in BadgeManager
- [ ] Investigate why country dropdown filter is not showing in BadgeManager
- [ ] Check if code changes were properly saved and deployed
- [ ] Fix implementation to make country dropdown visible
- [ ] Test country dropdown functionality


## Country Selection Dropdown in BadgeManager
- [x] Add country selection dropdown to BadgeManager (separate from badge category filter)
- [x] Populate dropdown with comprehensive list of countries (40+ countries, alphabetically sorted)
- [x] Implement auto-assignment of country badge when country is selected
- [x] Test country selection dropdown functionality
- [x] Generate 40 country flag badges as 3D spheres with flag colors/patterns
- [x] Upload all flag sphere badges to S3 storage
- [x] Add all country badges to database with S3 URLs
- [ ] Test country badge auto-assignment with new sphere badges

## Python Environment Fix
- [x] Fix Python SRE module mismatch error in NFT card generation
- [x] Ensure generate_nft_card_v3.py uses correct Python environment
- [x] Test NFT card regeneration from admin panel
- [x] Isolate Python 3.11 environment to prevent module conflicts with Python 3.13
- [x] Clear PYTHONPATH when calling Python 3.11 script

## Git Repository Cleanup
- [x] Create fresh Git repository without bloated history
- [x] Test checkpoint save with clean repository

## Badge Admin UI Improvements
- [x] Remove badge type dropdown from admin interface

## BadgeManager UI Simplification
- [x] Remove category filter dropdown from BadgeManager
- [x] Hide country badges from badge selection grid (only show in country dropdown)

## NFT Card Regeneration Portrait Fix
- [x] Check available portrait files location
- [x] Update regeneratePerformerCard to use correct portrait file path or fetch from imageUrl

## Card Regeneration Display Issue
- [ ] Check where regenerated card is being saved
- [ ] Verify card upload to CDN is working
- [ ] Verify database imageUrl is being updated correctly

## Card Display After Regeneration
- [x] Check if frontend cache needs invalidation after card update
- [x] Verify performer page is fetching latest imageUrl from database
- [ ] Test card display after regeneration

## Fix Malformed ImageUrl
- [x] Update Emma Hix's imageUrl to contain only the CDN URL
- [ ] Test card regeneration after fixing imageUrl

## Badge Disappearing Issue
- [x] Check if badges are being saved to database correctly
- [x] Verify badge UI state management and refresh logic
- [ ] Test badge persistence after save

## Fix Upload Output Parsing
- [x] Update regeneratePerformerCard to extract only CDN URL from manus-upload-file output
- [ ] Test card regeneration with correct URL parsing

## Card Regeneration Issues
- [x] Fix duplicate card appearing on top instead of replacing existing card
- [x] Fix badges not appearing on regenerated cards
- [x] Verify Python script receives badge names correctly

## Emma Hix Portrait Generation
- [x] Research Emma Hix's appearance and distinguishing features
- [x] Generate PSL-style portrait following performer image guidelines
- [x] Upload portrait and update database

## Emma Hix Portrait Logo Correction
- [x] Regenerate portrait following exact PSL performer image style guidelines
- [x] Ensure vibrant colors, strong contrast, glamorous aesthetic
- [x] Composite official PSL logo onto clothing
- [x] Upload corrected portrait and update database

## Module Restructure — Full Navigation Overhaul

### Phase 1: Navigation & Routing
- [ ] Update App.tsx with all new routes
- [ ] Restructure top nav (public: Performers, Tournaments, Leaderboard, Marketplace, Rules, Activity)
- [ ] Update mobile nav with all new sections
- [ ] Add admin sidebar with links to all sub-modules

### Phase 2: Player Sign-Up / Onboarding & Player Profile
- [ ] Create /signup onboarding page (username, email, age verification 18+, wallet connect, rules intro)
- [ ] Sign-up/sign-in modal with social login, password strength indicator, remember me, ToS acceptance
- [ ] Create /profile (My Player Profile) — stats, owned NFTs, tournament history, win/loss, wallet, achievements

### Phase 3: Admin Movie & Scene Manager + Competition Creator
- [ ] Move movie management to dedicated /admin/movies page
- [ ] Add scene description fields (scene type, performers, actions, scoring)
- [ ] Add performer-to-scene linking UI on dedicated page
- [ ] Create /admin/tournaments/create — Competition Creator page
- [ ] Competition Creator: name, entry fee, roster size, start/end dates, prize pool, eligibility rules, draft/publish workflow

### Phase 4: NFT Studio & Marketplace
- [ ] Create /nft-studio page — generate performer NFT cards, assign badges, view card gallery
- [ ] Create /marketplace page — browse, buy, sell, trade performer NFTs
- [ ] Marketplace: listing cards, price display, trade history, filter by performer/badge/rarity

### Phase 5: Leaderboard, Rules & Activity Feed
- [ ] Create /leaderboard page — top players by points, top performers by scene scores, weekly/all-time toggle
- [ ] Create /rules page — scoring rules, action point values, badge bonuses, tournament eligibility
- [ ] Create /activity page — recent events feed (new tournaments, scene results, NFT trades, badge unlocks)

### Phase 6: Admin Dashboard & Polish
- [ ] Refine /admin dashboard with cards/links to all sub-modules
- [ ] Add user transaction history section in admin
- [ ] Verify all routes work correctly end-to-end
- [ ] Save checkpoint and publish

## Module Restructure (April 2026)
- [x] Shared Navbar component with all navigation links (Performers, Tournaments, Leaderboard, Marketplace, Rules, Activity, My NFTs, My Profile, Admin)
- [x] Rules & Scoring Center page (/rules) — 4-tab layout: Overview, Scoring, Tournaments, NFTs & Badges
- [x] Activity Feed page (/activity) — live events from tournaments and badge assignments
- [x] NFT Studio page (/nft-studio) — admin card management with bulk actions
- [x] Admin Movie & Scene Manager dedicated page (/admin/movies)
- [x] Admin Create Competition page (/admin/tournaments/create) — full form with roster builder and live preview
- [x] Redesigned Admin Dashboard with module cards linking to all sub-sections
- [x] Player Profile page (/profile)
- [x] Player Sign-Up / Onboarding page (/signup)
- [x] Leaderboard page (/leaderboard)
- [x] Marketplace page (/marketplace)
- [x] Home page updated with Explore section linking all modules
- [x] App.tsx updated with all new routes

## Bug Fixes
- [ ] Fix Add Scene component not working in Admin Movie & Scene Manager

## Multiple Performer Types Feature
- [ ] Add MILF to performer type enum in schema
- [ ] Create performerTypes junction table (performer can have many types)
- [ ] Migrate existing single performerType field to new junction table
- [ ] Update db.ts helpers to read/write multiple types
- [ ] Update tRPC procedures for multi-type create/update
- [ ] Update admin performer forms to use multi-select type picker
- [ ] Update performer profile pages to display all types as badges
- [ ] Update tournament roster requirements to support multi-type filtering
