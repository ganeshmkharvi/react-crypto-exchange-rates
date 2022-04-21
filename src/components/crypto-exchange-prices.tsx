import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

import DataTableCrypto from "./datatable-crypto";


const ENDPOINT = "http://localhost:3001";



const CryptoExchangePrices = () => {

    const [response, setResponse] = useState<any[]>([]);
    //const [da, setda] = useState('');
    const [count, setCount] = useState(0);

    // @ts-ignore
    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);

            const listener = (data:any) => {
                console.log("data",data);
                let temp = count;
                const dataConverted = data.map((item: { date: Date; }) => {
                    item.date = new Date();
                    //console.log("retrieving item", item);
                    return item;
                })
                setCount(count+1);
                console.log("data read " + count + " times at " + new Date().toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }));
                setResponse(dataConverted);

            }

            socket.on("subscribed-crypto-prices", listener);

         return () => {
             socket.off("subscribed-crypto-prices", listener);
             socket.disconnect();
         }

    });

    return (
        <>
            <div className="container">
                <h1>{count} {response.length}</h1> 
                <DataTableCrypto data={response}></DataTableCrypto>
                <h1>{count}</h1>
            </div>
        </>
    );
};

// CryptoExchangePrices.propTypes = {
//     name: React.PropTypes.string.isRequired
// }

export default CryptoExchangePrices