import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import axios from "axios";

import DataTableCrypto from "./datatable-crypto";


const ENDPOINT = "http://localhost:3001";



const CryptoExchangePrices = () => {

    const [response, setResponse] = useState<any[]>([]);
    const [datasource,setDatasource] = useState<any[]>([]);
    //const [da, setda] = useState('');
    const [count, setCount] = useState(0);

    const fetchData = () => {
        fetch(ENDPOINT + "/api/detail")
            .then((response) => response.json())
            .then((data) => console.log("data from API : ", data));
    }





    // @ts-ignore
    useEffect(() => {

        /*fetch(
            ENDPOINT + "/api/detail")
            .then((res) => res.json())
            .then((data) => console.log("data from API : ", data));*/

        fetchData();

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

            /*let getAPI =  () =>  axios.get(ENDPOINT + "/api/detail");
            const tradeResult = getAPI().then(result =>  result.data);
            //let tradeData = tradeResult.data;
            console.log("data from API : ", tradeResult);*/


         return () => {
             socket.off("subscribed-crypto-prices", listener);
             socket.disconnect();
         }

    },[response]);

    return (
        <>
            <div className="container">
                <h1>{count} {response?.length}</h1>
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