import React, { useEffect, useState, useRef , mediaQuery} from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components"; 

let mediaMatch = window.matchMedia('(max-width: 1000px)');

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`

  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: #fffddf;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 1000px) {
    flex-direction: row;  
     width: 100%;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;
export const gifContainer = styled.div`
  display: flex;
  flex: ${({ flex }) => (flex ? flex : 0)};
  flex-direction: ${({ fd }) => (fd ? fd : "column")};
  justify-content: ${({ jc }) => (jc ? jc : "flex-start")};
  align-items: ${({ ai }) => (ai ? ai : "flex-start")};
  background-color: ${({ test }) => (test ? "pink" : "none")};
  background-image: ${({ image }) => (image ? `url(${image})` : "none")};
  background-size: cover;
  background-position: center;
  margin:  0;
  padding: 0;  
  @media (min-width: 900px) {
    
  }
  @media (min-width: 1000px) {
 
  }

`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  

  return (
<s.Screen>
<s.Container
flex={1}
ai={"center"}
style={{ padding: 0, backgroundColor: "#fff" }}
image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
>  
<ResponsiveWrapper flex={1} style={{ padding: 0, margin:0 }} test>
<s.Container flex={1} jc={"center"} ai={"center"} image={CONFIG.SHOW_BACKGROUND ? "/config/images/Banner.gif" : null} style={ mediaMatch.matches ? { padding:"80px 5%"}  :  {   padding: "67px 5%",height: "vh",paddingLeft: "30vw" }}> 
    </s.Container> 
 
  <s.Container  
    flex={2}
    jc={"center"}
    ai={"center"}
    style={{
      fontFamily:"Gloria Hallelujah", 
      backgroundColor: "#094e60" ,
      padding: 0,
      paddingTop:"4em 0 2em 0",
      borderRadius: 0,
      height:"100vh",
      position:"relative", 
      background: "rgb(9,78,96)",
      background: "linear-gradient(180deg, rgba(9,78,96,1) 0%, rgba(9,78,96,1) 27%, rgba(2,36,43,1) 100%)"  
    }}
  >
    
 <s.TextTitle
      style={{
        textAlign: "center",
        fontSize: 65,
        fontWeight: "bolder",
        color: "#fff",
        LineHeight:"4px",
        fontWeight: "900",
        lineHeight: "72px",
        letterSpacing: "1.8px",
        
      }}
    >
      IT'S MINTING TIME!
    </s.TextTitle>  
    <s.TextTitle
      style={{
        textAlign: "center",
        fontSize: 50,
        fontWeight: "bold",
        marginTop:"1em",
        color: "var(--accent-text)",
      }}
    >
      {data.totalSupply} / {CONFIG.MAX_SUPPLY}
    </s.TextTitle>
    <s.TextDescription
      style={{
        textAlign: "center",
        color: "var(--primary-text)",
      }}
    >
      <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
        {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
      </StyledLink>
    </s.TextDescription> 
    {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
      <>
        <s.TextTitle
          style={{ textAlign: "center", color: "var(--accent-text)" }}
        >
          The sale has ended.
        </s.TextTitle>
        <s.TextDescription
          style={{ textAlign: "center", color: "var(--accent-text)" }}
        >
          You can still find {CONFIG.NFT_NAME} on
        </s.TextDescription> 
        <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
          {CONFIG.MARKETPLACE}
        </StyledLink>
      </>
    ) : (
      <>
        <s.TextTitle
          style={{ textAlign: "center", color: "var(--accent-text)" }}
        >
          1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
          {CONFIG.NETWORK.SYMBOL}.
        </s.TextTitle> 
        <s.TextDescription
          style={{ textAlign: "center", marginBottom:"1em", color: "var(--accent-text)" }}
        >
          Excluding gas fees.
        </s.TextDescription> 
        {blockchain.account === "" ||
        blockchain.smartContract === null ? (
          <s.Container ai={"center"} jc={"center"}>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
              }}
            >
              Connect to the {CONFIG.NETWORK.NAME} network
            </s.TextDescription> 
            <StyledButton 
             style={{ margin:"10%" , color:"#37376c",  fontFamily:"Gloria Hallelujah"  }}
              onClick={(e) => {
                e.preventDefault();
                dispatch(connect());
                getData();
              }}
            >
              CONNECT
            </StyledButton>
            {blockchain.errorMsg !== "" ? (
              <> 
                <s.TextDescription
                  style={{
                    textAlign: "center",
                    color: "var(--accent-text)",
                  }}
                >
                  {blockchain.errorMsg}
                </s.TextDescription>
              </>
            ) : null}
          </s.Container>
        ) : (
          <>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--accent-text)",
                marginBottom:"2em"
              }}
            >
              {feedback}
            </s.TextDescription> 
            <s.Container ai={"center"} jc={"center"} fd={"row"}>
              <StyledRoundButton 
                disabled={claimingNft ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  decrementMintAmount();
                }}
              >
                -
              </StyledRoundButton> 
              <s.TextDescription
                style={{
                  fontSize:"2em",
                  margin:"0 1em",
                  textAlign: "center",
                  color: "var(--accent-text)",

                }}
              >
                {mintAmount}
              </s.TextDescription> 
              <StyledRoundButton
                disabled={claimingNft ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  incrementMintAmount();
                }}
              >
                +
              </StyledRoundButton>
            </s.Container> 
            <s.Container ai={"center"} jc={"center"} fd={"row"}>
              <StyledButton
              style={{color:"#37376c",  fontFamily:"Gloria Hallelujah", margin:"1em 0"} } 
              disabled={claimingNft ? 1 : 0}
                onClick={(e) => {
                  e.preventDefault();
                  claimNFTs();
                  getData();
                }}
              >
                {claimingNft ? "BUSY" : "BUY NOW"}
              </StyledButton>
            </s.Container>
          </>
        )}
      </>
    )}
    <s.Container jc={"center"} ai={"center"} style={{ width: "80%", marginTop:"0em" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "#fff",
              fontSize:".75em"
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
        
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "#fff",
              fontSize:".75em"
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
            <s.Container 
              style={
                mediaMatch.matches?
                { width: "100vw",
                  backgroundColor: "#2081e2",
                  position: "fixed",
                  bottom: "0px",
                  height: "2.5em",
                  marginLeft: "2px",
                }:
                {
                width: "43.5vw",
                backgroundColor: "#2081e2",
                position: "fixed",
                bottom: "0px",
                height: "2.5em",
                marginLeft: "2px",
              }
            }
             >
               <s.TextDescription style={{textAlign:"center", textAlign: "center",
    color: "aqua",
    margin: "1% 0", width:"100%" }} >
      <marquee style={{paddingTop:"4px"}} >
      <a href="#"  style={{ textDecoration:"none", color:"white" }}>VIEW THE COLLECTION ON OPENSEA </a> 
      </marquee>  
               </s.TextDescription>
               
            </s.Container>
  </s.Container> 

</ResponsiveWrapper> 

</s.Container>
    </s.Screen>
  );
}

export default App;
