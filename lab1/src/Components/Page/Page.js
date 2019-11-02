import React from 'react';

import ColorsTable from "../ColorsTable/ColorsTable";

import './Page.css'

const config = require("../../../config/config");

class Page extends React.Component{
    state = {
        firstMatr:
            [["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"],
                ["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"]],

    };

    render() {
        <div className="Panel">
            <ColorsTable matrix={this.state.firstMatr}/>
        </div>
    }
}