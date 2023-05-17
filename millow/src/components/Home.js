import { ethers } from "ethers";
import { useEffect, useState } from "react";

import close from "../assets/close.svg";

const Home = ({ home, provider, account, escrow, togglePop }) => {
  const [hasBrought, setHasBrought] = useState(false);
  const [hasLend, setHasLended] = useState(false);

  const [hasInspected, setHasInspected] = useState(false);

  const [hasSold, setHasSold] = useState(false);

  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);
  const [owner, setOwner] = useState(null);

  const fetchDetails = async () => {
    const buyer = await escrow.buyer(home.id);
    setBuyer(buyer);

    const hasBrought = await escrow.approval(home.id, buyer);
    setBuyer(hasBrought);

    const seller = await escrow.seller();
    setSeller(seller);

    const hasSold = await escrow.approval(home.id, seller);
    setHasSold(hasSold);

    const lender = await escrow.lender();
    setLender(lender);

    const hasLended = await escrow.approval(home.id, lender);
    setHasLended(hasLended);

    const inspector = await escrow.inspector();
    setInspector(inspector);

    const hasInspected = await escrow.approval(home.id, inspector);
    setHasInspected(hasInspected);
    // const buywait escrow.buyer(home.id);
  };

  const fetchOwner = async () => {
    if (await escrow.isListed(home.id)) return;
    const owner = await escrow.buyer(home.id);
    setOwner(owner);
  };

  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(home.id);
    const signer = await provider.getSigner();

    let transaction = await escrow
      .connect(signer)
      .depositEarnest(home.id, { value: escrowAmount });
    await transaction.wait();

    transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();
    setHasBrought(true);
  }
  const inspectHandler = async () => {
    const signer = await provider.getSigner();

    let transaction = await escrow
      .connect(signer)
      .updateInspectionStatus(home.id, true);
    transaction.wait();
    setHasInspected(true);
  }
  const lendHandler = async () => {
    const signer = await provider.getSigner();

    //lender approves..
    const transaction = await escrow.connect(signer).approveSale(home.id);
    await transaction.wait();

    //lender send funds to contact
    const lendAmount =(await escrow.purchasePrice(home.id) -await escrow.escrowAmount(home.id))

    console.log("lend Amount: " + lendAmount);

    await signer.sendTransaction({
      to: escrow.address,
      value: lendAmount.toString(),
      gasLimit: 100000000
    })

    setHasLended(true);
  };
  const sellHandler = async () => {
    const signer = await provider.getSigner();
    let transaction = await escrow.connect(signer).approveSale(home.id);
    transaction.wait();

    //selller finalize

    transaction = await escrow.connect(signer).finalizeSale(home.id);
    await transaction.wait();
    setHasSold(true);
  };
  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [hasSold]);

  return (
    <div className="home">
      <div className="home__details">
        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>
        <div className="home__overview">
          <h1>{home.name}</h1>
          <p>
            <strong>{home.attributes[2].value}</strong> bds|
            <strong>{home.attributes[3].value}</strong> ba|
            <strong>{home.attributes[4].value}</strong> sqft
          </p>
          <p>{home.address}</p>
          <h2>{home.attributes[0].value} ETH</h2>
          {owner ? (
            <div className="home__owned">
              Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
            </div>
          ) : (
            <div>
              {account === inspector ? (
                <button
                  className="home__buy"
                  onClick={inspectHandler}
                  disabled={hasInspected}
                >
                  Approve Inspection
                </button>
              ) : account === lender ? (
                <button
                  className="home__buy"
                  onClick={lendHandler}
                  disabled={hasLend}
                >
                  Approve & Lend
                </button>
              ) : account === seller ? (
                <button
                  className="home__buy"
                  onClick={sellHandler}
                  disabled={hasSold}
                >
                  Approve & Sell
                </button>
              ) : (
                <button
                  className="home__buy"
                  onClick={buyHandler}
                  disabled={hasBrought}
                >
                  BUY
                </button>
              )}

              <button className="home__contact">Contact Agent</button>

              {/* )} */}
            </div>
          )}

          <div>
            {/* <button className="home__contact">Contact Agent</button> */}
            <hr />
            <h2>Overview</h2>
            <p>{home.description}</p>
            <hr />
            <h2>Facts and features</h2>
            <ul>
              {home.attributes.map((attribute, index) => (
                <li key={index}>
                  <strong>{attribute.trait_type}</strong> : {attribute.value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button onClick={togglePop} className="home__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Home;
