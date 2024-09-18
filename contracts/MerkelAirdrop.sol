// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    IERC20 public token;
    IERC721 public BAYC;
    bytes32 public merkleRoot;

    mapping(address => bool) public hasClaimed;
    address public BAYC_CONTRACT = 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;

    constructor(address _token, bytes32 _merkleRoot, address _baycContract) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
        BAYC = IERC721(_baycContract); // 
    }

    function ownsBAYC(address user) public view returns(bool){
        return BAYC.balanceOf(user)>0;
    }

    function claimAirdrop(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Airdrop already claimed");
        require(ownsBAYC(msg.sender), "must own BAYC NFT");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid Merkle Proof");

        hasClaimed[msg.sender] = true;

        require(token.transfer(msg.sender, amount), "Token transfer failed");
    }
}






