// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol, address initialHolder, uint256 initialSupply) 
        ERC20(name, symbol) {
        _mint(initialHolder, initialSupply);
    }
}
    // address public BAYC_CONTRACT = 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;
