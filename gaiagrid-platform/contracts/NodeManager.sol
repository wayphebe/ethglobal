// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NodeManager
 * @dev Manages energy nodes in the GaiaGrid network
 * @notice Handles node registration, status updates, and rating system
 */
contract NodeManager is Ownable, Pausable {
    struct Node {
        address owner;
        string name;
        string location;
        uint256 capacity; // in watts
        bool isActive;
        uint256 rating; // 1-5 scale
        uint256 totalEarnings;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    // State variables
    mapping(address => Node) public nodes;
    mapping(address => bool) public isNodeOperator;
    address[] public nodeAddresses;
    
    uint256 public totalNodes;
    uint256 public activeNodes;
    
    // Events
    event NodeRegistered(address indexed nodeAddress, address indexed owner, string name, uint256 capacity);
    event NodeStatusUpdated(address indexed nodeAddress, bool isActive);
    event NodeRated(address indexed nodeAddress, uint256 rating, address indexed rater);
    event NodeEarningsUpdated(address indexed nodeAddress, uint256 earnings);
    event NodeUpdated(address indexed nodeAddress, string name, string location, uint256 capacity);
    
    // Modifiers
    modifier onlyNodeOperator() {
        require(isNodeOperator[msg.sender], "NodeManager: Not a node operator");
        _;
    }
    
    modifier nodeExists(address nodeAddress) {
        require(nodes[nodeAddress].owner != address(0), "NodeManager: Node does not exist");
        _;
    }
    
    modifier validRating(uint256 rating) {
        require(rating >= 1 && rating <= 5, "NodeManager: Rating must be between 1 and 5");
        _;
    }
    
    /**
     * @dev Register a new energy node
     * @param name Node name/identifier
     * @param location Node location (coordinates or address)
     * @param capacity Node capacity in watts
     */
    function registerNode(
        string calldata name,
        string calldata location,
        uint256 capacity
    ) external whenNotPaused {
        require(bytes(name).length > 0, "NodeManager: Name cannot be empty");
        require(bytes(location).length > 0, "NodeManager: Location cannot be empty");
        require(capacity > 0, "NodeManager: Capacity must be greater than zero");
        require(nodes[msg.sender].owner == address(0), "NodeManager: Node already registered");
        
        Node memory newNode = Node({
            owner: msg.sender,
            name: name,
            location: location,
            capacity: capacity,
            isActive: true,
            rating: 3, // Default rating
            totalEarnings: 0,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        nodes[msg.sender] = newNode;
        isNodeOperator[msg.sender] = true;
        nodeAddresses.push(msg.sender);
        
        totalNodes++;
        activeNodes++;
        
        emit NodeRegistered(msg.sender, msg.sender, name, capacity);
    }
    
    /**
     * @dev Update node status (active/inactive)
     * @param nodeAddress Address of the node
     * @param isActive New status
     */
    function updateNodeStatus(address nodeAddress, bool isActive) 
        external 
        nodeExists(nodeAddress) 
        whenNotPaused 
    {
        require(
            msg.sender == nodes[nodeAddress].owner || msg.sender == owner(),
            "NodeManager: Not authorized to update this node"
        );
        
        bool wasActive = nodes[nodeAddress].isActive;
        nodes[nodeAddress].isActive = isActive;
        nodes[nodeAddress].lastUpdated = block.timestamp;
        
        if (wasActive && !isActive) {
            activeNodes--;
        } else if (!wasActive && isActive) {
            activeNodes++;
        }
        
        emit NodeStatusUpdated(nodeAddress, isActive);
    }
    
    /**
     * @dev Rate a node
     * @param nodeAddress Address of the node to rate
     * @param rating Rating from 1 to 5
     */
    function rateNode(address nodeAddress, uint256 rating) 
        external 
        nodeExists(nodeAddress) 
        validRating(rating) 
        whenNotPaused 
    {
        require(nodes[nodeAddress].isActive, "NodeManager: Cannot rate inactive node");
        
        // Simple average rating calculation
        uint256 currentRating = nodes[nodeAddress].rating;
        uint256 newRating = (currentRating + rating) / 2;
        
        nodes[nodeAddress].rating = newRating;
        nodes[nodeAddress].lastUpdated = block.timestamp;
        
        emit NodeRated(nodeAddress, rating, msg.sender);
    }
    
    /**
     * @dev Update node earnings
     * @param nodeAddress Address of the node
     * @param earnings Additional earnings to add
     */
    function updateNodeEarnings(address nodeAddress, uint256 earnings) 
        external 
        onlyOwner 
        nodeExists(nodeAddress) 
    {
        nodes[nodeAddress].totalEarnings += earnings;
        nodes[nodeAddress].lastUpdated = block.timestamp;
        
        emit NodeEarningsUpdated(nodeAddress, nodes[nodeAddress].totalEarnings);
    }
    
    /**
     * @dev Update node information
     * @param name New node name
     * @param location New node location
     * @param capacity New node capacity
     */
    function updateNodeInfo(
        string calldata name,
        string calldata location,
        uint256 capacity
    ) external onlyNodeOperator whenNotPaused {
        require(nodes[msg.sender].owner != address(0), "NodeManager: Node not registered");
        require(bytes(name).length > 0, "NodeManager: Name cannot be empty");
        require(bytes(location).length > 0, "NodeManager: Location cannot be empty");
        require(capacity > 0, "NodeManager: Capacity must be greater than zero");
        
        nodes[msg.sender].name = name;
        nodes[msg.sender].location = location;
        nodes[msg.sender].capacity = capacity;
        nodes[msg.sender].lastUpdated = block.timestamp;
        
        emit NodeUpdated(msg.sender, name, location, capacity);
    }
    
    /**
     * @dev Get node information
     * @param nodeAddress Address of the node
     * @return Node struct
     */
    function getNode(address nodeAddress) external view nodeExists(nodeAddress) returns (Node memory) {
        return nodes[nodeAddress];
    }
    
    /**
     * @dev Get all node addresses
     * @return Array of node addresses
     */
    function getAllNodeAddresses() external view returns (address[] memory) {
        return nodeAddresses;
    }
    
    /**
     * @dev Get active node addresses
     * @return Array of active node addresses
     */
    function getActiveNodeAddresses() external view returns (address[] memory) {
        address[] memory activeNodesList = new address[](activeNodes);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            if (nodes[nodeAddresses[i]].isActive) {
                activeNodesList[index] = nodeAddresses[i];
                index++;
            }
        }
        
        return activeNodesList;
    }
    
    /**
     * @dev Get nodes by owner
     * @param owner Address of the owner
     * @return Array of node addresses owned by the owner
     */
    function getNodesByOwner(address owner) external view returns (address[] memory) {
        address[] memory ownerNodes = new address[](totalNodes);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            if (nodes[nodeAddresses[i]].owner == owner) {
                ownerNodes[index] = nodeAddresses[i];
                index++;
            }
        }
        
        return ownerNodes;
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
     * @return totalNodes Total number of registered nodes
     * @return activeNodes Number of active nodes
     * @return totalCapacity Total capacity of all active nodes
     */
    function getStats() external view returns (uint256, uint256, uint256) {
        uint256 totalCapacity = 0;
        
        for (uint256 i = 0; i < nodeAddresses.length; i++) {
            if (nodes[nodeAddresses[i]].isActive) {
                totalCapacity += nodes[nodeAddresses[i]].capacity;
            }
        }
        
        return (totalNodes, activeNodes, totalCapacity);
    }
}
