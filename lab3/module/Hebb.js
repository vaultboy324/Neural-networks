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

        if (!oParameters.learnCoef) {
            oParameters.learnCoef = constants.alfa * oParameters.size;
        }

        if (oParameters.w.length === 0) {
            let currentW = Math.random() * (oParameters.learnCoef - (-oParameters.learnCoef)) - oParameters.learnCoef;
            oParameters.w.push(currentW);

            oParameters.arr[0].x.forEach((node, number) => {
                // node.x.forEach((element, index)=>{
                let currentW = Math.random() * (oParameters.learnCoef - (-oParameters.learnCoef)) - oParameters.learnCoef;
                oParameters.w.push(currentW);
                // });
            });
            // oParameters.w = w;
        }

        // return w;

        // let w = [];
        //
        // let getValue = this.__getBipolarValue;
        //
        // // if (oParameters.activation === constants.activations.binary) {
        // //     getValue = this.__getBinaryValue;
        // // } else {
        // //     getValue = this.__getBipolarValue;
        // // }
        //
        // if (!oParameters.w) {
        //     w[0] = 0;
        //     oParameters.arr[0].x.forEach((element, index) => {
        //         w.push(0);
        //     });
        // } else {
        //     w = oParameters.w;
        // }
        //
        // oParameters.arr.forEach((node, number) => {
        //     w[0] += getValue(1, node.y);
        //     node.x.forEach((element, index) => {
        //         w[index + 1] += getValue(element, node.y)
        //     });
        // });
        //
        // // oParameters.w = w;
        //
        // return w;
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

        oParameters.info.arr.forEach((node, index) => {
            if (node.y < 1) {
                result += node.sum;
            } else {
                currentElement = node.sum;
            }
        });

        result /= oParameters.info.arr.length - 1;

        result = (result + currentElement) / 2;

        return result;
    },

    __getStatuses(oParameters) {
        let positive = 1;
        let negative = -1;

        // if (oParameters.activation === constants.activations.bipolar) {
        //     negative = -1;
        // }

        oParameters.info.arr.forEach((node, index) => {
            if (node.sum > oParameters.avg) {
                node.status = positive
            } else {
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

        let toArray = this.__toBipolarArray;

        // let toArray = oParameters.activation === constants.activations.binary ? this.__toBinaryArray : this.__toBipolarArray;
        oParameters.tables.forEach((table, tableNum) => {
            result.push(toArray(table));
        });

        return result;
    },

    __getNeurons(oParameters) {
        let result = [];

        let positive = 1;
        let negative = -1;

        oParameters.arrays.forEach((array, arrayNum) => {
            let neuron = {
                info: {
                    arr: [],
                    w: []
                }
            };
            oParameters.arrays.forEach((array, index) => {
                let node = {
                    x: array,
                    y: arrayNum === index ? positive : negative
                };
                neuron.info.arr.push(node);
            });
            result.push(neuron)
        });

        return result;
    },

    __getBadNodes(oParameters) {
        let result = [];

        let negative = -1;

        oParameters.info.arr.forEach((node, index) => {
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
        let isEmpty = false;

        if (oParameters.wOld.length === 0) {
            isEmpty = true;
            oParameters.wOld.push(oParameters.w[0]);
        }
        oParameters.w[0] += constants.alfa * (oParameters.y - oParameters.sum);

        oParameters.x.forEach((element, index) => {
            if (isEmpty) {
                oParameters.wOld.push(oParameters.w[index + 1]);
            }
            oParameters.w[index + 1] += constants.alfa * (oParameters.y - oParameters.sum) * element;
        });
        // oParameters.badNodes.forEach((badNode, index) => {
        //     let deltaW = 0.05 * 1 * badNode.error;
        //     oParameters.info.w[0] += deltaW;
        //
        //     badNode.x.forEach((element, elementNum) => {
        //         let deltaW = 0.05 * badNode.error * element;
        //         oParameters.info.w[elementNum - 1] += deltaW;
        //     });
        // })
        //     if (badNode.status > badNode.y) {
        //         let deltaW = 0.01 * this.__getBinaryValue(1, badNode.error);
        //         oParameters.info.w[0] += deltaW;
        //     } else if (badNode.status < badNode.y){
        //         let deltaW = 0.01 * this.__getBinaryValue(1, badNode.y);
        //         oParameters.info.w[0] -= deltaW;
        //     }
        //     badNode.x.forEach((element, elementNum) => {
        //         let deltaW = 0.01 * this.__getBinaryValue(element, badNode.y);
        //         if (badNode.status < badNode.y) {
        //             oParameters.info.w[elementNum - 1] += deltaW;
        //         } else if (badNode.status > badNode.y) {
        //             oParameters.info.w[elementNum - 1] -= deltaW;
        //         }
        //     });
        // });
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

    __getErrors(oParameters) {
        oParameters.info.arr.forEach((node, index) => {
            node.error = Math.pow(node.y - node.status, 2);
        });
    },

    __getError(oParameters) {
        let result = 0;
        oParameters.neurons.forEach((neuron, neuronNum) => {
            neuron.info.arr.forEach((node, index)=>{
               let value = node.y - node.sum;
               result += Math.pow(value, 2);
            });
        });

        return result;
    },

    async learn(oParameters) {
        oParameters.arrays = this.__getArrays(oParameters);
        oParameters.neurons = this.__getNeurons(oParameters);

        oParameters.iterations = 1;

        oParameters.neurons.forEach((neuron, index) => {
            this.__getWeights({
                arr: neuron.info.arr,
                w: neuron.info.w,
                activation: oParameters.activation,
                size: oParameters.tables.length
            });
        });

        oParameters.neurons.forEach((neuron, index) => {
            neuron.info.wOld = [];
            neuron.info.arr.forEach((node, nodeNum) => {
                node.sum = this.__getSum({
                    w: neuron.info.w,
                    x: node.x
                });
                this.__fixWeights({
                    y: node.y,
                    sum: node.sum,
                    x: node.x,
                    w: neuron.info.w,
                    wOld: neuron.info.wOld
                })
            });
        });

        let error = this.__getError(oParameters);
        while (error > constants.eps){
            oParameters.neurons.forEach((neuron, index) => {
                neuron.info.wOld = [];
                neuron.info.arr.forEach((node, nodeNum) => {
                    node.sum = this.__getSum({
                        w: neuron.info.w,
                        x: node.x
                    });
                    this.__fixWeights({
                        y: node.y,
                        sum: node.sum,
                        x: node.x,
                        w: neuron.info.w,
                        wOld: neuron.info.wOld
                    });
                });
                neuron.avg = this.__getAvg(neuron);
            });
            error = this.__getError(oParameters);
            oParameters.iterations += 1;
        }

        node.delete();
        node.create(oParameters);

        //
        // oParameters.neurons.forEach((neuron, index) => {
        //     neuron.info.arr.forEach((node, nodeNum) => {
        //         node.sum = this.__getSum({
        //             w: neuron.info.w,
        //             x: node.x
        //         })
        //     });
        // });
        //
        // oParameters.neurons.forEach((neuron, index) => {
        //     neuron.avg = this.__getAvg(neuron);
        //     this.__getStatuses(neuron);
        //     this.__getErrors(neuron);
        // });
        //
        // oParameters.neurons.forEach((neuron, index) => {
        //     neuron.badNodes = this.__getBadNodes({
        //         info: neuron.info,
        //         avg: neuron.avg,
        //         activation: oParameters.activation
        //     });
        // });
        //
        // while (this.__checkBadNodes(oParameters)) {
        //     oParameters.neurons.forEach((neuron, index) => {
        //         if (neuron.badNodes.length > 0) {
        //             this.__fixWeights(neuron);
        //
        //             neuron.info.arr.forEach((node, nodeNum) => {
        //                 node.sum = this.__getSum({
        //                     w: neuron.info.w,
        //                     x: node.x
        //                 })
        //             });
        //
        //             neuron.avg = this.__getAvg(neuron);
        //             this.__getStatuses(neuron);
        //             this.__getErrors(neuron);
        //
        //             neuron.badNodes = this.__getBadNodes({
        //                 info: neuron.info,
        //                 avg: neuron.avg,
        //                 activation: oParameters.activation
        //             });
        //
        //             ++neuron.info.iterations;
        //             console.log({index, length: neuron.badNodes.length})
        //         }
        //     });
        // }
        //
        // console.log(oParameters);
        // await node.delete();
        // await node.create(oParameters);
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
        let negative = -1;

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
        let learnData = await node.read();
        let equals = [];

        learnData.tables.forEach((table, tableNum) => {
            equals.push(this.__equalsCount(table, oParameters.tables[0]));
        });

        let result = {
            equals
        };

        result.x = this.__toBipolarArray(oParameters.tables[0]);

        let values = [];
        learnData.neurons.forEach((neuron, index) => {
            values.push(this.__getSum({
                w: neuron.info.w,
                x: result.x
            }));
        });
        result.values = values;

        let statuses = [];
        learnData.neurons.forEach((neuron, index) => {
            statuses.push(this.__basedActivation({
                avg: neuron.avg,
                value: result.values[index]
            }))
        });
        result.statuses = statuses;

        return result;

    },

    async getLearnResult() {
        return await node.read();
    }
};