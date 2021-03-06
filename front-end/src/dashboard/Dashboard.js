import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { Link } from 'react-router-dom';
import { listReservations } from "../utils/api";
import { previous, next } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";
import axios from 'axios';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ curDate }) {

  const location = useLocation();
  const initialDate = location.search ? location.search.slice(6) : curDate;

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [date, setDate] = useState(initialDate);
  const history = useHistory();
  
  useEffect(loadDashboard, [date, tables]);
  useEffect(loadTables, []);


  function loadTables() {
    axios.get(`${BASE_URL}/tables`)
    .then(res => {
      setTables(res.data.data);
    })
    .catch(err => console.log(err))
  }

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then((res) => {
        const filteredReservations = res.filter(resev => resev.status !== "cancelled")
        setReservations(filteredReservations)
      })
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  function alterQuery(val) {
    if (val === "prev") {
      const prevDate = previous(date);
      setDate(prevDate);
      history.push({
        pathname: `/dashboard`,
        search: `?date=${prevDate}`
      })
    } else if (val === "next") {
      const nextDate = next(date);
      setDate(nextDate);
      history.push({
        pathname: `/dashboard`,
        search: `?date=${nextDate}`
      })
    } else {
      location.search = ``;
      setDate(curDate);
    }
  }

  function clickFinish(table) {
    if (window.confirm("Is this table ready to seat new guests?")) {
      asyncDelete(table);
    }
  }

  //Delete function which uses Promise chaining instead of async/await
  /*function deleteHandler(table) {
    axios.delete(`${BASE_URL}/tables/${table.table_id}/seat`)
    .then(res => {
      axios.put(`${BASE_URL}/reservations/${table.reservation_id}/status`, { data: { status: "finished" } })
      .then(res => {
        loadTables();
      })
      .catch(err => {
        console.log(err);
      })
      
    })
    .catch(err => {
      console.log(err);
    })
  }*/

  async function asyncDelete(table) {
    try {
      await Promise.all([
        axios.delete(`${BASE_URL}/tables/${table.table_id}/seat`),
        axios.put(`${BASE_URL}/reservations/${table.reservation_id}/status`, { data: { status: "finished" } })
      ])
      loadTables();
    } catch (err) {
      console.log(err);
    }
  }

  const cancelHandler = (reservationId) => {
    if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
        axios.put(`${BASE_URL}/reservations/${reservationId}/status`, { data: { status: "cancelled" } })
        .then(res => {
            loadDashboard();
        })
        .catch(err => {
          console.log(err);
        })
    }
  }

  let reservationsDiv = ( 
    <div>
      {reservations.map(res => {
        return (
          res.status !== "finished" ?
          <div key={res.reservation_id} className="card p-4 my-2">
            <div>
              <p className="pb-0 mb-0">Reservation for: </p>
              <h4 className="py-0 mb-3 mt-2">{res.first_name} {res.last_name}</h4>
              <p>Party of {res.people} - Reservation #{res.reservation_id}</p>
              <p data-reservation-id-status={res.reservation_id}>Status: {res.status[0].toUpperCase() + res.status.slice(1)}</p>
              <p>Time: {res.reservation_time}</p>
              <p>Phone: {res.mobile_number}</p>
              {res.status === "booked" ? 
              <Link type="button" className="btn btn-warning" to={`/reservations/${res.reservation_id}/seat`}>Seat</Link>
              : ""}
              <Link type="button" className="btn btn-secondary mx-2" to={`/reservations/${res.reservation_id}/edit`}>Edit</Link>
              <button type="button" className="btn btn-danger" data-reservation-id-cancel={res.reservation_id} onClick={() => cancelHandler(res.reservation_id)}>Cancel</button>
            </div>
          </div> : ""
        )} )}
    </div>
  )

  let tablesDiv = (
    <div>
      <h3>Tables</h3>
      {tables.map(table => {
        return (
          <div className="card m-3 p-2"  key={table.table_id}>
            <p >Table: <span style={{fontWeight: "bold"}}>{table.table_name}</span></p>
            <p>Capacity: {table.capacity}</p>
            <p>Status: <span data-table-id-status={table.table_id} style={{fontWeight: "700"}}>
              {table.reservation_id ? <span className="text-danger">Occupied <span className="text-danger" style={{fontWeight: "700"}}>(Reservation #{table.reservation_id})</span></span> : <span className="text-success">Free</span>}</span>
            </p>
            {table.reservation_id ?
            <button data-table-id-finish={table.table_id} type="button" className="btn btn-warning" onClick={() => clickFinish(table)}>Finish</button>
            : ""}
          </div>
        )
      })}
    </div>
  )

  return (
    <main>
      <h1 className="text-center my-4">Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h5 className="text-center mb-0 mx-auto">Reservations for date: {date}</h5>
      </div>
      <ErrorAlert error={reservationsError} />
      <div className="text-center my-4">
        <button type="button" className="btn btn-warning" onClick={() => alterQuery("prev")}>Previous</button>
        <button type="button" className="btn btn-warning mx-2" onClick={() => alterQuery()}>Today</button>
        <button type="button" className="btn btn-warning" onClick={() => alterQuery("next")}>Next</button>
      </div>
      {reservations ? reservationsDiv : ""}
      <hr />
      {tables ? tablesDiv : ""}
    </main>
  );
}

export default Dashboard;
