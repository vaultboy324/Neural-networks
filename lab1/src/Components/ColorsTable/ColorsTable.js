import React from 'react';

import Table from "../Based_components/Table/Table";

import './ColorsTable.css';

const config = require("../../../config/config");
const constants = require("../../../const/const")

class ColorsTable extends React.Component {
    state = {
        matrixColumns: [],
        firstMatr:
            [["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"],
                ["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"]],
        secondMatr:
            [["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"],
                ["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"]],
        researchMatr:
            [["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"],
                ["black", "white", "black", "white", "black"],
                ["white", "black", "white", "black", "white"]],
        firstColorsMatr: [],
        secondColorsMatr: [],
        researchColorsMatr: [],
        resultColumn: [],
        resultVector: [],
        firstMatrType: 1,
        secondMatrType: 2,
        researchMatrType: 3,
        activation: constants.activations.bipolar,
        learnInfo: {
            firstResult: {},
            secondResult: {}
        },
        researchInfo: null
    };

    constructor(props) {
        super(props);

        let colorsMatr = [];
        let values = this.state.firstMatr;
        this.__fillColorMatr({matr: values, colorsMatr: colorsMatr});
        this.setState({firstColorsMatr: colorsMatr});

        colorsMatr = [];
        values = this.state.secondMatr;
        this.__fillColorMatr({matr: values, colorsMatr: colorsMatr});
        this.setState({secondColorsMatr: colorsMatr});

        colorsMatr = [];
        values = this.state.researchMatr;
        this.__fillColorMatr({matr: values, colorsMatr: colorsMatr});
        this.setState({researchColorsMatr: colorsMatr});
    };

    async __loadLearnInfoData() {
        let response = await fetch(`${config.server}/`);
        let learnInfo = await response.json();
        this.setState({learnInfo});
    }

    async componentWillMount() {
        // let learnInfo = await this.__loadLearnInfoData();
        // console.log(learnInfo);
        await this.__loadLearnInfoData()
    }

    __fillColorMatr(oParameters) {
        oParameters.matr.forEach((row) => {
            let colorsString = [];
            row.forEach((element) => {
                if (element === 1) {
                    colorsString.push("white");
                } else {
                    colorsString.push("black");
                }
            });
            oParameters.colorsMatr.push(colorsString);
            colorsString = [];
        })
    }

    onAddColumn = (event) => {
        let rows = this.state.firstMatr;
        this.__addColumn({matr: rows});
        this.setState({firstMatr: rows});

        rows = this.state.secondMatr;
        this.__addColumn({matr: rows});
        this.setState({secondMatr: rows});
        4

        rows = this.state.researchMatr;
        this.__addColumn({matr: rows});
        this.setState({researchMatr: rows});
    };

    __addColumn = (oParameters) => {
        if (oParameters.matr[0].length === 13) {
            return;
        }
        oParameters.matr.forEach((row) => {
            row.push("white");
        });
    };

    onDeleteColumn = (event) => {
        let rows = this.state.firstMatr;
        this.__deleteColumn({matr: rows});
        this.setState({firstMatr: rows});

        rows = this.state.secondMatr;
        this.__deleteColumn({matr: rows});
        this.setState({secondMatr: rows});

        rows = this.state.researchMatr;
        this.__deleteColumn({matr: rows});
        this.setState({researchMatr: rows});
    };

    __deleteColumn = (oParameters) => {
        oParameters.matr.forEach((row) => {
            row.pop();
        })
    };

    onAddRow = (event) => {
        let rows = this.state.firstMatr;
        this.__addRow({matr: rows});
        this.setState({firstMatr: rows});

        rows = this.state.secondMatr;
        this.__addRow({matr: rows});
        this.setState({secondMatr: rows});

        rows = this.state.researchMatr;
        this.__addRow({matr: rows});
        this.setState({researchMatr: rows});
    };

    __addRow = (oParameters) => {
        let emptyRow = [];

        if (oParameters.matr.length === 0) {
            emptyRow.push("white");
            oParameters.matr.push(emptyRow);
            return;
        }

        let length = oParameters.matr[0].length;

        for (let i = 0; i < length; ++i) {
            emptyRow.push("white");
        }

        oParameters.matr.push(emptyRow);
    };

    onDeleteRow = (event) => {
        let rows = this.state.firstMatr;
        this.__deleteRow({matr: rows});
        this.setState({
            firstMatr: rows
        });

        rows = this.state.secondMatr;
        this.__deleteRow({matr: rows});
        this.setState({
            secondMatr: rows
        });

        rows = this.state.researchMatr;
        this.__deleteRow({matr: rows});
        this.setState({
            researchMatr: rows
        });
    };

    __deleteRow = (oParameters) => {
        oParameters.matr.pop();
    };

    updateMatrix = (event) => {
        let aParameters = this.__parseId(event.target.id);

        let type = parseInt(aParameters[0]);
        let row = parseInt(aParameters[1]);
        let column = parseInt(aParameters[2]);

        if (type === this.state.matrixType) {
            let matrix = this.state.firstMatr;
            matrix[row][column] = event.target.value;

            this.setState({
                firstMatr: matrix
            })
        } else {
            let resultVector = this.state.resultVector;
            resultVector[row][column] = event.target.value;

            this.setState({
                resultVector
            })
        }
    };

