import React, { useEffect } from "react";
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ErrorAlert from '../layout/ErrorAlert';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;

function FormComponent({ reservation }) {

    const history = useHistory();

    let formStructure = reservation ? {
        reservation_id: reservation.reservation_id,
        first_name: reservation.first_name,
        last_name: reservation.last_name,
        mobile_number: reservation.mobile_number,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        people: reservation.people,
        status: reservation.status
    } : {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: 1,
        status: "booked"
    }

    const [formData, setFormData] = useState(formStructure);
    const [error, setError] = useState(null);

    useEffect(() => {
        //console.log(reservation)
    }, [])

    function updateData(e, type) {
        if (type === "first_name") {
            let updatedFormData = {
                ...formData,
                first_name: e.target.value
            }
            setFormData(updatedFormData);
        } else if (type === "last_name") {        
            let updatedFormData = {
                ...formData,
                last_name: e.target.value
            }
            setFormData(updatedFormData);
        } else if (type === "mobile_number") {
            let updatedFormData = {
                ...formData,
                mobile_number: e.target.value
            }
            setFormData(updatedFormData);
        } else if (type === "reservation_date") {
            let updatedFormData = {
                ...formData,
                reservation_date: e.target.value
            }
            setFormData(updatedFormData);
        } else if (type === "reservation_time") {
            let updatedFormData = {
                ...formData,
                reservation_time: e.target.value
            }
            setFormData(updatedFormData);
        } else if (type === "people") {
            let updatedFormData = {
                ...formData,
                people: parseInt(e.target.value)
            }
            setFormData(updatedFormData);
        } else {
            console.log("Error");
        }
    }

    function validateInput() {
        const date = formData.reservation_date;
        const time = formData.reservation_time;
        const dateArr = date.split("-");
        const timeArr = time.split(":");
        console.log(dateArr);
        console.log(timeArr)

        const targetDate = new Date(dateArr[0], dateArr[1], dateArr[2], timeArr[0], timeArr[1], 0);
        const targetDay = new Date(date);
        const errors = [];
        //Checks if Day is Tuesday
        console.log("Day is " + targetDay.getDay())
        if (targetDay.getDay() === 1) {
            const dateError = new Error();
            dateError.message = "We are not open Tuesdays."
            errors.push(dateError);
        }
        //Check if reservation is in the past
        if (Date.now() >= targetDate.getTime()) {
            const timeError = new Error("Reservations must be in the future.")
            errors.push(timeError);

        }
        //Checks if Res Time is between 10:30am - 9:30pm
        let timeArray = time.split(":");
        let timeToInt = parseInt(timeArray.reduce((acc, cur) => {
            return acc + cur;
          }, ""));
        let openingTime = 1030;
        let closingTime = 2130;
        if (timeToInt < openingTime || timeToInt > closingTime) {
            const validTimeError = new Error("Reservation must be between 10:30am and 9:30pm.")
            errors.push(validTimeError);
        }
        if (errors.length > 0) {
            setError(errors);
            //return false;
        }
        return true;
    }

    function handleSubmit(e) {
        e.preventDefault(); 
        const date = formData.reservation_date;
        if (validateInput()) {
            if (!reservation) {
                //Creates new reservation
                axios.post(`${BASE_URL}/reservations`, { data: formData } )
                .then(res => {
                    history.push({
                        pathname: `/dashboard`,
                        search: `?date=${date}`
                    })
                })
                .catch(err => {
                    if (err.response && err.response.data) {
                        console.log(err.response);
                        console.log(err.response.data.error) // some reason error message
                    }
                    setError(err)
                });
            } else {
                //Updates reservation
                axios.put(`${BASE_URL}/reservations/${reservation.reservation_id}`, { data: formData })
                .then(res => {
                    history.push({
                        pathname: `/dashboard`,
                        search: `?date=${formData.reservation_date}`
                    });
                })
                .catch(err => {
                    console.log(err);
                    setError(err);
                })
            }
            
        }
    }

    return (
        <div>
            <ErrorAlert error={error} />
            <form onSubmit={(event) => handleSubmit(event)}>
                <label htmlFor="first_name" style={{color: "green"}}>
                    First Name:
                    <input value={formData["first_name"]}
                           type="text"
                           id="first_name" 
                           name="first_name" 
                           onChange={(e, type = "first_name") => updateData(e, type)}
                           required />
                </label>
                <br />
                <label htmlFor="last_name" style={{color: "green"}}>
                    Last Name:
                    <input value={formData["last_name"]}
                           type="text"
                           id="last_name" 
                           name="last_name"
                           onChange={(e, type = "last_name") => updateData(e, type)}
                           required />
                </label>
                <br />
                {/*pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"*/}
                <label htmlFor="mobile_number" style={{color: "green"}}>
                    Mobile Number:
                    <input value={formData["mobile_number"]}
                           type="text"
                           placeholder="888-888-8888"
                           id="mobile_number" 
                           name="mobile_number"
                           onChange={(e, type = "mobile_number") => updateData(e, type)}
                           required />
                </label>
                <br />
                <label htmlFor="reservation_date" style={{color: "green"}}>
                    Reservation Date:
                    <input value={formData["reservation_date"]}
                           type="date"
                           id="reservation_date" 
                           name="reservation_date"
                           onChange={(e, type = "reservation_date") => updateData(e, type)}
                           required />
                </label>
                <br />
                <label htmlFor="reservation_time" style={{color: "green"}}>
                    Reservation Time:
                    <input value={formData["reservation_time"]}
                           type="time"
                           id="reservation_time" 
                           name="reservation_time"
                           onChange={(e, type = "reservation_time") => updateData(e, type)}
                           required />
                </label>
                <br />
                <label htmlFor="people" style={{color: "green"}}>
                    Number of People in Party:
                    <input value={formData["people"]}
                           type="number"
                           id="people" 
                           name="people"
                           min="1"
                           onChange={(e, type = "people") => updateData(e, type)}
                           required />
                </label>
                <br />
                <button type="submit">Submit</button>
                <button onClick={() => history.goBack()}>Cancel</button>
            </form>
        </div>
    )
}

export default FormComponent;