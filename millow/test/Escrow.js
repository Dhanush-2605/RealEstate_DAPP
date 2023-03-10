const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let realEstate, escrow;

  beforeEach(async () => {
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    //Deploy RealEstate
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    // console.log(realEstate.address);

    //Mint
    let transaction = await realEstate
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json"
      );
    await transaction.wait();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );

    //Approve property
    transaction=await realEstate.connect(seller).approve(escrow.address,1);
    await transaction.wait();

    //list property
    transaction=await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5));
    await transaction.wait();

  });
  describe("Deployment", () => {
    it("Returns NFT Address", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.be.equals(realEstate.address);
    });
    it("Returns Seller Address", async () => {
      const result = await escrow.seller();
      expect(result).to.be.equals(seller.address);
    });
    it("Returns Inspector", async () => {
      const result = await escrow.inspector();
      expect(result).to.be.equals(inspector.address);
    });
    it("Returns Lender", async () => {
      const result = await escrow.lender();
      expect(result).to.be.equals(lender.address);
    });
  });
  describe("Listing", () => {
    it("Updates as Listed", async () => {
      // expect(result).to.be.equals(realEstate.address);
      const result=await escrow.isListed(1);
      expect(result).to.be.equal(true);
    });

    it("Updates ownership", async () => {
      // expect(result).to.be.equals(realEstate.address);
      expect(await realEstate.ownerOf(1)).to.be.equals(escrow.address);
    });
    it("Returns Buyer", async () => {
      const result=await escrow.buyer(1);
      expect(result).to.be.equal(buyer.address);
    });
    it("Returns Purchase Price", async () => {
      const result=await escrow.purchasePrice(1);
      expect(result).to.be.equal(tokens(10));
    });
    it("Returns escrow amount", async () => {
      const result=await escrow.escrowAmount(1);
      expect(result).to.be.equal(tokens(5));
    });

  });

  it("saves the address", async () => {});
});
