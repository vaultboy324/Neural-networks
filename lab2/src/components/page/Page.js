import React from 'react';

import Table from "../based_components/table/Table";

import './Page.css';

const config = require("../../../config/config");
const constants = require("../../../const/const")

class Page extends React.Component {
    state = {
        colorTable: [["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"],
                ["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"]],
        tables: [],
    };

    constructor(props) {
        super(props);
    };

    addElement(e){
        e.preventDefault();

        let tables = this.state.tables;
        let colorTable = JSON.parse(JSON.stringify(this.state.colorTable));
        tables.push(colorTable);
        this.setState({tables});
    };

    deleteElement(e){
      e.preventDefault();

      let tables = this.state.tables;
      tables.pop();
      this.setState({tables});
    };

    addColumn(e){
        e.preventDefault();

        let tables = this.state.tables;

        tables.forEach((table, tableNum)=>{
           table.forEach((row, index)=>{
              row.push("white");
           });
        });

        this.setState({tables});
    };

    deleteColumn(e){
        e.preventDefault();

        let tables = this.state.tables;

        tables.forEach((table, tableNum)=>{
           table.forEach((row, index)=>{
             row.pop();
           });
        });

        this.setState({tables });
    };

    addRow(e){
        e.preventDefault();

        let tables = this.state.tables;
        if(tables[0].length === 0){
            tables.forEach((table, tableNum)=>{
               table.push(["white"]);
            });
            this.setState({tables});
            return;
        }

        tables.forEach((table, tableNum)=>{
            let newRow = JSON.parse(JSON.stringify(table[table.length - 1]));
            table.push(newRow);
        });

        this.setState({tables});
    };

    deleteRow(e){
      e.preventDefault();

      let tables = this.state.tables;
      tables.forEach((table, tableNum)=>{
         table.pop();
      });

      this.setState({tables});
    };

    changeColor = (event) => {
        let aParameters = this.__parseId(event.target.id);

        let number = parseInt(aParameters[0]);
        let row = parseInt(aParameters[1]);
        let column = parseInt(aParameters[2]);

        let tables = this.state.tables;
        let currentTable = tables[number];

        let element = currentTable[row][column];
        if(element === "black"){
            element = "white";
        } else {
            element = "black";
        }
        currentTable[row][column] = element;

        tables[number] = currentTable;

        this.setState({tables});

    };

    async learn(e){
      let body = this.__getDataForRequest();
      const jsonString = JSON.stringify(body);

      const response = await fetch(`${config.server}/learn`,{
         method:'POST',
         headers: {
             'Accept': 'application/json',
             'Content-type': 'application/json',
             'Content-string': jsonString.length
         },
          body: jsonString
      });

      return await response.json();
    };

    __getDataForRequest() {
        let coloredTables = this.state.tables;

        let tables = [];
        coloredTables.forEach((table, tableNum)=>{
           tables.push(this.__getFlagsByColors(table));
        });

        return ({
            tables
        })
    }


    __getFlagsByColors(colorsMatr) {
        let flags = [];

        colorsMatr.forEach((row) => {
            let flagsRow = [];
            row.forEach((color) => {
                if (color === 'black') {
                    flagsRow.push(1);
                } else {
                    flagsRow.push(0);
                }
            });
            flags.push(flagsRow);
        });

        return flags;
    }

    __parseId = (sId) => {
        return sId.split('|', 3);
    };

    changeActivation = (e) => {
        e.preventDefault();
        this.setState({
                activation: e.currentTarget.value
            }
        )
    };

    render() {
        return (
            <div className="App">
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.addElement.bind(this)}>Добавить элемент</button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.deleteElement.bind(this)}>Удалить элемент</button>
                </div>
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.addColumn.bind(this)}>Добавить столбец</button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.deleteColumn.bind(this)}>Удалить столбец</button>
                </div>
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.addRow.bind(this)}>Добавить строку</button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.deleteRow.bind(this)}>Удалить строку</button>
                </div>
                <div>
                    {
                        this.state.tables.map((table, tableNum)=>{
                            return(<Table num={tableNum} rows={table} onClick={this.changeColor}/>)
                        })
                    }
                </div>
                <div>
                    <button className="btn btn-outline-primary myBtn" onClick={this.learn.bind(this)}>Обучить</button>
                    <button className="btn btn-outline-primary myBtn">Исследовать</button>
                </div>
            </div>
        )
    }
}

export default Page;