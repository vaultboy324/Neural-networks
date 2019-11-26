import React from "react";

import './Table.css'

function Table(oParams){
    return (
        <table className="table table-bordered table-responsive-md text-center">
            {/*<thead>*/}
            {/*<tr>*/}
            {/*    {*/}
            {/*        oParams.columns.map((item, index)=> (*/}
            {/*            <th scope="col">{item}</th>*/}
            {/*        ))*/}
            {/*    }*/}
            {/*</tr>*/}
            {/*</thead>*/}
            {
                oParams.rows.map((row, rowNum) => (
                    <tbody>
                    <tr>
                        {
                            row.map((item, index)=>(
                                <td><input id={oParams.num +'|' + rowNum.toString() + '|' + index.toString()} className="form-control" style={{backgroundColor:item}} onClick={oParams.onClick} contentEditable="false" readOnly="readOnly"/></td>
                            ))
                        }
                    </tr>
                    </tbody>
                ))
            }
        </table>
    )
}

export default Table;