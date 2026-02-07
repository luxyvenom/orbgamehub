// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title EyeFighterGame - PvP Eye Staring Contest Payout Contract
/// @notice Holds WLD tokens and releases winnings to verified winners via server signature
contract EyeFighterGame {
    address public owner;
    IERC20 public immutable token;

    mapping(bytes32 => bool) public claimed;

    event WinningsClaimed(string roomId, address indexed winner, uint256 amount);
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _token) {
        owner = msg.sender;
        token = IERC20(_token);
    }

    /// @notice Claim winnings with a signature from the game server
    /// @param roomId The PvP room ID
    /// @param amount The amount to claim (in token decimals)
    /// @param signature Server's ECDSA signature authorizing this claim
    function claimWinnings(
        string calldata roomId,
        uint256 amount,
        bytes calldata signature
    ) external {
        bytes32 claimId = keccak256(abi.encodePacked(roomId));
        require(!claimed[claimId], "Already claimed");

        // Reconstruct the signed message
        bytes32 messageHash = keccak256(
            abi.encodePacked(roomId, msg.sender, amount)
        );
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        require(_recover(ethSignedHash, signature) == owner, "Invalid signature");

        claimed[claimId] = true;
        require(token.transfer(msg.sender, amount), "Transfer failed");

        emit WinningsClaimed(roomId, msg.sender, amount);
    }

    /// @notice Check if a room's winnings have been claimed
    function isClaimed(string calldata roomId) external view returns (bool) {
        return claimed[keccak256(abi.encodePacked(roomId))];
    }

    /// @notice Get contract's token balance
    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /// @notice Deposit tokens into the contract (requires prior approval)
    function deposit(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Deposit failed");
        emit Deposited(msg.sender, amount);
    }

    /// @notice Owner can withdraw tokens
    function withdraw(uint256 amount) external onlyOwner {
        require(token.transfer(owner, amount), "Transfer failed");
        emit Withdrawn(owner, amount);
    }

    /// @notice Transfer contract ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    function _recover(bytes32 hash, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Bad sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        if (v < 27) v += 27;
        return ecrecover(hash, v, r, s);
    }
}
