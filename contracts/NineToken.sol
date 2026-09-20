// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NineToken
 * @dev ERC-20 Token for $NINE on Robinhood Chain Testnet with Test Faucet and Deflationary Burn.
 */
contract NineToken {
    string public name = "Nine Lives Token";
    string public symbol = "NINE";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensBurned(address indexed burner, uint256 amount, uint256 totalBurnedToDead);

    constructor() {
        // Mint initial 1,000,000,000 tokens to deployer
        uint256 initialSupply = 1_000_000_000 * 10**uint256(decimals);
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit Transfer(msg.sender, to, amount);

        if (to == BURN_ADDRESS) {
            emit TokensBurned(msg.sender, amount, balanceOf[BURN_ADDRESS]);
        }
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "Cannot approve to zero address");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");

        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }

        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);

        if (to == BURN_ADDRESS) {
            emit TokensBurned(from, amount, balanceOf[BURN_ADDRESS]);
        }
        return true;
    }

    /**
     * @dev Testnet Faucet: allows anyone to claim 50,000 $NINE for testing arcade purchases.
     */
    function faucetMint(address to, uint256 amount) external {
        require(to != address(0), "Cannot mint to zero address");
        uint256 maxFaucet = 100_000 * 10**uint256(decimals);
        require(amount <= maxFaucet, "Faucet limit exceeded (max 100,000 NINE)");

        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Direct burn function: transfers tokens to 0x...dEaD
     */
    function burn(uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance to burn");
        balanceOf[msg.sender] -= amount;
        balanceOf[BURN_ADDRESS] += amount;
        emit Transfer(msg.sender, BURN_ADDRESS, amount);
        emit TokensBurned(msg.sender, amount, balanceOf[BURN_ADDRESS]);
        return true;
    }
}
