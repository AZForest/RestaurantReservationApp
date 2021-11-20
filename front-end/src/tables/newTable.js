import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
const { REACT_APP_API_BASE_URL: BASE_URL } = process.env;

function NewTable(props) {

    const formStructure = {
        table_name: "",
        capacity: null
    }

    const [formData, setFormData] = useState(formStructure);
    const history = useHistory();
    

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
            <h2 className="text-center mt-4">New Table</h2>
            <br />
            <form onSubmit={(e) => submitHandler(e)}>
                <div className="mb-3">
                    <label htmlFor="table_name" className="form-label">Table Name</label>
                    <input value={formData["table_name"]}
                           name="table_name"
                           id="table_name" 
                           type="text"
                           minLength="2"
                           onChange={(e, field = "table_name") => updateForm(e, field)}
                           required
                           className="form-control" 
                           placeholder="Red Table" />
                </div>
                <div className="mb-3">
                    <label htmlFor="capacity" className="form-label">Capacity</label>
                    <input value={formData["capacity"] === null ? 1 : formData["capacity"]}
                           name="capacity"
                           id="capacity"
                           type="number"
                           min="1"
                           onChange={(e, field = "capacity") => updateForm(e, field)}
                           required
                           className="form-control" 
                           placeholder="3" />
                </div>
                <div className="text-center">
                    <button type="submit" className="btn btn-warning mx-1">Submit</button>
                    <button type="button" className="btn btn-secondary mx-1" onClick={() => history.goBack()}>Cancel</button>
                </div> 
            </form>
        </div>
    )
}

export default NewTable;