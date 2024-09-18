import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  import { MerkleTree } from "merkletreejs";
  import keccak256 from "keccak256";
  
  describe("MerkleAirdrop", function () {
    async function deployMerkleAirdropFixture() {
      // Signers
      const [owner, user1, user2] = await hre.ethers.getSigners();
  
      // Deploy myToken
      const myToken = await hre.ethers.getContractFactory("myToken");
      const token = await myToken.deploy("TestToken", "TTK", owner.address, hre.ethers.parseUnits("100000"));
  
      // Create Merkle Tree
      const leaves = [user1.address, user2.address].map((addr) =>
        keccak256(hre.ethers.solidityPack(["address", "uint256"], [addr, 1000]))
      );
      const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      const merkleRoot = merkleTree.getHexRoot();
  
      // Deploy MerkleAirdrop contract
      const MerkleAirdrop = await hre.ethers.getContractFactory("MerkleAirdrop");
      const airdrop = await MerkleAirdrop.deploy(token.address, merkleRoot);
  
      // Transfer tokens to the airdrop contract
      await token.transfer(airdrop.address, hre.ethers.parseUnits("2000"));
  
      return { airdrop, token, owner, user1, user2, merkleTree };
    }
  
    describe("Claim Airdrop", function () {
      it("should allow user1 to claim tokens", async function () {
        const { airdrop, token, user1, merkleTree } = await loadFixture(deployMerkleAirdropFixture);
  
        // Generate proof for user1
        const proof = merkleTree.getHexProof(
          keccak256(hre.ethers.solidityPack(["address", "uint256"], [user1.address, 1000]))
        );
  
        // User1 claims the airdrop
        await expect(airdrop.connect(user1).claimAirdrop(1000, proof))
          .to.emit(token, "Transfer")
          .withArgs(airdrop.address, user1.address, hre.ethers.parseUnits("1000"));
  
        // Check the token balance of user1
        const balance = await token.balanceOf(user1.address);
        expect(balance).to.equal(hre.ethers.parseUnits("1000"));
      });
  
      it("should reject claim if proof is invalid", async function () {
        const { airdrop, user2, merkleTree } = await loadFixture(deployMerkleAirdropFixture);
  
        // Generate an invalid proof for user2
        const invalidProof = merkleTree.getHexProof(
          keccak256(hre.ethers.solidityPack(["address", "uint256"], [user2.address, 500]))
        );
  
        // User2 tries to claim with an invalid proof
        await expect(airdrop.connect(user2).claimAirdrop(1000, invalidProof)).to.be.revertedWith("Invalid Merkle Proof");
      });
  
      it("should not allow a user to claim twice", async function () {
        const { airdrop, user1, merkleTree } = await loadFixture(deployMerkleAirdropFixture);
  
        // Generate proof for user1
        const proof = merkleTree.getHexProof(
          keccak256(hre.ethers.solidityPack(["address", "uint256"], [user1.address, 1000]))
        );
  
        // User1 claims the airdrop
        await airdrop.connect(user1).claimAirdrop(1000, proof);
  
        // User1 tries to claim again
        await expect(airdrop.connect(user1).claimAirdrop(1000, proof)).to.be.revertedWith("Airdrop already claimed");
      });
    });
  });
  