// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title NineArcadeBurner
 * @dev On-chain Armory & Arcade for $NINE.
 * ALL tokens raised from item purchases are routed directly to the BURN ADDRESS (0x000...dEaD).
 */
contract NineArcadeBurner {
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    address public immutable tokenAddress;

    uint256 public totalTokensBurned;
    uint256 public totalPurchasesCount;

    // user => (itemId => owned)
    mapping(address => mapping(string => bool)) public userOwnedItems;

    event ArcadeItemBurned(
        address indexed buyer,
        string itemId,
        uint256 amountBurned,
        address indexed burnAddress,
        uint256 timestamp
    );

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        tokenAddress = _tokenAddress;
    }

    /**
     * @notice Purchase an arcade item using $NINE tokens.
     * 100% of tokens are transferred directly to the BURN_ADDRESS.
     */
    function purchaseItem(string calldata itemId, uint256 tokenPrice) external {
        require(bytes(itemId).length > 0, "Invalid item ID");
        require(tokenPrice > 0, "Price must be greater than zero");
        require(!userOwnedItems[msg.sender][itemId], "Item already unlocked on-chain");

        // 1. Transfer tokens directly from the buyer to the BURN_ADDRESS (0x...dEaD)
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, BURN_ADDRESS, tokenPrice);
        require(success, "Token burn transfer failed");

        // 2. Record ownership and cumulative burn metrics
        userOwnedItems[msg.sender][itemId] = true;
        totalTokensBurned += tokenPrice;
        totalPurchasesCount += 1;

        emit ArcadeItemBurned(msg.sender, itemId, tokenPrice, BURN_ADDRESS, block.timestamp);
    }

    /**
     * @notice Check if a user owns a specific arcade item on-chain.
     */
    function isItemOwned(address user, string calldata itemId) external view returns (bool) {
        return userOwnedItems[user][itemId];
    }

    /**
     * @notice Batch check multiple items for a user.
     */
    function batchCheckItems(address user, string[] calldata itemIds) external view returns (bool[] memory) {
        bool[] memory results = new bool[](itemIds.length);
        for (uint256 i = 0; i < itemIds.length; i++) {
            results[i] = userOwnedItems[user][itemIds[i]];
        }
        return results;
    }

    /**
     * @notice Get macro burn stats.
     */
    function getMacroStats() external view returns (
        uint256 totalBurned,
        uint256 totalPurchases,
        address burnDest,
        address token
    ) {
        return (totalTokensBurned, totalPurchasesCount, BURN_ADDRESS, tokenAddress);
    }
}
