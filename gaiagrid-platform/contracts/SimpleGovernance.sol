// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimpleGovernance
 * @dev Simple DAO governance system for GaiaGrid
 * @notice Allows token holders to create proposals, vote, and execute decisions
 */
contract SimpleGovernance is Ownable, Pausable, ReentrancyGuard {
    // Enums
    enum ProposalState {
        PENDING,
        ACTIVE,
        SUCCEEDED,
        DEFEATED,
        EXECUTED,
        CANCELLED
    }
    
    enum VoteType {
        AGAINST,
        FOR,
        ABSTAIN
    }
    
    // Structs
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        address[] targets;
        uint256[] values;
        string[] signatures;
        bytes[] calldatas;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool cancelled;
        uint256 createdAt;
    }
    
    struct Vote {
        bool hasVoted;
        VoteType support;
        uint256 votes;
    }
    
    // State variables
    IERC20 public governanceToken;
    uint256 public proposalThreshold;
    uint256 public votingPeriod;
    uint256 public executionDelay;
    uint256 public quorumPercentage;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256) public proposalCount;
    
    uint256 public proposalCount;
    uint256 public totalProposals;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startBlock,
        uint256 endBlock
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        VoteType support,
        uint256 votes
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event GovernanceParametersUpdated(
        uint256 proposalThreshold,
        uint256 votingPeriod,
        uint256 executionDelay,
        uint256 quorumPercentage
    );
    
    // Modifiers
    modifier validProposal(uint256 proposalId) {
        require(proposalId < totalProposals, "SimpleGovernance: Invalid proposal ID");
        _;
    }
    
    modifier onlyProposer(uint256 proposalId) {
        require(
            proposals[proposalId].proposer == msg.sender || msg.sender == owner(),
            "SimpleGovernance: Not the proposer"
        );
        _;
    }
    
    modifier validVotingPeriod(uint256 proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(
            block.number >= proposal.startBlock && block.number <= proposal.endBlock,
            "SimpleGovernance: Not in voting period"
        );
        _;
    }
    
    constructor(
        address _governanceToken,
        uint256 _proposalThreshold,
        uint256 _votingPeriod,
        uint256 _executionDelay,
        uint256 _quorumPercentage
    ) {
        governanceToken = IERC20(_governanceToken);
        proposalThreshold = _proposalThreshold;
        votingPeriod = _votingPeriod;
        executionDelay = _executionDelay;
        quorumPercentage = _quorumPercentage;
    }
    
    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param targets Target addresses for calls
     * @param values ETH values for calls
     * @param signatures Function signatures for calls
     * @param calldatas Calldata for calls
     */
    function propose(
        string calldata title,
        string calldata description,
        address[] calldata targets,
        uint256[] calldata values,
        string[] calldata signatures,
        bytes[] calldata calldatas
    ) external whenNotPaused {
        require(
            governanceToken.balanceOf(msg.sender) >= proposalThreshold,
            "SimpleGovernance: Insufficient voting power"
        );
        require(targets.length > 0, "SimpleGovernance: Must have at least one target");
        require(
            targets.length == values.length &&
            targets.length == signatures.length &&
            targets.length == calldatas.length,
            "SimpleGovernance: Array length mismatch"
        );
        require(bytes(title).length > 0, "SimpleGovernance: Title cannot be empty");
        require(bytes(description).length > 0, "SimpleGovernance: Description cannot be empty");
        
        uint256 proposalId = totalProposals++;
        uint256 startBlock = block.number + 1;
        uint256 endBlock = startBlock + votingPeriod;
        
        Proposal memory newProposal = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            targets: targets,
            values: values,
            signatures: signatures,
            calldatas: calldatas,
            startBlock: startBlock,
            endBlock: endBlock,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            cancelled: false,
            createdAt: block.timestamp
        });
        
        proposals[proposalId] = newProposal;
        proposalCount[msg.sender]++;
        
        emit ProposalCreated(proposalId, msg.sender, title, startBlock, endBlock);
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param support Vote type (0=Against, 1=For, 2=Abstain)
     */
    function castVote(
        uint256 proposalId,
        VoteType support
    ) external validProposal(proposalId) validVotingPeriod(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.cancelled, "SimpleGovernance: Proposal cancelled");
        require(!proposal.executed, "SimpleGovernance: Proposal already executed");
        
        uint256 votingPower = governanceToken.balanceOf(msg.sender);
        require(votingPower > 0, "SimpleGovernance: No voting power");
        
        Vote storage vote = votes[proposalId][msg.sender];
        require(!vote.hasVoted, "SimpleGovernance: Already voted");
        
        vote.hasVoted = true;
        vote.support = support;
        vote.votes = votingPower;
        
        if (support == VoteType.FOR) {
            proposal.forVotes += votingPower;
        } else if (support == VoteType.AGAINST) {
            proposal.againstVotes += votingPower;
        } else if (support == VoteType.ABSTAIN) {
            proposal.abstainVotes += votingPower;
        }
        
        emit VoteCast(msg.sender, proposalId, support, votingPower);
    }
    
    /**
     * @dev Execute a successful proposal
     * @param proposalId ID of the proposal to execute
     */
    function execute(uint256 proposalId) 
        external 
        validProposal(proposalId) 
        nonReentrant 
        whenNotPaused 
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "SimpleGovernance: Proposal already executed");
        require(!proposal.cancelled, "SimpleGovernance: Proposal cancelled");
        require(block.number > proposal.endBlock, "SimpleGovernance: Voting period not ended");
        require(block.timestamp >= proposal.createdAt + executionDelay, "SimpleGovernance: Execution delay not met");
        
        // Check if proposal succeeded
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 totalSupply = governanceToken.totalSupply();
        uint256 quorum = (totalSupply * quorumPercentage) / 100;
        
        require(totalVotes >= quorum, "SimpleGovernance: Quorum not met");
        require(proposal.forVotes > proposal.againstVotes, "SimpleGovernance: Proposal not passed");
        
        proposal.executed = true;
        
        // Execute proposal calls
        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(
                abi.encodePacked(bytes4(keccak256(bytes(proposal.signatures[i]))), proposal.calldatas[i])
            );
            require(success, "SimpleGovernance: Proposal execution failed");
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId ID of the proposal to cancel
     */
    function cancel(uint256 proposalId) 
        external 
        validProposal(proposalId) 
        onlyProposer(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "SimpleGovernance: Proposal already executed");
        require(!proposal.cancelled, "SimpleGovernance: Proposal already cancelled");
        require(block.number < proposal.startBlock, "SimpleGovernance: Voting already started");
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(proposalId);
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        validProposal(proposalId) 
        returns (Proposal memory) 
    {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get proposal state
     * @param proposalId ID of the proposal
     * @return Current state of the proposal
     */
    function getProposalState(uint256 proposalId) 
        external 
        view 
        validProposal(proposalId) 
        returns (ProposalState) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.cancelled) {
            return ProposalState.CANCELLED;
        }
        
        if (proposal.executed) {
            return ProposalState.EXECUTED;
        }
        
        if (block.number < proposal.startBlock) {
            return ProposalState.PENDING;
        }
        
        if (block.number <= proposal.endBlock) {
            return ProposalState.ACTIVE;
        }
        
        // Check if proposal succeeded
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 totalSupply = governanceToken.totalSupply();
        uint256 quorum = (totalSupply * quorumPercentage) / 100;
        
        if (totalVotes < quorum || proposal.forVotes <= proposal.againstVotes) {
            return ProposalState.DEFEATED;
        }
        
        return ProposalState.SUCCEEDED;
    }
    
    /**
     * @dev Get user's vote on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Vote struct
     */
    function getVote(uint256 proposalId, address voter) 
        external 
        view 
        validProposal(proposalId) 
        returns (Vote memory) 
    {
        return votes[proposalId][voter];
    }
    
    /**
     * @dev Update governance parameters (only owner)
     * @param _proposalThreshold New proposal threshold
     * @param _votingPeriod New voting period
     * @param _executionDelay New execution delay
     * @param _quorumPercentage New quorum percentage
     */
    function updateParameters(
        uint256 _proposalThreshold,
        uint256 _votingPeriod,
        uint256 _executionDelay,
        uint256 _quorumPercentage
    ) external onlyOwner {
        require(_quorumPercentage <= 100, "SimpleGovernance: Quorum cannot exceed 100%");
        require(_votingPeriod > 0, "SimpleGovernance: Voting period must be greater than 0");
        
        proposalThreshold = _proposalThreshold;
        votingPeriod = _votingPeriod;
        executionDelay = _executionDelay;
        quorumPercentage = _quorumPercentage;
        
        emit GovernanceParametersUpdated(
            _proposalThreshold,
            _votingPeriod,
            _executionDelay,
            _quorumPercentage
        );
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract statistics
     * @return totalProposals Total number of proposals created
     * @return activeProposals Number of active proposals
     * @return executedProposals Number of executed proposals
     * @return totalVotingPower Total voting power in the system
     */
    function getStats() external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        uint256 active = 0;
        uint256 executed = 0;
        
        for (uint256 i = 0; i < totalProposals; i++) {
            ProposalState state = this.getProposalState(i);
            if (state == ProposalState.ACTIVE) {
                active++;
            } else if (state == ProposalState.EXECUTED) {
                executed++;
            }
        }
        
        return (totalProposals, active, executed, governanceToken.totalSupply());
    }
}
