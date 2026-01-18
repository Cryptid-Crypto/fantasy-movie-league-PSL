// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TournamentEscrow
 * @dev Escrow contract for Fantasy Movie League tournaments
 * Holds entry fees and distributes prizes to winners
 * Supports both native MATIC and ERC20 tokens (including future PSL token)
 */
contract TournamentEscrow is Ownable, ReentrancyGuard {
    struct Tournament {
        uint256 entryFee;
        address paymentToken; // address(0) for native MATIC
        uint256 prizePool;
        uint256 totalEntries;
        bool payoutComplete;
        bool active;
    }
    
    struct Winner {
        address wallet;
        uint256 percentage; // Basis points (10000 = 100%)
    }
    
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => mapping(address => bool)) public hasEntered;
    
    event TournamentCreated(uint256 indexed tournamentId, uint256 entryFee, address paymentToken);
    event EntryPaid(uint256 indexed tournamentId, address indexed user, uint256 amount);
    event PrizesDistributed(uint256 indexed tournamentId, uint256 totalAmount);
    event RefundIssued(uint256 indexed tournamentId, address indexed user, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new tournament
     * @param tournamentId Unique tournament identifier
     * @param entryFee Entry fee amount
     * @param paymentToken Token address (address(0) for native MATIC)
     */
    function createTournament(
        uint256 tournamentId,
        uint256 entryFee,
        address paymentToken
    ) external onlyOwner {
        require(tournaments[tournamentId].entryFee == 0, "Tournament already exists");
        
        tournaments[tournamentId] = Tournament({
            entryFee: entryFee,
            paymentToken: paymentToken,
            prizePool: 0,
            totalEntries: 0,
            payoutComplete: false,
            active: true
        });
        
        emit TournamentCreated(tournamentId, entryFee, paymentToken);
    }
    
    /**
     * @dev Pay entry fee to join tournament
     * @param tournamentId Tournament to enter
     */
    function payEntry(uint256 tournamentId) external payable nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.active, "Tournament not active");
        require(!hasEntered[tournamentId][msg.sender], "Already entered");
        require(tournament.entryFee > 0, "Tournament does not exist");
        
        if (tournament.paymentToken == address(0)) {
            // Native MATIC payment
            require(msg.value == tournament.entryFee, "Incorrect entry fee");
        } else {
            // ERC20 token payment
            require(msg.value == 0, "Do not send MATIC for token tournaments");
            IERC20 token = IERC20(tournament.paymentToken);
            require(
                token.transferFrom(msg.sender, address(this), tournament.entryFee),
                "Token transfer failed"
            );
        }
        
        hasEntered[tournamentId][msg.sender] = true;
        tournament.prizePool += tournament.entryFee;
        tournament.totalEntries += 1;
        
        emit EntryPaid(tournamentId, msg.sender, tournament.entryFee);
    }
    
    /**
     * @dev Distribute prizes to winners
     * @param tournamentId Tournament to pay out
     * @param winners Array of winner addresses and percentages
     */
    function distributePrizes(
        uint256 tournamentId,
        Winner[] calldata winners
    ) external onlyOwner nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        require(tournament.prizePool > 0, "No prize pool");
        require(!tournament.payoutComplete, "Payout already complete");
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            totalPercentage += winners[i].percentage;
        }
        require(totalPercentage == 10000, "Percentages must sum to 100%");
        
        uint256 totalDistributed = 0;
        
        for (uint256 i = 0; i < winners.length; i++) {
            uint256 prize = (tournament.prizePool * winners[i].percentage) / 10000;
            
            if (tournament.paymentToken == address(0)) {
                // Native MATIC payout
                (bool success, ) = winners[i].wallet.call{value: prize}("");
                require(success, "MATIC transfer failed");
            } else {
                // ERC20 token payout
                IERC20 token = IERC20(tournament.paymentToken);
                require(token.transfer(winners[i].wallet, prize), "Token transfer failed");
            }
            
            totalDistributed += prize;
        }
        
        tournament.payoutComplete = true;
        tournament.active = false;
        
        emit PrizesDistributed(tournamentId, totalDistributed);
    }
    
    /**
     * @dev Issue refund to a user (in case of tournament cancellation)
     * @param tournamentId Tournament to refund
     * @param user User to refund
     */
    function issueRefund(uint256 tournamentId, address user) external onlyOwner nonReentrant {
        Tournament storage tournament = tournaments[tournamentId];
        require(hasEntered[tournamentId][user], "User has not entered");
        require(!tournament.payoutComplete, "Tournament already paid out");
        
        hasEntered[tournamentId][user] = false;
        tournament.prizePool -= tournament.entryFee;
        tournament.totalEntries -= 1;
        
        if (tournament.paymentToken == address(0)) {
            // Native MATIC refund
            (bool success, ) = user.call{value: tournament.entryFee}("");
            require(success, "MATIC refund failed");
        } else {
            // ERC20 token refund
            IERC20 token = IERC20(tournament.paymentToken);
            require(token.transfer(user, tournament.entryFee), "Token refund failed");
        }
        
        emit RefundIssued(tournamentId, user, tournament.entryFee);
    }
    
    /**
     * @dev Emergency withdraw (only owner, only if tournament is cancelled)
     */
    function emergencyWithdraw(uint256 tournamentId) external onlyOwner {
        Tournament storage tournament = tournaments[tournamentId];
        require(!tournament.active, "Tournament still active");
        require(!tournament.payoutComplete, "Payout already complete");
        
        uint256 amount = tournament.prizePool;
        tournament.prizePool = 0;
        
        if (tournament.paymentToken == address(0)) {
            (bool success, ) = owner().call{value: amount}("");
            require(success, "Emergency withdraw failed");
        } else {
            IERC20 token = IERC20(tournament.paymentToken);
            require(token.transfer(owner(), amount), "Emergency withdraw failed");
        }
    }
    
    /**
     * @dev Get tournament details
     */
    function getTournament(uint256 tournamentId) external view returns (Tournament memory) {
        return tournaments[tournamentId];
    }
    
    /**
     * @dev Check if user has entered tournament
     */
    function userHasEntered(uint256 tournamentId, address user) external view returns (bool) {
        return hasEntered[tournamentId][user];
    }
    
    // Allow contract to receive MATIC
    receive() external payable {}
}
