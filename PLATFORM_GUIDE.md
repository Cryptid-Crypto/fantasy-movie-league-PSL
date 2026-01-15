# Fantasy Movie League Platform - Complete Guide

## Platform Overview

**Fantasy Movie League** is a Web3-enabled tournament platform built on Polygon Network where users compete with Performer NFTs based on real scene performance data. The platform gamifies adult entertainment through fantasy sports-style competitions with blockchain-verified ownership and transparent scoring.

## Key Features

### 🎬 For Users

1. **Performer NFT Collection**
   - Own unique Performer NFTs on Polygon blockchain
   - Each NFT represents rights to compete with a specific performer
   - View NFT collection with wallet integration
   - Track performer statistics and recent performances

2. **Tournament Competition**
   - Enter time-bound tournaments with your NFTs
   - NFT-gated entry (must own specific performer NFTs)
   - Compete based on real scene performance data
   - Real-time leaderboard rankings
   - Transparent point calculation system

3. **Scoring System**
   - Points awarded based on performer actions in scenes
   - Action types have predefined point values (e.g., facial = 10pts)
   - Scores calculated from scenes released during tournament timeframe
   - Automatic score updates via admin panel

4. **User Dashboard**
   - Overview of owned NFTs
   - Active tournament participation
   - Wallet connection status
   - Quick access to all platform features

### 🛠️ For Administrators

1. **Content Management**
   - Add and manage movies with release dates
   - Create scenes within movies
   - Register performers with bios and images
   - Define action types with point values
   - Log performer actions in specific scenes

2. **Tournament Management**
   - Create tournaments with start/end dates
   - Set NFT requirements for entry
   - Configure entry fees (optional)
   - Calculate and update tournament scores
   - View participant leaderboards

3. **Admin Dashboard**
   - Centralized management interface
   - Tabbed navigation (Movies, Performers, Actions, Tournaments)
   - Role-based access control
   - Real-time data updates

## Technical Architecture

### Frontend Stack

- **React 19** with TypeScript
- **Tailwind CSS 4** for styling (cinematic dark theme)
- **tRPC** for type-safe API calls
- **Ethers.js** for Web3 wallet integration
- **Wouter** for client-side routing
- **shadcn/ui** component library

### Backend Stack

- **Node.js** with Express
- **tRPC 11** for API layer
- **Drizzle ORM** with MySQL/TiDB database
- **Manus OAuth** for authentication
- **Polygon Network** integration

### Database Schema

Key tables:
- `users` - User accounts with wallet addresses
- `performers` - Performer profiles and NFT contracts
- `movies` - Movie catalog with release dates
- `scenes` - Individual scenes within movies
- `actions` - Action types and point values
- `scene_performer_actions` - Logged actions for scoring
- `tournaments` - Tournament configurations
- `tournament_entries` - User entries with NFT selection
- `user_nft_inventory` - Synced NFT ownership data

### Smart Contracts

**PerformerNFT.sol** (ERC-721 + ERC-2981)
- Mintable Performer NFTs with royalty support
- Configurable max supply and mint price
- Batch minting for initial distribution
- Token enumeration for wallet reading
- Full documentation in `/contracts/README.md`

## User Workflows

### 1. Getting Started

```
1. Visit platform homepage
2. Click "Sign In" (Manus OAuth)
3. Connect Polygon wallet
4. Browse performers and tournaments
```

### 2. Collecting NFTs

```
1. Navigate to "My NFTs" page
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Click "Sync NFTs from Blockchain"
5. View your collection
```

### 3. Entering a Tournament

```
1. Browse "Tournaments" page
2. Select an active tournament
3. Click "Enter Tournament"
4. Choose which Performer NFT to compete with
5. Confirm entry (pay entry fee if required)
6. View your entry on leaderboard
```

### 4. Viewing Performer Profiles

```
1. Navigate to "Performers" page
2. Search or browse performers
3. Click on performer card
4. View bio, stats, and recent performances
5. See action breakdown and point totals
```

## Admin Workflows

### 1. Setting Up Content

```
1. Sign in as admin user
2. Navigate to /admin
3. Add action types (Actions tab)
   - Define action names and point values
4. Add performers (Performers tab)
   - Name, bio, image, NFT contract address
5. Add movies (Movies tab)
   - Title, release date, cover image
6. Create scenes for each movie
   - Scene number, title, duration
7. Log performer actions in scenes
   - Select performer, action type
   - Points automatically assigned
```

### 2. Creating a Tournament

```
1. Go to admin dashboard → Tournaments tab
2. Click "Create Tournament"
3. Fill in details:
   - Tournament name and description
   - Start and end dates
   - Required NFT contract (optional)
   - Entry fee in MATIC (optional)
4. Click "Create Tournament"
5. Tournament appears on public tournaments page
```

### 3. Managing Scores

```
1. During tournament, log scene actions as usual
2. Go to admin dashboard → Tournaments tab
3. Click calculator icon on tournament row
4. System automatically:
   - Finds scenes released during tournament period
   - Calculates points for each entered performer
   - Updates leaderboard rankings
5. Users see updated scores on leaderboard
```

## Scoring Logic

### Point Calculation

