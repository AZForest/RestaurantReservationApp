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
  const x = location.search ? location.search.slice(6) : curDate;

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [date, setDate] = useState(x);
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
    //console.log(date);
    //console.log(location);
    //console.log(location.search);
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then((res) => {
        //console.log(res)
        setReservations(res)
      })
      .catch(setReservationsError);
    return () => abortController.abort();
    //}
  }

  function alterQuery(val) {
    if (val === "prev") {
      const prevDate = previous(date);
      //location.search = `?date=${prevDate}`;
      setDate(prevDate);
      history.push({
        pathname: `/dashboard`,
        search: `?date=${prevDate}`
      })
    } else if (val === "next") {
      const nextDate = next(date);
      //location.search = `?date=${nextDate}`;
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

  function deleteHandler(table) {
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
  }

  async function asyncDelete(table) {
    try {
      const [res1, res2] = await Promise.all([
        axios.delete(`${BASE_URL}/tables/${table.table_id}/seat`),
        axios.put(`${BASE_URL}/reservations/${table.reservation_id}/status`, { data: { status: "finished" } })
      ])
      loadTables();
    } catch (err) {
      console.log(err);
    }
  }

  let tablesDiv = (
    <div>
      <h4>Tables</h4>
      {tables.map(table => {
        return (
          <div className="m-3" style={{backgroundColor: "lightblue"}} key={table.table_id}>
            <p>Table Name: {table.table_name}</p>
            <p>Capacity: {table.capacity}</p>
            {table.reservation_id ? 
            <p data-table-id-status={table.table_id}>Occupied</p>
            : <p data-table-id-status={table.table_id}>Free</p>}
            {table.reservation_id ?
            <button data-table-id-finish={table.table_id} onClick={() => clickFinish(table)}>Finish</button>
            : ""}
          </div>
        )
      })}
    </div>
  )

  //res.reservation_status[0].toUpperCase() + res.reservation_status.slice(1)
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      {/*JSON.stringify(reservations)*/}
      {reservations ? reservations.map(res => {
        return (
          <div key={res.reservation_id}>
            {res.reservation_status !== "finished" ?
            <div key={Math.random()} style={{backgroundColor: "gainsboro"}}>
              <p>Reservation id: {res.reservation_id}</p>
              <p data-reservation-id-status={res.reservation_id}>Reservation status: {res.status}</p>
              <p>First name: {res.first_name}</p>
              <p>Last name: {res.last_name}</p>
              <p>Phone: {res.mobile_number}</p>
              <p>Time: {res.reservation_time}</p>
              <p>People: {res.people}</p>
              {res.reservation_status === "booked" ? 
              <Link to={`/reservations/${res.reservation_id}/seat`}>Seat</Link>
              : ""}
              <br/>
            </div> : ""}
          </div>
        )
      }) : ""}
      <div className="m-3">
        <button onClick={() => alterQuery("prev")}>Previous</button>
        {/*<button onClick={() => setDate(previous(date))}>Previous</button>*/}
        <button onClick={() => alterQuery()}>Today</button>
        <button onClick={() => alterQuery("next")}>Next</button>
      </div>
      {tables ? tablesDiv : ""}
    </main>
  );
}

export default Dashboard;
