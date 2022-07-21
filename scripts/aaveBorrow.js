const { ethers, getNamedAccounts, network } = require("hardhat")
const { BigNumber } = require("@ethersproject/bignumber")
const { getWeth, AMOUNT } = require("../scripts/getWeth.js")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    // Get some weth against eth
    console.log("1. Exchange ETH for WETH...")
    await getWeth()

    // In hardhat.config, we specified which account (from the ones hard hat gives) is to be used in case of different networks chooses.
    console.log("2. Set the deployer")
    const { deployer } = await getNamedAccounts() // This is used to set our wallet in a way, a wallet address to perform everything.

    // We get lending pool address (pair of token address) from lending pool address provider
    console.log("3. Setting up the lending pool")
    const lendingPool = await getLendingPool(deployer)

    // Getting the weth token address
    const wethTokenAddress = networkConfig[network.config.chainId].wethToken

    // lendingPool will perform all the actions of withdrawing etc, hence we need to allow it to do so
    console.log(
        "4. Approving Lending Pool to use our ERC20, like in metamask, we ask to allow aave to control our wallet"
    )
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)

    console.log("5. Depositing WETH...")

    // Calling the deposit function and then depositing the weth token
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0) // Notice 0, this was refferal code in aave, not used now, discontinued
    console.log("6. Desposited!")

    // Getting your borrowing stats, what we have depositied and all. How much we can borrwo and total debt
    console.log("----------------AAVE Status Check")
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)

    // Getting dai price
    console.log("7. Getting price of DAI")
    const daiPrice = await getDaiPrice()

    // Based on how much we can borrow, we calculate how much we can borrow in DAI
    console.log("8. Checking how much dai we can borrow")

    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber()) // Simple calculation to see how much we can borrow
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString()) // Converting the value to wei
    console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`)

    // Borrowing dai based on our calculation

    console.log("9. Borowing DAI")
    await borrowDai(
        networkConfig[network.config.chainId].daiToken, // DAI token address
        lendingPool, // Lendingpool which will allow us to interact with aave
        amountDaiToBorrowWei, // How much DAI to borrow
        deployer // Deployer address, since it is needed for everything
    )

    // Again we check our stats on aave
    console.log("-------------AAVE Status Check")
    await getBorrowUserData(lendingPool, deployer)

    // This is how we repay
    console.log("10. Repaying DAI")
    await repay(
        amountDaiToBorrowWei, // What we borrowed
        networkConfig[network.config.chainId].daiToken, // DAI token address
        lendingPool, // Lendingpool to allow us to interact with aave
        deployer // Well this is always needed.
    )

    // Again we check our stats on aave
    console.log("-------------AAVE Status Check")
    await getBorrowUserData(lendingPool, deployer)
}

// Repay function
async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account) // Approve token transaction
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account) // Repay the DAI
    await repayTx.wait(1) // Wait for transaction to complete
    console.log("Repaid!")
}

// Borrow Function
async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrow, 1, 0, account) // Borrow against the collateral given
    await borrowTx.wait(1) // Wait for transaction to complete
    console.log("You've borrowed!")
}

// Function to get dai price
async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config.chainId].daiEthPriceFeed
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

// We want to approve lendingpool contract to use weth tokens for various purpose like withdraw etc, so approving it.
async function approveErc20(erc20Address, spenderAddress, amount, signer) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer) // Get the abi for ERC20 token from contracts/interfaces, five the erc20 address and sign
    txResponse = await erc20Token.approve(spenderAddress, amount) // Approve
    await txResponse.wait(1) // Wait for 1 block confirmation
    console.log("Approved!")
}

// To get the lending pool address, we need to get the address from the lending pool address provider
async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        // ethers connects with network
        "ILendingPoolAddressesProvider", // abi, which is at contracts/interfaces
        networkConfig[network.config.chainId].lendingPoolAddressesProvider, // The address of lending pool address provider
        account // Our deployer address
    )
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool() // Accessing getLendingPool function in address provider
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account) // This allows the actual interaction with AAVE
    return lendingPool
}

// Function to get aave stats for the specific deployer
// Visit https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool to get all functions available
async function getBorrowUserData(lendingPool, account) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH,
        currentLiquidationThreshold,
        ltv,
        healthFactor,
    } = await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`)
    console.log(`Your Liquidation Threashhold ${currentLiquidationThreshold}`)
    console.log(`Your LTV ${ltv}`)
    console.log(`Your Health Factor ${healthFactor}`)
    return { availableBorrowsETH, totalDebtETH }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
