import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;


function EditReservation() {

    const { reservationId } = useParams();
    const [reservation, setReservation] = useState({});

    

    const loadReservation = () => {
        axios.get(`${BASE_URL}/reservations/${reservationId}`)
        .then(res => {
            console.log(res);
            setReservation(res.data.data);
        })
        .catch(err => {
            console.log(err);
        })
    }

    useEffect(loadReservation, []);

    return (
        <div>
            I'm the edit page
            <h3>Edit Reservation</h3>
            {JSON.stringify(reservation)}
        </div>
    )
}

export default EditReservation;