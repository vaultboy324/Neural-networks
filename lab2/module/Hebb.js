// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const config = require('../config/config');
const constants = require('../const/const');

const node = require('../model/node');

module.exports = {
    __getClasses(oParameters) {
        let result = {
            avg: 0,
            activation: oParameters.activation
        };

        let first = {
            arr: [
                {
                    table: oParameters.tables[0],
                    x: oParameters.activation === constants.activations.binary ? this.__toBinaryArray(oParameters.tables[0]) : this.__toBipolarArray(oParameters.tables[0]),
                    y: 1
                },
                {
                    table: oParameters.tables[1],
                    x: oParameters.activation === constants.activations.binary ? this.__toBinaryArray(oParameters.tables[1]) : this.__toBipolarArray(oParameters.tables[1]),
                    y: 1
                }
            ],
        };

        let second = {
            arr: [
                {
                    table: oParameters.tables[2],
                    x: oParameters.activation === constants.activations.bipolar ? this.__toBipolarArray(oParameters.tables[2]) : this.__toBinaryArray(oParameters.tables[2]),
                    y: oParameters.activation === constants.activations.binary ? 0 : -1
                },
                {
                    table: oParameters.tables[3],
                    x: oParameters.activation === constants.activations.bipolar ? this.__toBipolarArray(oParameters.tables[3]) : this.__toBinaryArray(oParameters.tables[3]),
                    y: oParameters.activation === constants.activations.binary ? 0 : -1
                }
            ],
        };

        result.first = first;
        result.second = second;

        return result;
    },

    __toBinaryArray(matrix) {
        let array = [];

        matrix.forEach((row) => {
            row.forEach((element) => {
                array.push(element);
            });
        });

        return array;
    },

    __toBipolarArray(matrix) {
        let array = [];

        matrix.forEach((row) => {
            row.forEach((element) => {
                if (element !== 0) {
                    array.push(element);
                } else {
                    array.push(-1);
                }
            });
        });

        return array;
    },

    __getBinaryValue(x, y) {
        if (x === 1 && y === 1) {
            return 1;
        } else if (x === 0) {
            return 0;
        } else if (x !== 0 && y === 0) {
            return -1;
        }
    },

    __getBipolarValue(x, y) {
        return x * y;
    },

    __getWeights(oParameters) {
        let w = [];

        let getValue;

        if (oParameters.activation === constants.activations.binary) {
            getValue = this.__getBinaryValue;
        } else {
            getValue = this.__getBipolarValue;
        }

        if (!oParameters.w) {
            w[0] = 0;
            oParameters.arr[0].x.forEach((element, index) => {
                w.push(0);
            });
        } else {
            w = oParameters.w;
        }

        oParameters.arr.forEach((node, number) => {
            w[0] += getValue(1, node.y);
            node.x.forEach((element, index) => {
                w[index + 1] += getValue(element, node.y)
            });
        });

        // oParameters.w = w;

        return w;
        // return w;
    },

    __getSum(oParameters) {
        let result = 0;

        oParameters.w.forEach((element, index) => {
            if (index !== 0) {
                result += element * oParameters.x[index - 1];
            }
        });
        result += oParameters.w[0];
        return result;
    },

    __getAvg(oParameters) {
        let result = 0;

        let currentElement;

        oParameters.info.forEach((node, index) => {
            if(node.y < 1){
                result += node.sum;
            } else {
                currentElement = node.sum;
            }
        });

        result /= oParameters.info.length - 1;

        result = (result + currentElement) / 2;

        return result;
    },

    __getStatuses(oParameters) {
        let positive = 1;
        let negative = 0;

        if (oParameters.activation === constants.activations.bipolar) {
            negative = -1;
        }

        oParameters.info.forEach((node, index)=>{
           if(node.sum > oParameters.avg){
               node.status = positive
           }  else {
               node.status = negative;
           }
        });

        // oParameters.arr.forEach((element, index) => {
        //     if (element.value > oParameters.avg) {
        //         element.status = positive;
        //     } else {
        //         element.status = negative;
        //     }
        // });
    },

    __getArrays(oParameters) {
        let result = [];

        let toArray = oParameters.activation === constants.activations.binary ? this.__toBinaryArray : this.__toBipolarArray;
        oParameters.tables.forEach((table, tableNum) => {
            result.push(toArray(table));
        });

        return result;
    },

    __getNeurons(oParameters) {
        let result = [];

        let positive = 1;
        let negative = oParameters.activation === constants.activations.binary ? 0 : -1;

        oParameters.arrays.forEach((array, arrayNum) => {
            let neuron = {info: []};
            oParameters.arrays.forEach((array, index) => {
                let node = {
                    x: array,
                    y: arrayNum === index ? positive : negative
                };
                neuron.info.push(node);
            });
            result.push(neuron)
        });

        return result;
    },

    __getBadNodes(oParameters) {
        let result = [];

        let negative = oParameters.activation === constants.activations.binary ? 0 : -1;

        oParameters.info.forEach((node, index) => {
            if (node.sum > oParameters.avg && node.y === negative || node.sum < oParameters.avg && node.y === 1) {
                result.push(node);
            }
        });

        return result;
    },

    __checkBadNodes(oParameters) {
        let result = false;

        oParameters.neurons.forEach((neuron, index) => {
            if (neuron.badNodes.length !== 0) {
                result = true;
            }
        });

        return result;
    },

    __fixWeights(oParameters) {
        oParameters.badNodes.forEach((badNode, index) => {
            if (badNode.status > badNode.y) {
                let deltaW = 0.5 * badNode.y;
                oParameters.info.w[0] += deltaW;
            } else if (badNode.status < badNode.y){
                let deltaW = 0.5 * badNode.y;
                oParameters.info.w[0] -= deltaW;
            }
            badNode.x.forEach((element, elementNum) => {
                let deltaW = 0.5 * badNode.y * element;
                if (badNode.status < badNode.y) {
                    oParameters.info.w[elementNum - 1] += deltaW;
                } else if (badNode.status > badNode.y) {
                    oParameters.info.w[elementNum - 1] -= deltaW;
                }
            });
        });
    },

    __having(node, badNodes) {
        let result = false;

        badNodes.forEach((badNode, index) => {
            if (badNode === node) {
                result = true;
            }
        });

        return result;
    },

    async learn(oParameters) {
        oParameters.arrays = this.__getArrays(oParameters);
        oParameters.neurons = this.__getNeurons(oParameters);

        oParameters.neurons.forEach((neuron, index) => {
            neuron.info.w = this.__getWeights({
                arr: neuron.info,
                w: neuron.info.w,
                activation: oParameters.activation
            });
            neuron.info.iterations = 1;
        });

        oParameters.neurons.forEach((neuron, index) => {
            neuron.info.forEach((node, nodeNum) => {
                node.sum = this.__getSum({
                    w: neuron.info.w,
                    x: node.x
                })
            });
        });

        oParameters.neurons.forEach((neuron, index) => {
            neuron.avg = this.__getAvg(neuron);
            this.__getStatuses(neuron);
        });

        oParameters.neurons.forEach((neuron, index) => {
            neuron.badNodes = this.__getBadNodes({
                info: neuron.info,
                avg: neuron.avg,
                activation: oParameters.activation
            });
        });

        while (this.__checkBadNodes(oParameters)) {
            oParameters.neurons.forEach((neuron, index) => {
                if (neuron.badNodes.length > 0) {
                    this.__fixWeights(neuron);

                    neuron.info.forEach((node, nodeNum) => {
                        node.sum = this.__getSum({
                            w: neuron.info.w,
                            x: node.x
                        })
                    });

                    neuron.avg = this.__getAvg(neuron);
                    this.__getStatuses(neuron);

                    neuron.badNodes = this.__getBadNodes({
                        info: neuron.info,
                        avg: neuron.avg,
                        activation: oParameters.activation
                    });

                    ++neuron.info.iterations;
                    console.log({index, length: neuron.badNodes.length})
                }
            });
        }

        console.log(oParameters);
        // oParameters.classes = this.__getClasses(oParameters);
        //
        // oParameters.classes.first.w = this.__getWeights({
        //     arr: oParameters.classes.first.arr,
        //     activation: oParameters.activation,
        //     w: oParameters.classes.second.w
        // });
        // oParameters.classes.second.w = this.__getWeights({
        //     arr: oParameters.classes.second.arr,
        //     activation: oParameters.activation,
        //     w: oParameters.classes.first.w
        // });
        //
        // oParameters.classes.first.arr[0].value = this.__getSum({
        //     w: oParameters.classes.second.w,
        //     x: oParameters.classes.first.arr[0].x
        // });
        // oParameters.classes.first.arr[1].value = this.__getSum({
        //     w: oParameters.classes.second.w,
        //     x: oParameters.classes.first.arr[1].x
        // });
        //
        // oParameters.classes.second.arr[0].value = this.__getSum({
        //     w: oParameters.classes.second.w,
        //     x: oParameters.classes.second.arr[0].x
        // });
        // oParameters.classes.second.arr[1].value = this.__getSum({
        //     w: oParameters.classes.second.w,
        //     x: oParameters.classes.second.arr[1].x
        // });
        //
        // oParameters.classes.first.avg = this.__getAvg(oParameters.classes.first.arr[0].value, oParameters.classes.first.arr[1].value);
        // oParameters.classes.second.avg = this.__getAvg(oParameters.classes.second.arr[0].value, oParameters.classes.second.arr[1].value);
        //
        // oParameters.classes.avg = this.__getAvg(oParameters.classes.first.avg, oParameters.classes.second.avg);
        // oParameters.classes.w = oParameters.classes.second.w;
        //
        // this.__getStatuses({
        //     arr: oParameters.classes.first.arr,
        //     activation: oParameters.activation,
        //     avg: oParameters.classes.first.avg
        // });
        //
        // this.__getStatuses({
        //     arr: oParameters.classes.second.arr,
        //     activation: oParameters.activation,
        //     avg: oParameters.classes.second.avg
        // });
        //
        // node.delete();
        // node.create(oParameters.classes);
    },

    __equalsCount(learnTable, researchTable) {
        let result = 0;

        learnTable.forEach((row, rowNum) => {
            row.forEach((element, index) => {
                if (element === researchTable[rowNum][index]) {
                    ++result;
                }
            });
        });

        return result;
    },

    __basedActivation(oParameters) {
        let positive = 1;
        let negative = 0;

        if (oParameters.activation === constants.activations.bipolar) {
            negative = -1;
        }

        if (oParameters.value > oParameters.avg) {
            return positive
        }
        return negative;
    },

    __linearBinaryActivation(oParameters) {
        let step = (oParameters.first.avg - oParameters.second.avg) / 3.0;
        let right = oParameters.first.avg - step;
        let left = oParameters.second.avg + step;

        if (oParameters.value > right) {
            return 1;
        } else if (oParameters.value < left) {
            return -1;
        } else {
            let func = oParameters.avg * oParameters.value - (oParameters.avg * oParameters.avg);
            if (func >= oParameters.avg) {
                return 1
            } else {
                return -1;
            }
        }

    },

    async research(oParameters) {
        // let learnData = await node.read();
        // let result = {};
        //
        // let equals = [];
        // equals.push(this.__equalsCount(learnData.first.arr[0].table, oParameters.tables[0]));
        // equals.push(this.__equalsCount(learnData.first.arr[1].table, oParameters.tables[0]));
        // equals.push(this.__equalsCount(learnData.second.arr[0].table, oParameters.tables[0]));
        // equals.push(this.__equalsCount(learnData.second.arr[1].table, oParameters.tables[0]));
        // result.equals = equals;
        //
        // result.x = learnData.activation === constants.activations.binary ? this.__toBinaryArray(oParameters.tables[0]) : this.__toBipolarArray(oParameters.tables[0]);
        //
        // result.value = this.__getSum({
        //     w: learnData.w,
        //     x: result.x
        // });
        //
        // if(oParameters.activation === constants.activations.linear){
        //     result.status = this.__linearBinaryActivation({
        //         avg: learnData.avg,
        //         first: learnData.first,
        //         second: learnData.second,
        //         value: result.value
        //     });
        // } else {
        //     result.status = this.__basedActivation({
        //         avg: learnData.avg,
        //         activation: oParameters.activation,
        //         value: result.value
        //     });
        // }
        //
        // return result;

    },

    async getLearnResult() {
        return await node.read();
    }
};