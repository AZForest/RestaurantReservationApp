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
            setTables(avTables);
            if (tables.length > 1) setSelectedValue(tables[0]);
        })
        .catch(err => console.log(err));

        axios.get(`${BASE_URL}/reservations/${reservationId}`)
        .then(res => {
            console.log(res.data.data.status)
            setReservation(res.data.data)
        })
        .catch(err => console.log(err));
    }, [])

    const changeSelect = (e) => {
        const tableName = e.target.value;
        const foundTable = tables.find(table => table.table_name === tableName);
        setSelectedValue(foundTable);
    }

    const validateSize = () => {
        return selectedValue.capacity >= reservation.people;
    }

    /*const submitHandler = (e) => {
        e.preventDefault();
        if (validateSize()) {
            axios.put(`${BASE_URL}/tables/${selectedValue.table_id}/seat/`, { data: { reservation_id: reservation.reservation_id } })
            .then(res => {
                axios.put(`${BASE_URL}/reservations/${reservation.reservation_id}/status`, { data: { status: "seated" }})
                .then(res => {
                    history.push("/")
                })
                .catch(err => {
                    console.log(err);
                })
            })
            .catch(err => console.log(err));
        } else {
            const error = new Error("Party size cannot exceed table capacity");
            setError(error);
        }
    }*/

    async function asyncSubmit(e) {
        e.preventDefault();
        if (validateSize()) {
            try {
                //const [res1, res2] = 
                await Promise.all([
                    axios.put(`${BASE_URL}/tables/${selectedValue.table_id}/seat/`, { data: { reservation_id: reservation.reservation_id } }),
                    axios.put(`${BASE_URL}/reservations/${reservation.reservation_id}/status`, { data: { status: "seated" }})
                ])
                history.push("/")
            } catch(err) {
                console.log(err);
            }
        } else {
            const error = new Error("Party size cannot exceed table capacity");
            setError(error);
        }
    }

    let reservationDiv = reservation ? (
        <div className="card p-3 mt-3 mb-3">
            <h4 className="py-0 mb-3 mt-2">{reservation.first_name} {reservation.last_name}</h4>
            <p>Party of <span className="text-dark" style={{fontWeight: "700", fontSize: "18px"}}>{reservation.people}</span> - Reservation #{reservation.reservation_id}</p>
            {/* reservation ? <p data-reservation-id-status={reservation.reservation_id}>Status: {reservation.status[0].toUpperCase() + reservation.status.slice(1)}</p> : ""*/}
            <p>Time: {reservation.reservation_time}</p>
            <p className="mb-0">Phone: {reservation.mobile_number}</p>
        </div>
    ) : ""

    //style={{fontStyle: "italic"}}
    return (
        <div>
            <h3 className="text-center mt-3 mb-2">Seat reservation for: </h3>
            {reservation ? reservationDiv : ""}
            <h5 className="text-center mt-4">Select Table: </h5>
            <ErrorAlert error={error}/>
            <form onSubmit={(e) => asyncSubmit(e)}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <select name="table_id"
                        style={{width: "200px"}}
                        className="m-2 p-1 mx-auto" 
                        onChange={(e) => changeSelect(e)}>
                        {tables.map(table => {
                                return (
                                <option key={table.table_id} value={tables ? table.table_name: ""}>{table.table_name} - {table.capacity}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="text-center">(Name - Capacity)</div>
                <br />
                <div className="text-center">
                    <button type="submit" className="btn btn-warning mr-1">Submit</button>
                    <button onClick={() => history.goBack()} className="btn btn-secondary ml-1">Cancel</button>
                </div>
            </form>
            
        </div>
    )
}

export default SeatReservation;