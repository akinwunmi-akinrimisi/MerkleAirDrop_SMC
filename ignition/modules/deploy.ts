import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {

  const merkleAirdrop = m.contract("MerkleAirdrop", [0x58730ae0FAA10d73b0cDdb5e7b87C3594f7a20CB, "2b16ee9fa175952bb51b3aa1b71677451a5cfff3f41884850cc4b1d9dfe7c03d", 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D ], {
   
  });

  return { merkleAirdrop };
});

export default MerkleAirdropModule;
