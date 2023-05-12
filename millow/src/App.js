import { useEffect, useState } from "react";
import { ethers } from "ethers";
// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [homes,setHomes]=useState([]);
  const [home,setHome]=useState()
  const [toogle,setToogle]=useEffect(false)
  const loadBlockChainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();
    // config[network.chainId].realEstate.address
    // config[network.chainId].escrow.address
    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );
    const totalSupply = await realEstate.totalSupply();
    console.log(totalSupply.toString());

    const homes = [];
    for (let i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      homes.push(metadata);
    }
    setHomes(homes);
    console.log(homes);

    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );

    setEscrow(escrow);

    // console.log(provider);
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });

    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    // console.log(account[0]);
    setAccount(account);
  };
  useEffect(() => {
    loadBlockChainData();
  }, []);

  const toogleProp=(home)=>{
    console.log(home)
    setHome(home)
    toogle?setToogle(false):setToogle(true)

  }
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />
      <div className="cards__section">
        <h3>Homes For You</h3>
        <hr />
        <div className="cards">
        {homes.map((home,ind)=>(
          <div className="card" key={ind} onClick={()=>toogleProp(home)}>
            <div className="card__image">
              <img src={home.image} alt="home" />
            </div>
            <div className="card__info">
              <h4>{home.attributes[0].value} ETH</h4>
              <p>
                <strong>{home.attributes[2].value}</strong> bds |
                <strong>{home.attributes[3].value}</strong> ba |
                <strong>{home.attributes[4].value}</strong> sqft
              </p>
              <p>{home.address}</p>
            </div>
          </div>

        ))}

        </div>

        {toogle &&(
          <Home/>
        )}
      </div>
    </div>
  );
}

export default App;
