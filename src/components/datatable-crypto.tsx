import React, { useState, useEffect } from 'react';
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Slider } from 'primereact/slider';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import '../Datatable.css';

const DataTableCrypto = (props:any) => {
    console.log("props.data : => ", props.data);

    const [crypto, setCrypto] = useState<any[]>(props.data);
    const [filters1, setFilters1] = useState<any>();
    const [globalFilterValue1, setGlobalFilterValue1] = useState('');

    //const [loading1, setLoading1] = useState(true);
    
    // useEffect(() => {
    //     // console.log(props.data);
    //     // console.log("data datatable",crypto);
    //      setCrypto(props.data);
    //     initFilters1();
    // }); // eslint-disable-line react-hooks/exhaustive-deps
    //setCrypto(props.data);
    useEffect(() => {
        setCrypto(props.data);
        console.log(props.data);
    }); //

    const formatDate = (value:any) => {
        return value.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: "2-digit",
            minute: "2-digit",
            second:"2-digit"
        });
    }

    const formatCurrency = (value:any) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    const clearFilter1 = () => {
        initFilters1();
    }

    const onGlobalFilterChange1 = (e:any) => {
        const value = e.target.value;
        let _filters1 = { ...filters1 };
        _filters1['global'].value = value;

        setFilters1(_filters1);
        setGlobalFilterValue1(value);
    }



    const initFilters1 = () => {
        setFilters1({
            'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
            'date': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
        });
        setGlobalFilterValue1('');
    }

    const renderHeader1 = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" className="p-button-outlined" onClick={clearFilter1} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue1} onChange={onGlobalFilterChange1} placeholder="Keyword Search" />
                </span>
            </div>
        )
    }

    const dateBodyTemplate = (rowData:any) => {
        return formatDate(rowData.date);
    }

    const dateFilterTemplate = (options:any) => {
        return  <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy hh:mm" showTime placeholder="mm/dd/yyyy h:m" mask="99/99/9999 99:99"  onMonthChange={()=> console.log("month changed")}/>
    }

    const header1 = renderHeader1();

    return (
        <div className="datatable-filter-demo sample">
            <div className="card">
                <DataTable value={crypto} paginator className="p-datatable-customers" showGridlines rows={10}
                           dataKey="id" filters={filters1} filterDisplay="menu"  responsiveLayout="scroll"
                           globalFilterFields={['name', 'country.name', 'representative.name', 'balance', 'status']} header={header1} emptyMessage="No data found.">
                    <Column field="name" header="Name" filter filterPlaceholder="Search by name" style={{ minWidth: '12rem' }} />


                    <Column header="Date" filterField="date" dataType="date" style={{ minWidth: '10rem' }} body={dateBodyTemplate}
                            filter filterElement={dateFilterTemplate} />
                </DataTable>
                <span>There are {crypto.length} items in table</span>
            </div>

        </div>
    );
}

export default DataTableCrypto