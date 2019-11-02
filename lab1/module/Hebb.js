const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const config = require('../config/config');

const constants = require('../const/const');

let nodeScheme = new Schema({
    neuron: {
        w: [],
        average: Number,
        firstResult: {
            value: Number,
            status: Number
        },
        secondResult: {
            value: Number,
            status: Number
        },
        way: String,
        wayText: String
    }
}, {
    versionKey: false
});

module.exports = {
    Node: mongoose.model("nodes", nodeScheme),

    async learn(oParameters){
        let result;

        switch (oParameters.activation) {
            case constants.activations.bipolar:
                result = await this.bipolar(oParameters)
                break;
            case constants.activations.binary:
                result = await this.binary(oParameters);
                break
        }

        return result;
    },


    async getNode() {
        mongoose.connect(config.mongoose.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        let nodes = await this.Node.find({}).exec();

        return await nodes[0].toObject().neuron;

        // return {
        //     string: "Hello world!"
        // }
    },

    async bipolar(oParameters) {
        let firstMatrix = oParameters.firstMatr;
        let secondMatrix = oParameters.secondMatr;

        let firstArray = this.__toBipolarArray(firstMatrix);
        let secondArray = this.__toBipolarArray(secondMatrix);

        let firstParameters = {
            x: firstArray,
            y: 1
        };

        let secondParameters = {
            x: secondArray,
            y: -1
        };

        return await this.__toBipolar({
            firstParameters,
            secondParameters
        })
    },

    async binary(oParameters) {
        let firstMatrix = oParameters.firstMatr;
        let secondMatrix = oParameters.secondMatr;

        let firstArray = this.__toBinaryArray(firstMatrix);
        let secondArray = this.__toBinaryArray(secondMatrix);

        let firstParameters = {
            x: firstArray,
            y: 1
        };

        let secondParameters = {
            x: secondArray,
            y: 0
        };

        return await this.__toBinary({
            firstParameters,
            secondParameters
        })
    },

    async research(oParameters) {
        let result = {
            errorCode: null,
            value: null,
            status: null
        };

        let matrix = oParameters.researchMatr;

        let neuron = await this.getNode();
        if(!neuron){
            result.errorCode = constants.noModelErr;
            return result;
        }

        let average = neuron.average;
        let w = neuron.w;

        let x = [];

        let positive = null;
        let negative = null;

        switch (neuron.way) {
            case constants.activations.bipolar:
                x = this.__toBipolarArray(matrix);
                positive = constants.activationConst.bipolar.bipolarPositive;
                negative = constants.activationConst.bipolar.bipolarNegative;
                break;
            case constants.activations.binary:
                x = this.__toBinaryArray(matrix);
                positive = constants.activationConst.binary.binaryPositive;
                negative = constants.activationConst.binary.binaryZero;
                break;
        }

        if(w.length !== x.length + 1){
            result.errorCode = constants.sizeErr;
            return result;
        }

        result.value = this.__getResult(w, x);

        if(result.value > average){
            result.status = positive
        } else {
            result.status = negative
        }

        return result;
        // let w =

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

    __toBinaryArray(matrix) {
        let array = [];

        matrix.forEach((row) => {
            row.forEach((element) => {
                array.push(element);
            });
        });

        return array;
    },

    async __toBipolar(oParameters) {
        let first = oParameters.firstParameters;
        let second = oParameters.secondParameters;

        let w = [];

        let element = 0 + 1 * first.y;
        w.push(element);

        first.x.forEach((element, index) => {
            let currentW = 0 + element * first.y;
            w.push(currentW);
        });

        w[0] += 1 * second.y;

        second.x.forEach((element, index) => {
            w[index + 1] += element * second.y
        });

        let firstResult = {
            value: null,
            status: null
        };

        let secondResult = {
            value: null,
            status: null
        };

        firstResult.value = this.__getResult(w, first.x);
        secondResult.value = this.__getResult(w, second.x);

        let average = (firstResult.value + secondResult.value) / 2;

        if (firstResult.value > average) {
            firstResult.status = constants.activationConst.bipolar.bipolarPositive;
        } else {
            firstResult.status = constants.activationConst.bipolar.bipolarNegative;
        }

        if (secondResult.value > average) {
            secondResult.status = constants.activationConst.bipolar.bipolarPositive;
        } else {
            secondResult.status = constants.activationConst.bipolar.bipolarNegative;
        }

        let way = constants.activations.bipolar;
        let wayText = constants.activationConst.bipolar.text;

        let result = {
            w,
            average,
            firstResult,
            secondResult,
            way,
            wayText
        };

        await this.insertNode(result);
        return result;

        // return w;
    },

    async __toBinary(oParameters) {
        let first = oParameters.firstParameters;
        let second = oParameters.secondParameters;

        let w = [];

        let element = 0 + this.__getBinaryValue(1, first.y);
        w.push(element);

        first.x.forEach((element, index) => {
            let currentW = this.__getBinaryValue(element, first.y);
            w.push(currentW);
        });

        w[0] += this.__getBinaryValue(1, second.y);

        second.x.forEach((element, index) => {
            w[index + 1] += this.__getBinaryValue(element, second.y);
        });

        let firstResult = {
            value: null,
            status: null
        };

        let secondResult = {
            value: null,
            status: null
        };

        firstResult.value = this.__getResult(w, first.x);
        secondResult.value = this.__getResult(w, second.x);

        let average = (firstResult.value + secondResult.value) / 2;

        if (firstResult.value > average) {
            firstResult.status = constants.activationConst.binary.binaryPositive
        } else {
            firstResult.status = constants.activationConst.binary.binaryZero
        }

        if (secondResult.value > average) {
            secondResult.status = constants.activationConst.binary.binaryPositive
        } else {
            secondResult.status = constants.activationConst.binary.binaryZero
        }

        let way = constants.activations.binary;
        let wayText = constants.activationConst.binary.text;

        let result = {
            w,
            firstResult,
            secondResult,
            average,
            way,
            wayText
        };

       await this.insertNode(result);
        return result;
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

    __getResult(w, x) {
        let result = 0;
        w.forEach((element, index) => {
            if (index !== 0) {
                result += element * x[index - 1];
            }
        });
        result += w[0];
        return result;
    },

    async insertNode(oParameters) {
        mongoose.connect(config.mongoose.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        this.Node.deleteMany({}).exec();

        let node = new this.Node({
            neuron: oParameters
        });

      await node.save();
    }
};