import React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import FormComponent from '../layout/FormComponent';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;

function NewReservation(props) {
    const history = useHistory();

    let formStructure = {
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

        const targetDate = new Date(date);
        const errors = [];
        //Checks if Day is Tuesday
        if (targetDate.getDay() === 1) {
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
            let newFormData = { ...formData };
            newFormData.status = 'booked';
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
        }
    }

    return (
        <div>
            {props.text}
            <h2>Make a Reservation</h2>
            <FormComponent />
        </div>
    )
}

export default NewReservation;