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
mapping(uint256=>bool) isListed;
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
    function list(uint256 _nftId) public{
        //Transfer nft from seller to this contract

        IERC721(nftAddress).transferFrom(msg.sender,address(this),_nftId);
        isListed[_nftId]=true; 
    }
}
