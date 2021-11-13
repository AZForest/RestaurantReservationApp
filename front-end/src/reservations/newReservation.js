import React from 'react';
import FormComponent from '../layout/FormComponent';

function NewReservation(props) {

    return (
        <div>
            {props.text}
            <h2>Make a Reservation</h2>
            <FormComponent />
        </div>
    )
}

export default NewReservation;