import React, { useState } from 'react';
import { listReservations } from '../utils/api';
import { Link } from 'react-router-dom';
import axios from 'axios';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;


function SearchByPhoneNumber() {

    const [reservations, setReservations] = useState([]);
    const [mobileNumber, setMobileNumber] = useState(null);
    const [reservationsNotFound, setReservationsNotFound] = useState(false);

    const updateNumber = (e) => {
        setMobileNumber(e.target.value);
    }

    function findR() {
        const abortController = new AbortController();
        let mobile_number = mobileNumber;
        listReservations({ mobile_number }, abortController.signal)
            .then((res) => {
                if (res.length > 0) {
                    setReservations(res);
                } else {
                    setReservationsNotFound(true);
                }
            })
            .catch(err => console.log(err));
        return () => abortController.abort();
    }

    const findReservations = (e) => {
        e.preventDefault();
        findR();
        /*const abortController = new AbortController();
        setReservationsNotFound(false);
        let mobile_number = mobileNumber;
        listReservations({ mobile_number }, abortController.signal)
            .then((res) => {
                if (res.length > 0) {
                    setReservations(res);
                } else {
                    setReservationsNotFound(true);
                }
            })
            .catch(err => console.log(err));
        return () => abortController.abort();*/
    }

    const cancelHandler = (reservationId) => {
        if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
            axios.put(`${BASE_URL}/reservations/${reservationId}/status`, { data: { status: "cancelled" } })
            .then(res => {
                findR();
            })
            .catch(err => {
                console.log(err);
            })
        }
    }

    let reservationsDiv = (
        <div>
            {reservations.map(reservation => {
                return (
                    <div style={{backgroundColor: "pink", display: "flex"}}>
                        <ul key={reservation.reservation_id}>
                            <li>{reservation.first_name}</li>
                            <li>{reservation.last_name}</li>
                            <li>{reservation.mobile_number}</li>
                            <li>{reservation.status}</li>
                            <li>{reservation.people}</li>
                        </ul>
                        <div>
                            <Link to={`/reservations/${reservation.reservation_id}/edit`}>Edit</Link>
                            <button onClick={() => cancelHandler(reservation.reservation_id)}>Cancel</button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
    let notFoundDiv = (
        <div>
            <p>No reservations found</p>
        </div>
    )

    return (
        <div>
            <h3>Search By Phone Number</h3>
            <form onSubmit={(e) => findReservations(e)}>
                <input className="m-2"
                   type="text"
                   name="mobile_number" 
                   placeholder="Enter a customer's mobile number"
                   onChange={(e) => updateNumber(e)}
                   required/>
                <button type="submit">Find</button>
            </form>
            {reservationsDiv}
            {reservationsNotFound ? notFoundDiv : ""}
        </div>
    )
}

export default SearchByPhoneNumber;