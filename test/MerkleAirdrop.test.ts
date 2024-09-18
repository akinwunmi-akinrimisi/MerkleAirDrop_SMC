import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {

    const BAYC_CONTRACT_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"; // BAYC contract on Ethereum mainnet
    const ERC20_TOKEN_ADDRESS = "0xb55d31e46428bEB28234b62D5178DAd5Ec8aD8ca"; //  ERC20 token address
    const BAYC_HOLDER = "0x76C1cFe708ED1d2FF2073490727f3301117767e9"; // address of a BAYC holder

    await helpers.impersonateAccount(BAYC_HOLDER);
    const impersonatedSigner = await ethers.getSigner(BAYC_HOLDER);

    const BAYC_CONTRACT = await ethers.getContractAt("IERC721", BAYC_CONTRACT_ADDRESS, impersonatedSigner);
    const ERC20_CONTRACT = await ethers.getContractAt("IERC20", ERC20_TOKEN_ADDRESS, impersonatedSigner);

    const baycBalance = await BAYC_CONTRACT.balanceOf(BAYC_HOLDER);
    console.log(`BAYC Wallet Balance: ${baycBalance.toString()}`);

    if (baycBalance.toString() === "0") {
        console.log("This address does not own any BAYC NFTs.");
        return;
    }

    const tokenBalance = await ERC20_CONTRACT.balanceOf(BAYC_HOLDER);
    console.log(`ERC20 Token Balance: ${tokenBalance.toString()}`);

   
    const Airdrop_CONTRACT = await ethers.getContractAt("MerkleAirdrop", AirdropContractAddress, impersonatedSigner);

    const proof = []; // 


    console.log("Attempting to claim airdrop...");
    const amountToClaim = ethers.parseUnits("1000", 18); // Replace with the airdrop amount
    const tx = await Airdrop_CONTRACT.claimAirdrop(amountToClaim, proof);

  
    await tx.wait();

    console.log("Airdrop claimed successfully.");

  
    const newTokenBalance = await ERC20_CONTRACT.balanceOf(BAYC_HOLDER);
    console.log(`New ERC20 Token Balance: ${newTokenBalance.toString()}`);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
