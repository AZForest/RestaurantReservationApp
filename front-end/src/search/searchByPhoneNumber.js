import React, { useState } from 'react';
import { listReservations } from '../utils/api';

function SearchByPhoneNumber() {

    const [reservations, setReservations] = useState([]);
    const [mobileNumber, setMobileNumber] = useState(null);
    const [reservationsNotFound, setReservationsNotFound] = useState(false);

    const updateNumber = (e) => {
        setMobileNumber(e.target.value);
    }

    const findReservations = (e) => {
        e.preventDefault();
        const abortController = new AbortController();
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
        return () => abortController.abort();
    }

    let reservationsDiv = (
        <div>
            {reservations.map(reservation => {
                return (
                    <ul key={reservation.reservation_id}>
                        <li>{reservation.first_name}</li>
                        <li>{reservation.last_name}</li>
                        <li>{reservation.mobile_number}</li>
                        <li>{reservation.status}</li>
                        <li>{reservation.people}</li>
                    </ul>
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