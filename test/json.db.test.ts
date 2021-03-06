import * as Chai from 'chai';
import JsonDb from "../src/lib/db/JsonDb";
import "../src/lib/extender/DateExtender";

describe('JsonDB', function () {
    it('basic', async function () {
        let db = await JsonDb.db(null, {sas: []});
        let table = db.get('sas');

        for (let i = 0; i < 8; i++) {
            table.push({
                title: 'Sas ' + i,
                content: 'Gas' + i
            });
            Chai.expect(table.size).to.be.eq(i + 1);
        }

        // Find all
        Chai.expect(table.find().length).to.be.eq(8);

        // Find first
        Chai.expect(table.findOne()).to.have.property('id', 1);

        Chai.expect(table.findOne({title: 'Sas 0'})).to.have.property('id', 1);
        Chai.expect(table.findOne({title: 'Sas 1'})).to.have.property('id', 2);
        Chai.expect(table.findOne({title: 'Sas 2'})).to.have.property('id', 3);

        Chai.expect(table.findOne({title: /sas/i})).to.have.property('id', 1);

        let s = table.find([{id: 1}, {id: 5}]);
        Chai.expect(s[0]).to.have.property('id', 1);
        Chai.expect(s[1]).to.have.property('id', 5);
    });

    it('condition', async function () {
        let db = await JsonDb.db(null, {sas: []});
        let table = db.get('sas');

        table.push({ title: 'one', created: new Date() });
        table.push({ title: 'prev', created: new Date().offset(-2) });
        table.push({ title: 'next', created: new Date().offset(2) });

        Chai.expect(table.find({created: new Date()})).to.have.property('length', 1);
        Chai.expect(table.findOne({created: new Date()})).to.have.property('title', 'one');

        Chai.expect(table.find({'created >': new Date()})).to.have.property('length', 1);
        Chai.expect(table.findOne({'created >': new Date()})).to.have.property('title', 'next');

        Chai.expect(table.find({'created >=': new Date()})).to.have.property('length', 1);
    });
});