```
For each tournament entry:
1. Get tournament start and end dates
2. Find all movies released in that timeframe
3. Get all scenes from those movies
4. Find all actions by the entry's performer in those scenes
5. Sum the point values of all actions
6. Update entry's total score
```

### Example Scenario

```
Tournament: "Summer Championship 2024"
Period: June 1 - June 30, 2024
Entry: User owns "Jane Doe NFT #42"

Movies released in June:
- Movie A (June 5)
  - Scene 1: Jane Doe performs "facial" (10 pts)
  - Scene 2: Jane Doe performs "double penetration" (20 pts)
- Movie B (June 20)
  - Scene 1: Jane Doe performs "facial" (10 pts)

Total Score: 10 + 20 + 10 = 40 points
```

## Web3 Integration

### Wallet Connection

The platform uses Ethers.js to connect to user wallets:

```javascript
// Connect wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const address = await signer.getAddress();
```

### Reading NFTs

NFT ownership is verified by reading from Polygon contracts:

```javascript
// Read user's NFTs from a performer contract
const contract = new ethers.Contract(contractAddress, abi, provider);
const balance = await contract.balanceOf(userAddress);
const tokenIds = await contract.tokensOfOwner(userAddress);
```

### Tournament Entry Validation

```
1. User selects tournament to enter
2. Platform checks required NFT contract (if any)
3. Queries user's wallet for matching NFTs
4. User selects which specific NFT to compete with
5. Entry recorded with token ID for verification
```

## Deployment Guide

### Prerequisites

- Node.js 22+
- MySQL/TiDB database
- Polygon RPC endpoint
- Manus account for OAuth

### Environment Variables

```env
DATABASE_URL=mysql://...
JWT_SECRET=...
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=...
# (Other vars auto-injected by Manus platform)
```

### Installation

```bash
cd /home/ubuntu/fantasy-movie-league
pnpm install
pnpm db:push  # Apply database schema
pnpm dev      # Start development server
```

### Production Build

```bash
pnpm build
pnpm start
```

## API Reference

### Public Endpoints

- `performers.list` - Get all performers
- `performers.getById` - Get performer details
- `performers.getRecentPerformances` - Get performer's recent actions
- `tournaments.list` - Get all tournaments
- `tournaments.getById` - Get tournament details
- `tournaments.getLeaderboard` - Get tournament rankings
- `nfts.list` - Get user's NFT collection (authenticated)

### Admin Endpoints (Protected)

- `admin.performers.*` - CRUD operations for performers
- `admin.movies.*` - CRUD operations for movies
- `admin.scenes.*` - CRUD operations for scenes
- `admin.actions.*` - CRUD operations for action types
- `admin.sceneActions.*` - Log performer actions in scenes
- `admin.tournaments.*` - CRUD operations for tournaments
- `admin.tournaments.calculateScores` - Recalculate tournament scores

### Authentication

All admin endpoints require:
1. Valid Manus OAuth session
2. User role = "admin"

## Security Considerations

1. **Authentication**
   - Manus OAuth for user identity
   - JWT session cookies
   - Role-based access control

2. **Web3 Security**
   - Wallet signatures for ownership proof
   - Contract address validation
   - NFT ownership verification before entry

3. **Data Integrity**
   - Admin-only content management
   - Immutable tournament rules once created
   - Transparent scoring calculations

4. **Privacy**
   - Wallet addresses stored but not publicly displayed
   - User data protected by authentication
   - Optional anonymity in leaderboards

## Future Enhancements

### Potential Features

1. **Prize Distribution**
   - Smart contract-based prize pools
   - Automatic winner payouts
   - MATIC or token rewards

2. **Advanced Scoring**
   - Multipliers for rare actions
   - Combo bonuses
   - Time-based scoring adjustments

3. **Social Features**
   - User profiles and avatars
   - Tournament chat rooms
   - Friend leaderboards

4. **NFT Marketplace**
   - Built-in NFT trading
   - Performer NFT auctions
   - Royalty tracking

5. **Analytics Dashboard**
   - Performer performance trends
   - Tournament statistics
   - User engagement metrics

## Support & Resources

- **Platform URL**: https://3000-idr3vhl0fso0lxp53nnlg-8f3c075a.us2.manus.computer
- **Admin Panel**: /admin (requires admin role)
- **Smart Contract Docs**: /contracts/README.md
- **Database Schema**: /drizzle/schema.ts
- **API Routers**: /server/routers.ts

## Troubleshooting

### Common Issues

**Issue**: NFTs not showing after sync
- **Solution**: Ensure wallet is connected to Polygon Network
- Check that performer has valid NFT contract address
- Verify contract implements ERC-721 standard

**Issue**: Cannot enter tournament
- **Solution**: Check you own required NFT
- Verify tournament is currently active
- Ensure wallet has sufficient MATIC for entry fee

**Issue**: Scores not updating
- **Solution**: Admin must manually trigger score calculation
- Verify scenes are logged during tournament period
- Check movie release dates match tournament timeframe

**Issue**: Admin panel not accessible
- **Solution**: Verify user role is set to "admin" in database
- Check authentication session is valid
- Ensure you're accessing /admin route

## License

MIT License - See project repository for details.

---

**Built with ❤️ on Polygon Network**
