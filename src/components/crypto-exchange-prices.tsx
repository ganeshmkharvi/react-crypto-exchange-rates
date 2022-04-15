import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:3001";

const CryptoExchangePrices = () => {

    const [response, setResponse] = useState("");

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);
        socket.on("subscribed-crypto-prices", data => {
            console.log(data);
            setResponse(data);
        });
    }, []);

    return (
        <>
            check the repsonse  
        </>
    );
}

// CryptoExchangePrices.propTypes = {
//     name: React.PropTypes.string.isRequired
// }

export default CryptoExchangePrices