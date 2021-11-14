import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import FormComponent from '../layout/FormComponent';
import { formatAsDate, formatAsTime } from '../utils/date-time';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;


function EditReservation() {

    const { reservationId } = useParams();
    const [reservation, setReservation] = useState(null);

    const loadReservation = () => {
        axios.get(`${BASE_URL}/reservations/${reservationId}`)
        .then(res => {
            res.data.data.reservation_date = formatAsDate(res.data.data.reservation_date);
            res.data.data.reservation_time = formatAsTime(res.data.data.reservation_time);
            setReservation(res.data.data);
        })
        .catch(err => {
            console.log(err);
        })
    }

    useEffect(loadReservation, []);

    return (
        <div>
            <h3>Edit Reservation</h3>
            {/*JSON.stringify(reservation)*/}
            {reservation ? <FormComponent reservation={reservation} /> : ""}

        </div>
    )
}

export default EditReservation;