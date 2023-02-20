const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer,seller,inspector,lendor
  let realEstate,escrow
  it("saves the address", async () => {
    [buyer,seller,inspector,lendor] = await ethers.getSigners();
    
    //Deploy RealEstate
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    // console.log(realEstate.address);

    //Mint
    let transaction = await realEstate.connect(seller).mint(
      "https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json"
    );
    await transaction.wait();

    const Escrow=await ethers.getContractFactory('Escrow');
    escrow=await Escrow.deploy(realEstate.address,seller.address,inspector.address,lendor.address);

   let result=await escrow.nftAddress();
    expect(result).to.be.equals(realEstate.address);

    result=await escrow.seller();
    expect(result).to.be.equals(seller.address);
    

  });
});
