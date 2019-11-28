const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const config = require('../config/config');
const constants = require('../const/const');

let nodeSchema = new Schema({
    node: {

    },
}, {
    versionKey: false
});

module.exports = {
    Node: mongoose.model("nodes", nodeSchema),

    __connect(){
        mongoose.connect(config.mongoose.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    },

    async read(){
        this.__connect();

        let nodes = await this.Node.find({}).exec();

        return await nodes[0].toObject().node;
    },

    create(oParameters){
        this.__connect();

        let node = new this.Node({
            node: oParameters
        });

        node.save();
    },

    async delete(){
        this.Node.deleteMany({}).exec();
    }
};