    changeColor = (event) => {
        let aParameters = this.__parseId(event.target.id);

        let type = parseInt(aParameters[0]);
        let row = parseInt(aParameters[1]);
        let column = parseInt(aParameters[2]);

        let matrix = null;
        if (type === this.state.firstMatrType) {
            matrix = this.state.firstMatr;
        } else if (type === this.state.secondMatrType) {
            matrix = this.state.secondMatr;
        } else {
            matrix = this.state.researchMatr
        }

        let element = matrix[row][column];

        if (element === "black") {
            element = "white"
        } else {
            element = "black"
        }

        matrix[row][column] = element;

        if (type === this.state.firstMatrType) {
            this.setState({
                firstMatr: matrix
            })
        } else if (type === this.state.secondMatrType) {
            this.setState({
                secondMatr: matrix
            })
        } else {
            this.setState({
                researchMatr: matrix
            })
        }

    };

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

    sendMatrix = async (event) => {
        let firstColors = this.state.firstMatr;
        let secondColors = this.state.secondMatr;

        let body = {
            firstMatr: this.__getFlagsByColors(firstColors),
            secondMatr: this.__getFlagsByColors(secondColors),
            activation: this.state.activation
        };

        const jsonString = JSON.stringify(body);

        const response = await fetch(`${config.server}/learn`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': jsonString.length
            },

            body: jsonString
        });

        let result = await response.json();
        this.__loadLearnInfoData()

        // alert("Обучение завершено");
    };

    sendResearchMatrix = async (event) => {
        let researchMatrix = this.state.researchMatr;

        let body = {
            researchMatr: this.__getFlagsByColors(researchMatrix)
        };

        const jsonString = JSON.stringify(body);

        const response = await fetch(`${config.server}/research`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': jsonString.length
            },

            body: jsonString
        });

        let result = await response.json();
        console.log(result);

        switch (result.errorCode) {
            case constants.sizeErr:
                alert("Для обучения использовалось поле другого размера");
                break;
            case constants.noModelErr:
                alert("На данный момент нет обученной модели");
                break;
            default:
                this.setState({
                    researchInfo: result
                });
                break;
        }
    };

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
                    <h3>Результаты последнего обучения</h3>
                    <p>Функция активации: {this.state.learnInfo.wayText}.</p>
                    <p>Веса: [{this.state.learnInfo.w}]</p>
                    <p>Среднее арифметическое: {this.state.learnInfo.average}</p>
                    <p>Значение первого сигнала: {this.state.learnInfo.firstResult.value}, его
                        код: {this.state.learnInfo.firstResult.status}</p>
                    <p>Значение второго сигнала: {this.state.learnInfo.secondResult.value}, его
                        код: {this.state.learnInfo.secondResult.status}</p>
                </div>
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.onAddColumn.bind(this)}>Добавить
                        столбец
                    </button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.onDeleteColumn.bind(this)}>Удалить
                        столбец
                    </button>
                </div>
                <div>
                    <button className="btn btn-outline-success myBtn" onClick={this.onAddRow.bind(this)}>Добавить
                        строку
                    </button>
                    <button className="btn btn-outline-danger myBtn" onClick={this.onDeleteRow.bind(this)}>Удалить
                        строку
                    </button>
                </div>
                <div>
                </div>
                <div>
                    <div className="row">
                        <div className="Table">
                            <Table columns={this.state.matrixColumns} rows={this.state.firstMatr}
                                   colors={this.state.firstColorsMatr} type={this.state.firstMatrType}
                                   onClick={this.changeColor}/>
                        </div>
                        <div className="Table">
                            <Table columns={this.state.matrixColumns} rows={this.state.secondMatr}
                                   colors={this.state.secondColorsMatr} type={this.state.secondMatrType}
                                   onClick={this.changeColor}/>
                        </div>
                        <div>
                            <div className="Radiogroup">
                                <p><input type="radio" name="activation"
                                          value={constants.activations.bipolar}
                                          checked={this.state.activation === constants.activations.bipolar}
                                          onChange={this.changeActivation}/>Биполярная функция
                                    активации</p>
                                <p><input type="radio" name="activation"
                                          value={constants.activations.binary}
                                          onChange={this.changeActivation}/>Бинарная функция
                                    активации</p>
                            </div>
                            <button className="btn btn btn-outline-primary"
                                    onClick={this.sendMatrix.bind(this)}>Обучить
                            </button>
                        </div>

                        <div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="centralTable">
                            <Table columns={this.state.matrixColumns} rows={this.state.researchMatr}
                                   colors={this.state.researchColorsMatr} type={this.state.researchMatrType}
                                   onClick={this.changeColor}/>
                        </div>
                        <div>
                            <button className="btn btn btn-outline-primary researchButtonBlock"
                                    onClick={this.sendResearchMatrix.bind(this)}>Исследовать
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    {
                        this.state.researchInfo
                            ? <div>
                                <h3>Результаты анализа</h3>
                                <p>Значение сигнала: {this.state.researchInfo.value}, его код: {this.state.researchInfo.status}</p>
                            </div>
                            : null
                    }
                </div>
            </div>
        )
    }
}

export default ColorsTable;