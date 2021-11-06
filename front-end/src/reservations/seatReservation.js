import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../layout/ErrorAlert';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;

function SeatReservation() {
    
    const [tables, setTables] = useState([]);
    const [reservation, setReservation] = useState({});
    const [selectedValue, setSelectedValue] = useState({});
    const [error, setError] = useState(null);
    const history = useHistory();
    const { reservationId } = useParams();

    useEffect(() => {
        axios.get(`${BASE_URL}/tables`)
        .then(res => {
            const avTables = res.data.data.filter(table => {
                return table.reservation_id === null;
            })
            //console.log(avTables);
            setTables(avTables);
            if (tables.length > 1) setSelectedValue(tables[0]);
        })
        .catch(err => console.log(err));

        axios.get(`${BASE_URL}/reservations/${reservationId}`)
        .then(res => {
            setReservation(res.data.data)
        })
        .catch(err => console.log(err));
    }, [])

    const changeSelect = (e) => {
        //console.log(e.target.value);
        const tableName = e.target.value;
        const foundTable = tables.find(table => table.table_name === tableName);
        //console.log(foundTable)
        setSelectedValue(foundTable);
        console.log(selectedValue);
    }

    const validateSize = () => {
        return selectedValue.capacity >= reservation.people;
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (validateSize()) {
            axios.put(`${BASE_URL}/tables/${selectedValue.table_id}/seat/`, { data: { reservation_id: reservation.reservation_id } })
            .then(res => {
                //console.log(res);
                history.push("/");
                /*const filteredTables = tables.filter(table => table.table_id !== selectedValue.table_id);
                setTables(filteredTables);*/
            })
            .catch(err => console.log(err));
        } else {
            const error = new Error("Party size cannot exceed table capacity");
            setError(error);
        }

    }

    return (
        <div>
            <h4>Seat reservation for: Reservation {reservationId}</h4>
            <h4>Select Table: </h4>
            <ErrorAlert error={error}/>
            <form onSubmit={(e) => submitHandler(e)}>
                <select name="table_id" className="m-3" onChange={(e) => changeSelect(e)}>
                    {tables.map(table => {
                            return (
                            <option key={table.table_id} value={tables ? table.table_name: ""}>{table.table_name} - {table.capacity}</option>
                        )
                    })}
                </select>
                <br />
                <button type="submit">Submit</button>
                <button onClick={() => history.goBack()}>Cancel</button>
            </form>
            
        </div>
    )
}

export default SeatReservation;