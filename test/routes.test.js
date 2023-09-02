const createServer = require("../server")
const dbo = require("../database/conn");
const supertest = require('supertest');

beforeEach(() => {
    dbo.connect(function (err) {
        if (err) console.log(err);
    });
});

afterEach(() => {
    dbo.getDb().close();
});

const app = createServer()

test("GET /", async () => {
    await supertest(app)
        .get('/')
        .expect(200)
        .then((response) => {
            expect(response.body[0].id).toBe(6)
            expect(Array.isArray(response.body)).toBeTruthy()
        }
        );
});

test("Get /:id", async () => {
    await supertest(app)
        .get('/6')
        .expect(200)
        .then((response) => {
            expect(response.body.id).toBe(6)
        }
        );
}
);

test("DELETE /delete/:id", async () => {
    await supertest(app)
        .delete('/delete/24')
        .expect(200)
        .then((response) => {
            expect(response.body.message).toBe("Record deleted successfully.")
        }
        );
});

