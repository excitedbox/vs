import * as Chai from 'chai';
import "../src/lib/extender/StringExtender";

describe('Base', function () {

    it('string extender', async function () {
        Chai.expect('2019-01-02 00:00:00.000Z'.toDate().getTime()).eq(new Date('2019-01-02T00:00:00.000Z').getTime());
        Chai.expect('2019-01-02T00:00:00.000Z'.toDate().getTime()).eq(new Date('2019-01-02T00:00:00.000Z').getTime());
        Chai.expect('2019-01-02'.toDate().getTime()).eq(new Date('2019-01-02').getTime());
        Chai.expect('02.01.2019'.toDate().getTime()).eq(new Date('2019-01-02').getTime());

        Chai.expect('123'.digits()).eq(123);
        Chai.expect('d123d'.digits()).eq(123);
        Chai.expect('  1  sdfsdf sdddd 2 gfdg fgg--3'.digits()).eq(123);
        Chai.expect(''.digits()).eq(0);

        Chai.expect('abc'.replaceAt(1, 'x')).eq('axc');
        Chai.expect('05.06.2019'.DMYToYMD()).eq('2019-06-05');
        Chai.expect('2019-06-05'.YMDToDMY()).eq('05.06.2019');

        Chai.expect('das'.HMToInt()).eq(0);
        Chai.expect('00:01'.HMToInt()).eq(60);
        Chai.expect('00:15'.HMToInt()).eq(60 * 15);
        Chai.expect('01:00'.HMToInt()).eq(60 * 60);

        Chai.expect('01:12'.humanTime()).eq('1 h 12 min');
        Chai.expect('01:12:24'.humanTime()).eq('1 h 12 min 24 sec');
        Chai.expect(':'.humanTime()).eq('0 h 0 min');
        Chai.expect(': :'.humanTime()).eq('0 h 0 min 0 sec');

        Chai.expect('[abc]'.between('[', ']')).eq('abc');
        Chai.expect('/abc/'.between('[', ']')).eq('/abc/');
        Chai.expect('/abc/'.between('/', '/')).eq('abc');
        Chai.expect('/abc/def/'.between('/', '/')).eq('abc');
        Chai.expect('aabaabbfgdfgda'.count('a')).eq(5);

        Chai.expect('snake_to_camel'.snakeToCamel()).eq('snakeToCamel');
        Chai.expect('kebab-to-camel'.kebabToCamel()).eq('kebabToCamel');

        Chai.expect('hello world'.maxCharsMatch('hell')).eq(4);
        Chai.expect('hello world'.maxCharsMatch('he')).eq(2);
        Chai.expect('hello world'.maxCharsMatch('abcd')).eq(0);
    });
});
