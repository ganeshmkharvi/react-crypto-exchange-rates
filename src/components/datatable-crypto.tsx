import React, {useState, useEffect, useCallback, useRef} from 'react';

import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Dialog} from 'primereact/dialog';
import {Dropdown} from 'primereact/dropdown';

import {Button} from 'primereact/button';

import {Calendar} from 'primereact/calendar';
import { Toast } from 'primereact/toast';

//import 'bootstrap/dist/css/bootstrap.css';
import '../Datatable.css';
import socketIOClient from "socket.io-client";
import {InputNumber} from "primereact/inputnumber";


const ENDPOINT = "http://localhost:3001";

const socket = socketIOClient(ENDPOINT);

const DataTableCrypto = () => {

    const toast = useRef(null);

    const [crypto, setCrypto] = useState<any[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [response, setResponse] = useState<any[]>([]);
    const [dateFilterStart, setDateFilterStart] = useState<Date | Date[] | undefined>(undefined);
    const [dateFilterEnd, setDateFilterEnd] = useState<Date | Date[] | undefined>(undefined);
    const [type, setType] = useState<any>(null);
    const [displayModal, setDisplayModal] = useState(false);
    const [cryptoList, setCryptoList] = useState<any[]>([]);
    const [selectedCrypto, setSelectedCrypto] = useState<any>({});
    const [cryptoAmount, setCryptoAmount] = useState<number | null>(0);
    const [targetAmount, setTargetAmount] = useState<number | null>(0);
    const [targetList, setTargetList] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<any>({});
    const [priceList, setPriceList] = useState<any[]>([]);

    const [selectedTrade, setSelectedTrade] = useState<any>(null);

    const getApiData = () => {
        fetch("http://localhost:3001/api/detail", {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setCrypto(data);
                setTableData(data);
                console.log("data from API : ", data)
            })
            .catch(error => console.log("error in fetch ", error))
    }
    const submitTradeData = () => {
        fetch(ENDPOINT+"/api/detail", {

            // Adding method type
            method: "POST",

            // Adding body or contents to send
            body: JSON.stringify({
                transactionDate: new Date(),
                currencyFrom: selectedCrypto.name,
                amount1:cryptoAmount,
                currency2:selectedTarget.name,
                amount2:targetAmount,
                conversionType:"Exchanged"
            }),

            // Adding headers to the request
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })

            // Converting to JSON
            .then(response => response.json())

            // Displaying results to console
            .then(json => {
                console.log("response after SUBMIT",json);
                if(json.message)
                    { // @ts-ignore
                        toast.current.show({severity:'error', summary: 'Error Message', detail:json.message, life: 3000});
                    }
                else{
                    // @ts-ignore
                    toast.current.show({severity:'success', summary: 'Success Message', detail:'Exchange Submitted', life: 3000});
                }
                getApiData();
            });
    }


    useEffect(() => {

        const listener = (data: any) => {
            console.log("data", data);
            console.log("test dd");
            console.log("data read at " + new Date().toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }));
            setResponse(data);

        }

        socket.on("subscribed-crypto-prices", listener);

        return () => {
            socket.off("subscribed-crypto-prices", listener)
        };


    }, [response])

    useEffect(() => {
        generateCurrencyList();
        generatePriceList();
    }, [response]);

    useEffect(()=>{
        calculatePrice();
    },[selectedCrypto,selectedTarget,cryptoAmount]);

    useEffect(()=>{
        calculateReversePrice();
    },[targetAmount]);
    const onTypeChange = (e: { value: any }) => {
        setType(e.value);
    }
    const onCryptoChange = (e: { value: any }) => {
        setSelectedCrypto(e.value);
    }

    const calculatePrice = () => {
        console.log("CALCULATING PRICE");
        if (selectedTarget && selectedCrypto) {
            const price = priceList.find(x => x.key === selectedCrypto.base + "-" + selectedTarget.name);
            if(!price)
                return;
            const cAmount = cryptoAmount ?? 0;

            setTargetAmount(price.value * cAmount);
        }
    }

    const calculateReversePrice = () => {
        console.log("CALCULATING REVERSE PRICE");
        if (selectedTarget && selectedCrypto) {
            const price = priceList.find(x => x.key === selectedCrypto.base + "-" + selectedTarget.name);
            console.log("price : ", price)
            if(!price)
                return;
            const tAmount = targetAmount ?? 0;
            const value = tAmount / Number(price.value);
            console.log("value : ", value);

            setCryptoAmount(value);
        }
    }

    const onTargetChange = (e: { value: any }) => {
        setSelectedTarget(e.value);
    }
    const filterData = () => {
        let tableData = crypto;
        console.log("tableData : ", tableData);
        console.log("date1 : ", dateFilterStart);
        console.log("date2 : ", dateFilterEnd);
        console.log("type : ", type)
        if (dateFilterStart) {
            tableData = tableData.filter(x => new Date(x.transactionDate) >= new Date(dateFilterStart.toLocaleString()));
            console.log("tableData F1: ", tableData);
        }
        if (dateFilterEnd) {
            tableData = tableData.filter(x => new Date(x.transactionDate) <= new Date(dateFilterEnd.toLocaleString()));
            console.log("tableData F2: ", tableData);
        }

        if (type)
            tableData = tableData.filter(x => x.conversionType === type.name);
        console.log("tableData FILTERED : ", tableData);
        setTableData(tableData);

    }

    const clearFilterData = () => {

        setType(null);
        setDateFilterEnd(undefined);
        setDateFilterStart(undefined);
        setTableData(crypto);

    }


    const currencyOptionTemplate = (option: any) => {
        return (
            <div className="">
                <img alt={option.name} src={option.imgUrl}
                     style={{width: '24px', height:'24px'}}/*onError={(e) => e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'}*/ />
                <span> {option.name}</span>
            </div>
        );
    }

    const selectedCurrencyTemplate = (option: any) => {
        if (option) {
            return (
                <div className="">
                    <img alt={option.name} src={option.imgUrl}
                         style={{width: '24px', height:'24px'}} /*onError={(e) => e.target.src = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'}*/ />
                    <span> {option.name}</span>
                </div>
            );
        };

        return (
            <span>
                {"Choose a currency"}
            </span>
        );
    }

    useEffect(() => {
        getApiData();
    }, []);

    const formatDate = (value: any) => {
        console.log("Date value in formatDate : ", value)
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    const renderFilter = () => {

        return <>
            <div className="mt-3 border-1">
                <div className="p-fluid grid formgrid row">
                    <div className="field col-4 col-md-3">
                        <label htmlFor="fromDate">From Date</label>
                        <Calendar id="fromDate" dateFormat="mm/dd/yy" value={dateFilterStart}
                                  onChange={(e) => setDateFilterStart(e.value)}
                                  onMonthChange={() => console.log("MC")}/>
                    </div>
                    <div className="field col-4 col-md-3">
                        <label htmlFor="toDate">To Date</label>
                        <Calendar id="toDate" className="mr-3" dateFormat="mm/dd/yy" value={dateFilterEnd}
                                  onChange={(e) => setDateFilterEnd(e.value)} onMonthChange={() => console.log("MC")}/>
                    </div>
                    <div className="field col-4 d-none d-md-inline col-md-3">
                        <label htmlFor="type">Type</label>
                        <Dropdown id="type" value={type} options={[{name: 'Live Price', code: 'LP'},
                            {name: 'Exchanged', code: 'EX'}]} onChange={onTypeChange} optionLabel="name"
                                  placeholder="Select a Type"/>
                    </div>

                    <div className="field col-4 col-md-3 mt-4">
                        <div className="d-flex justify-content-around align-items-center">

                            <Button icon="pi pi-filter" className="p-button-rounded p-button-success"
                                    aria-label="Filter" onClick={filterData}/>
                            <Button icon="pi pi-times" className="p-button-rounded p-button-danger" aria-label="Clear"
                                    onClick={clearFilterData}/>

                        </div>
                    </div>
                </div>
            </div>
        </>


    }


    const generateCurrencyList = () => {
        if(response.length === 0) return;
        let responseList = response;
        let idx:  any[] = [];
        let cList = [];
        let tList = [];
        for (let i = 0; i < response.length; i++) {
            let element = responseList[i];
            if (idx.indexOf(element.base) === -1) {
                idx.push(element.base);
                cList.push({
                    name: element.name,
                    base: element.base,
                    fractions: element.baseDecimalPlaces,
                    imgUrl: element.baseUrl
                })
            }
            if (idx.indexOf(element.target) === -1) {
                idx.push(element.target);
                tList.push({name: element.target, fractions: element.targetDecimalPlaces, imgUrl: element.targetUrl})
            }
        }
        setCryptoList(cList);
        setTargetList(tList);
    }

    const generatePriceList = () => {
        if(response.length === 0) return;
        let responseList = response;
        let result = [];
        for (let i = 0; i < response.length; i++) {
            let element = responseList[i];
            result.push({key: element.base + "-" + element.target, value: element.price})
        }
        setPriceList(result);
    }


    const renderTradeForm = () => {

        // @ts-ignore
        return  cryptoList && targetList && <>
            <div>
                <h4>Exchange</h4>
            </div>

            <div className="mt-3 border-1">
                <div className="p-fluid grid formgrid row">
                    <div className="field col-12 col-md-2">
                        <label htmlFor="type">Currency from</label>

                        <Dropdown value={selectedCrypto} options={cryptoList} onChange={onCryptoChange}
                                  optionLabel="name"
                                  itemTemplate={currencyOptionTemplate} valueTemplate={selectedCurrencyTemplate}/>
                    </div>
                    <div className="field col-12 col-md-2">
                        <label htmlFor="toDate">Amount</label>
                        <InputNumber value={cryptoAmount} onValueChange={(e) => {setCryptoAmount(e.value)}} mode="decimal"
                                     minFractionDigits={2} maxFractionDigits={selectedCrypto.fractions}/>
                    </div>


                    <div className="field flex d-flex justify-content-center align-items-center">
                        <div className="d-none d-md-inline">
                            {"="}
                        </div>
                    </div>


                    <div className="field col-12 col-md-2">
                        <label htmlFor="type">Currency to</label>
                        <Dropdown value={selectedTarget} options={targetList} onChange={onTargetChange}
                                  optionLabel="name"
                                  itemTemplate={currencyOptionTemplate} valueTemplate={selectedCurrencyTemplate}/>
                    </div>
                    <div className="field col-12 col-md-2">
                        <label htmlFor="toDate">Amount</label>
                        <InputNumber value={targetAmount} onValueChange={(e) =>{ setTargetAmount(e.value); calculateReversePrice();}} mode="decimal"
                                     minFractionDigits={2} maxFractionDigits={selectedTarget.fractions}/>
                    </div>

                    <div className="col-12 col-md-2 flex d-flex align-items-end mb-1">


                            <Button label="Submit" className="p-button p-button-success w-100" aria-label="Filter"
                                    onClick={submitTradeData}/>

                    </div>
                </div>
            </div>
        </>


    }

    const dateBodyTemplate = (rowData: any) => {
        return formatDate(rowData.transactionDate);
    }
    const onHide = () => {
        setDisplayModal(false);
    }
    const renderModalFooter = () => {
        return (
            <div>
                <Button label="Close" icon="pi pi-times" onClick={() => onHide()}
                        className="p-button p-button-success w-100"/>
            </div>
        );
    }

    const mobileScreenBodyTemplate = (rowData: any) => {
        if (!rowData || response.length === 0 || crypto.length === 0) return null;
        const symbol = response.find(x => x.name === rowData.currencyFrom);
        // @ts-ignore
        let element = <>
            <div className="row" /*onClick={()=>{generatedModal(rowData); setDisplayModal(true);}}*/>

                <div className="col-10">
                    <p><span className="font-weight-bold">{rowData.currencyFrom} {'->'} {rowData.currency2}</span></p>
                    <p><span>Amount {symbol?.base} {rowData.amount1}</span></p>
                </div>
                <div className="col-2">
                    <span className="text-success"><i className="pi pi-circle-on"></i></span>
                </div>

            </div>
        </>;
        return symbol && rowData && element;
    }
    const header1 = renderFilter();

    const renderModal = (rowData: any) => {
        return <>
            <Dialog header="Exchange" visible={displayModal} onHide={() => setDisplayModal(false)}
                    breakpoints={{'960px': '75vw'}} style={{width: '50vw'}} footer={renderModalFooter}>
                <table className="table table-sm table-borderless">
                    <tbody>
                    <tr>
                        <td>Date & Time</td>
                        <td>{formatDate(rowData.transactionDate)}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td><span className="text-success"><i className="pi pi-circle-on"></i>  Approved</span></td>
                    </tr>
                    <tr>
                        <td>From</td>
                        <td>{rowData.currencyFrom}</td>
                    </tr>
                    <tr>
                        <td>To</td>
                        <td>{rowData.currency2}</td>
                    </tr>
                    <tr>
                        <td>Amount</td>
                        <td>{rowData.amount1}</td>
                    </tr>
                    <tr>
                        <td>Total Amount</td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
            </Dialog>
        </>
    }

    const form = renderTradeForm();

    return (
        <>
            <Toast ref={toast} />
            {form}
            <hr/>
            <div className="mt-5">
                <h4>History</h4>
            </div>
            <div className="mb-3 mt-1">
                {header1}
            </div>
            <hr/>
            <div className="datatable-filter-demo d-none d-md-block mt-4">

                <div className="card">
                    {
                        crypto && crypto.length > 0 &&
                            <>
                                <DataTable value={tableData} paginator className="p-datatable-customers" showGridlines
                                           rows={10}
                                           dataKey="id" responsiveLayout="scroll" emptyMessage="No data found.">

                                    <Column field="conversionType" header="Type" style={{minWidth: '12rem'}}/>


                                    <Column header="Date" filterField="transactionDate" dataType="date"
                                            field="transactionDate" style={{minWidth: '10rem'}}
                                            body={dateBodyTemplate}/>

                                </DataTable>
                            </>
                    }
                </div>

            </div>

            <div className="datatable-filter-demo mt-4 d-md-none">
                <div className="card">
                    {
                        crypto && crypto.length > 0 &&
                            <>
                                <DataTable value={tableData} paginator className="p-datatable-customers" showGridlines
                                           rows={10}
                                           selectionMode="single" selection={selectedTrade}
                                           onSelectionChange={
                                               e => {
                                                    setSelectedTrade(e.value);
                                                    setDisplayModal(true);
                                                }
                                           }
                                           dataKey="id" responsiveLayout="scroll" emptyMessage="No data found.">

                                    <Column headerClassName="d-none" filterField="transactionDate" dataType="date"
                                            field="transactionDate" style={{minWidth: '10rem'}}
                                            body={mobileScreenBodyTemplate}/>

                                </DataTable>

                                {
                                    displayModal && renderModal(selectedTrade)
                                }
                            </>
                    }
                </div>

            </div>

        </>
    );
};

export default DataTableCrypto