import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import axios from "axios";

import DataTableCrypto from "./datatable-crypto";




const CryptoExchangePrices = () => {

    return (
        <>
            <div className="container">

                <DataTableCrypto></DataTableCrypto>

            </div>
        </>
    );
};

// CryptoExchangePrices.propTypes = {
//     name: React.PropTypes.string.isRequired
// }

export default CryptoExchangePrices