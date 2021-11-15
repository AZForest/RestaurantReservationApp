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
        setReservationsNotFound(false);
        setReservations([])
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

    let reservationsDiv = reservations ? (
        <div className="my-3">
            {reservations.map(res => {
                return (
                    <div className="card p-4 my-2" key={res.reservation_id}>
                        <p className="pb-0 mb-0">Reservation for: </p>
                        <h4 className="py-0 mb-3 mt-2">{res.first_name} {res.last_name}</h4>
                        <p>Party of {res.people} - Reservation #{res.reservation_id}</p>
                        <p data-reservation-id-status={res.reservation_id}>Status: {res.status[0].toUpperCase() + res.status.slice(1)}</p>
                        <p>Time: {res.reservation_time}</p>
                        <p>Phone: {res.mobile_number}</p>
                        <div className="text-center">
                            {res.status === "booked" ? 
                            <Link type="button" className="btn btn-warning mr-1" to={`/reservations/${res.reservation_id}/seat`}>Seat</Link>
                            : ""}
                            <Link className="btn btn-secondary mx-1" to={`/reservations/${res.reservation_id}/edit`}>Edit</Link>
                            <button data-reservation-id-cancel={res.reservation_id}
                                    className="btn btn-danger ml-1" 
                                    onClick={() => cancelHandler(res.reservation_id)}>Cancel</button>
                        </div>
                    </div>
                )
            })}
        </div>
    ) : ""
    let notFoundDiv = (
        <div className="text-center mt-4">
            <h5>No reservations found</h5>
        </div>
    )

    return (
        <div>
            <h3 className="text-center my-4">Search By Phone Number</h3>
            <form onSubmit={(e) => findReservations(e)} >
                <div style={{display: "flex"}}>
                <input className="mr-3 form-control"
                   type="text"
                   name="mobile_number" 
                   placeholder="Enter a customer's mobile number"
                   onChange={(e) => updateNumber(e)}
                   required/>
                <button type="submit" className="btn btn-warning">Find</button>
                </div>
            </form>
            {reservationsDiv}
            {reservationsNotFound ? notFoundDiv : ""}
        </div>
    )
}

export default SearchByPhoneNumber;