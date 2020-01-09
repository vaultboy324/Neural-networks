import React from 'react';

import Table from "../based_components/table/Table";

import './Page.css';

const config = require("../../../config/config");
const constants = require("../../../const/const")

class Page extends React.Component {
    state = {
        colorTable: [["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],
            ["white", "white", "white", "white", "white", "white", "white", "white", "white", "white"],],
        tables: [],
        activation: constants.activations.bipolar,
        // learnResults: {
        //     tables: [],
        //     arrays: [],
        //     neurons: [],
        //     iterations: 0
        // },
        researchResults: {
            equals: [],
            table: []
        }
    };

    constructor(props) {
        super(props);
    };

    addElement(e) {
        // e.preventDefault();

        let tables = this.state.tables;
        let colorTable = JSON.parse(JSON.stringify(this.state.colorTable));
        tables.push(colorTable);
        this.setState({tables});
    };

    deleteElement(e) {
        e.preventDefault();

        let tables = this.state.tables;
        tables.pop();
        this.setState({tables});
    };

    addColumn(e) {
        e.preventDefault();

        let tables = this.state.tables;

        tables.forEach((table, tableNum) => {
            table.forEach((row, index) => {
                row.push("white");
            });
        });

        this.setState({tables});
    };

    deleteColumn(e) {
        e.preventDefault();

        let tables = this.state.tables;

        tables.forEach((table, tableNum) => {
            table.forEach((row, index) => {
                row.pop();
            });
        });

        this.setState({tables});
    };

    addRow(e) {
        e.preventDefault();

        let tables = this.state.tables;
        if (tables[0].length === 0) {
            tables.forEach((table, tableNum) => {
                table.push(["white"]);
            });
            this.setState({tables});
            return;
        }

        tables.forEach((table, tableNum) => {
            let newRow = JSON.parse(JSON.stringify(table[table.length - 1]));
            table.push(newRow);
        });

        this.setState({tables});
    };

    deleteRow(e) {
        e.preventDefault();

        let tables = this.state.tables;
        tables.forEach((table, tableNum) => {
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
        if (element === "black") {
            element = "white";
        } else {
            element = "black";
        }
        currentTable[row][column] = element;

        tables[number] = currentTable;

        this.setState({tables});

    };

    async learn(e) {
        let body = this.__getDataForRequest();
        const jsonString = JSON.stringify(body);

        await fetch(`${config.server}/learn`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
                'Content-string': jsonString.length
            },
            body: jsonString
        });

        // await this.__getLearnResults();
    };

    async research(e) {
        e.preventDefault();

        let body = this.__getDataForRequest();
        if (body.tables.length !== 1) {
            alert("Исследовать можно только одно изображение");
            return;
        }
        const jsonString = JSON.stringify(body);

        let response = await fetch(`${config.server}/research`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
                'Content-string': jsonString.length
            },
            body: jsonString
        });

        let researchResults = await response.json();
        researchResults.table = this.__getColorsByFlags(researchResults.table);
        this.setState({researchResults});
    }

    __getDataForRequest() {
        let coloredTables = this.state.tables;

        let tables = [];
        coloredTables.forEach((table, tableNum) => {
            tables.push(this.__getFlagsByColors(table));
        });

        return ({
            tables,
            activation: constants.activations.bipolar
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

    __getColorsByFlags(flagsMatr){
        let colors = [];

        flagsMatr.forEach((row)=>{
            let colorsRow = [];
            row.forEach((flag)=>{
               if(flag === 1){
                   colorsRow.push('black');
               } else {
                   colorsRow.push('white');
               }
            });
            colors.push(colorsRow);
        });

        return colors;
    }

    __parseId = (sId) => {
        return sId.split('|', 3);
    };

    changeActivation = (e) => {
        // e.preventDefault();
        this.setState({
                activation: e.currentTarget.value
            }
        )
    };

    // async __getLearnResults() {
    //     let response = await fetch(`${config.server}`);
    //     let learnResults = await response.json();
    //
    //     this.setState({learnResults});
    // }

    async componentWillMount() {
        // await this.__getLearnResults();
    }

    render() {
        return (
            <div className="App">
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.addElement.bind(this)}>Добавить
                        элемент
                    </button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.deleteElement.bind(this)}>Удалить
                        элемент
                    </button>
                </div>
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.addColumn.bind(this)}>Добавить
                        столбец
                    </button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.deleteColumn.bind(this)}>Удалить
                        столбец
                    </button>
                </div>
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.addRow.bind(this)}>Добавить строку
                    </button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.deleteRow.bind(this)}>Удалить
                        строку
                    </button>
                </div>
                <div>
                    {
                        this.state.tables.map((table, tableNum) => {
                            return (<Table num={tableNum} rows={table} onClick={this.changeColor}/>)
                        })
                    }
                </div>
                <div>
                    <button className="btn btn-outline-primary myBtn" onClick={this.learn.bind(this)}>Обучить</button>
                    <button className="btn btn-outline-primary myBtn" onClick={this.research.bind(this)}>Исследовать
                    </button>
                </div>
                <div>
                    <h3>Результаты исследования</h3>
                    <Table rows={this.state.researchResults.table}/>
                    {

                        this.state.researchResults.equals.map((result, index) => {
                            return (<p>Степень соответствия с {index + 1} картинкой: {result}</p>)
                        })
                    }
                </div>
            </div>
        )
    }
}

export default Page;