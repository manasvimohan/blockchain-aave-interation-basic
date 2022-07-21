# Project Name

Aave protocol lending and borrowing using javascipt

# Tags

blockchain aave defi javascript

# Links

Youtube: https://youtu.be/gyMwXuJrbJQ?t=69965
Github: https://github.com/PatrickAlphaC/hardhat-defi-fcc

# Objective

Learn how to interact with aave protocol using javascript.

# Flow of program

1. Setup Hardhat environment.
2. Use mainnet forking method. Will use infura or alchemy to get a node to interact with the chains.
3. We then exchange ETh for some weth. We use IWETH interface to let ethers know how to interact with it. Interface gives ABI and Token address, which ethers use.
4. Then we will deposit ETH/ WETH into aave
5. Then we borrow DAI against our deposit collateral
6. Then we repay DAI.

# Why not use mainnet forking all the time?

Pro - Easy, quick and resemble mainnet
Cons - We need an API and some contracts are hard to work with

# Steps

Setup hardhat environment and install dependencies
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv
yarn add --dev @aave/protocol-v2
Write down the scripts
yarn hardhat run [scripts/aaveBorrow.js](scripts/aaveBorrow.js)

# Files and Purpose:

├── scripts
│   ├── aaveBorrow.js <-- The actual script to borrow
│   └── getWeth.js <-- Script to convert some ETH to WETH

./contracts/
└── interfaces
├── AggregatorV3Interface.sol
├── IERC20.sol <-- Since aave treats everything as erc20 token, we need its abi.
├── ILendingPool.sol <-- We need to interact with AAve lending pool, hence need an interface provided by aave.
└── IWeth.sol <-- Enable us to use wrapped ether abi. Used to exchange eth for weth.

# Author Details

**Name**: Manasvi Mohan Sharma
**Website**: <https://www.manasvi.co.in>
**Mobile**: +91-9899447040, +91-8181010179
**Email**: <manasvimsharma@gmail.com>
**LinkedIn**: <https://www.linkedin.com/in/manasvi-m/>
