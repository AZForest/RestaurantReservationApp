import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

function SeatReservation() {
    
    let sampleTableData = [
        { 
          table_id: 1,
          table_name: "qwer",
          capacity: 4,
          reservation_id: 9
        },
        {
          table_id: 2,
          table_name: "asdf",
          capacity: 3
        },
        {
          table_id: 3,
          table_name: "zxcv",
          capacity: 5
        }
    ]
    const [tables, setTables] = useState(sampleTableData);
    const history = useHistory();
    const { reservationId } = useParams();

    return (
        <div>
            <h4>Seat reservation for: Reservation {reservationId}</h4>
            <h4>Select Table: </h4>
            <select name="table_id" className="m-3">
                {tables.map(table => {
                    return (
                        <option>{table.table_name} - {table.capacity}</option>
                    )
                })}
            </select>
            <br />
            <button type="submit">Submit</button>
            <button onClick={() => history.goBack()}>Cancel</button>
        </div>
    )
}

export default SeatReservation;