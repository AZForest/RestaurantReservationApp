import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

function NewTable(props) {

    const formStructure = {
        table_name: "",
        capacity: null
    }

    const [formData, setFormData] = useState(formStructure);
    const history = useHistory();
    const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;

    function updateForm(e, field) {
        if (field === "table_name") {
            const newFormData = {
                ...formData,
                table_name: e.target.value
            }
            setFormData(newFormData);
        } else {
            const newFormData = {
                ...formData,
                capacity: e.target.value
            }
            setFormData(newFormData);
        }
    }

    function submitHandler(e) {
        e.preventDefault();
        if (formData.capacity !== null) {
            
            axios.post(`${BASE_URL}/tables`, { data: { "table_name": formData["table_name"], "capacity": parseInt(formData["capacity"]) }})
            .then((res) => {
                history.push("/dashboard");
            })
            .catch(err => console.log(err));
        }
    }

    return (
        <div>
            <h2>New Table</h2>
            <br />
            <form onSubmit={(e) => submitHandler(e)}>
                <label htmlFor="table_name">
                    Table Name: 
                    <input value={formData["table_name"]}
                           name="table_name"
                           id="table_name" 
                           type="text"
                           minLength="2"
                           onChange={(e, field = "table_name") => updateForm(e, field)}
                           required />
                </label>
                <br />
                <label htmlFor="capacity">
                    Capacity:
                    <input value={formData["capacity"]}
                           name="capacity"
                           id="capacity"
                           type="number"
                           min="1"
                           onChange={(e, field = "capacity") => updateForm(e, field)}
                           required />
                </label>
                <br />
                <button type="submit">Submit</button>
                <button onClick={() => history.goBack()}>Cancel</button>
            </form>
        </div>
    )
}

export default NewTable;