// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

const {zeros, add, multiply, transpose, subtract} = require('mathjs');

const config = require('../config/config');
const constants = require('../const/const');

const node = require('../model/node');

module.exports = {
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

    __getArrays(oParameters) {
        let result = [];

        let toArray = this.__toBipolarArray;

        oParameters.tables.forEach((table, tableNum) => {
            result.push(toArray(table));
        });

        return result;
    },

    __transposeArray(array){
      let result = [];

      array.forEach((element, index)=>{
         result.push([element]);
      });

      return result;
    },

    __getAvg(array){
      let sum = 0;

      array.forEach((element, index)=>{
         sum += element;
      });

      return sum / array.length;
    },

    __getW(oParameters){
        if(oParameters.W.length === 0){
            oParameters.W = zeros(oParameters.arrays[0].length, oParameters.arrays[0].length);
            oParameters.W = oParameters.W._data;
        }

        oParameters.arrays.forEach((array, index)=>{
            let currentW = multiply(this.__transposeArray(array), [array]);
            oParameters.W = add(oParameters.W, currentW);
        });

        let currentIndex = 0;

        oParameters.W.forEach((currentW, index)=>{
           currentW[currentIndex] = 0;
           ++currentIndex;
        });

        oParameters.W = multiply(oParameters.W, 1 / oParameters.arrays[0].length);

    },

    __multiply(matrix, vector){
      let result = [];

      for(let j = 0; j < matrix[0].length; ++j){
          let localResult = 0;

          for(let i = 0; i < matrix.length; ++i){
              localResult += matrix[i][j] * vector[i];
          }

          result.push(localResult);
      }

      return result;
    },

    async learn(oParameters) {
        oParameters.rowLength = oParameters.tables[0][0].length;

        oParameters.arrays = this.__getArrays(oParameters);

        oParameters.W = [];
        oParameters.ones = [];
        this.__getW(oParameters);

        node.delete();

        node.create(oParameters);
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

    __getActivated(array, oldArray){
        let result = [];

        let avg = this.__getAvg(array);

        array.forEach((element, index)=>{
           if(element > avg){
               result.push(1);
           } else if(element === avg ){
               result.push(oldArray[index]);
           } else {
               result.push(-1);
           }
        });

        return result;
    },

    __isEquals(vect1, vect2){
        let result = true;

        vect1.forEach((element, index)=>{
           if(element !== vect2[index]){
               result = false;
           }
        });

        return result;
    },

    __toMatrix(array, rowLength){
      let result = [];

      let currentRow = [];
      array.forEach((element, index)=>{
          currentRow.push(element);
          if(currentRow.length === rowLength){
              result.push(currentRow);
              currentRow = [];
          }
      });

      return result;
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

        let X = [];
        let index = 0;
        X.push(result.x);
        ++index;

        X.push(this.__getActivated(multiply(learnData.W, X[index - 1]), X[index - 1]));
        ++index;

        X.push(this.__getActivated(multiply(learnData.W, X[index - 1]), X[index - 1]));
        ++index;

        X.push(this.__getActivated(multiply(learnData.W, X[index - 1]), X[index - 1]));

        let iterations = 0;

        while (!this.__isEquals(X[index], X[index - 2]) || !this.__isEquals(X[index - 1], X[index - 3])){
            ++index;
            X.push(this.__getActivated(multiply(learnData.W, X[index - 1]), X[index - 1]));
            ++iterations;
        }

        result.x = X[index - 1];
        result.table = this.__toMatrix(result.x, learnData.rowLength);

        console.log(iterations);

        return result
    },

    async getLearnResult() {
        return await node.read();
    }
};