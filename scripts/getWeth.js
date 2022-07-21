const { ethers, getNamedAccounts, network } = require("hardhat") // To get the wallet address to set as deployer, to perform everything. Given by hardhat.
const { networkConfig } = require("../helper-hardhat-config") // Here we have set our token addresses to inteact with. A front end can use this in dropdown.

const AMOUNT = ethers.utils.parseEther("0.01") // Amount of ether to exchange for weth

async function getWeth() {
    // Our function to exchange eth and weth
    console.log(`A - Getting ${AMOUNT} WETH against ETH`)
    const { deployer } = await getNamedAccounts() // Get deployer wallet address
    const iWeth = await ethers.getContractAt(
        // Ethers need abi, token address and deployer
        "IWeth", // ABI from interface
        networkConfig[network.config.chainId].wethToken, // Weth address
        deployer // Our deployer, which is one of the account that hardhat creates
    )
    const txResponse = await iWeth.deposit({
        // Actually depositing ether
        value: AMOUNT,
    })
    await txResponse.wait(1) // Wait for 1 block confirmation
    const wethBalance = await iWeth.balanceOf(deployer) // get balance of deployer of weth for confirmation
    console.log(`B - Got ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth, AMOUNT }
