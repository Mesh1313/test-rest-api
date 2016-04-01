var superagent = require('superagent');
var chai = require('chai');
var expect = chai.expect;

describe('Users', function() {
    it('should respond to post', function() {
        superagent
            .post('http://localhost:3000/api/register')
            .send({ name: 'test', phone: '123-123-1234', email: 'test4@gmail.com', password: '111' })
            .end(function(err, res) {
                expect(res.status).to.equal(200);
                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.property('id');
            });
    });
});