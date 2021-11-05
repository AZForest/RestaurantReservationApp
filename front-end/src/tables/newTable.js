import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

function NewTable(props) {

    const formStructure = {
        table_name: "",
        capacity: 1
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
        console.log(formData);
    }

    return (
        <div>
            <h2>New Table</h2>
            <br />
            <form>
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
                    Capcity:
                    <input value={formData["capacity"]}
                           name="capacity"
                           id="capacity"
                           type="number"
                           min="1"
                           onChange={(e, field = "capcity") => updateForm(e, field)}
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