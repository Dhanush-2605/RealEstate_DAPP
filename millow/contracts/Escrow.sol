//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public lender;
    address public inspector;
    address payable public seller;
    address public nftAddress;

    modifier onlySeller(){
        require(msg.sender==seller,"Only seller can call this method");
        _;
    }
    modifier onlyBuyer(uint256 _nftId){
        require(msg.sender==buyer[_nftId],"Only seller can call this method");
        _;
    }
mapping(uint256=>bool) public isListed;

mapping(uint256=>uint256) public purchasePrice;
mapping(uint256=>uint256) public escrowAmount;
mapping(uint256=>address) public buyer;

    constructor(

        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        lender = _lender;
        nftAddress = _nftAddress;
        inspector = _inspector;
        seller = _seller;
    }

    function list(uint256 _nftId,address _buyer,uint256 _purchasePrice,uint256 _escrowAmount) public payable onlySeller{
        //Transfer nft from seller to this contract

        IERC721(nftAddress).transferFrom(msg.sender,address(this),_nftId);
        isListed[_nftId]=true; 
        purchasePrice[_nftId]=_purchasePrice;
        escrowAmount[_nftId]=_escrowAmount;
        buyer[_nftId]=_buyer;
    }

    //put under contract (only buyer can payable escrow)
    function depositEarnest(uint256 _nftId) public payable onlyBuyer(_nftId){
        require(msg.value >= escrowAmount[_nftId]);
    }
}
