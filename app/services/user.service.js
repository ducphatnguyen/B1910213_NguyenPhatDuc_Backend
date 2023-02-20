const bcrypt = require('bcryptjs');

class UserService {
    constructor(client) {
        this.User = client.db().collection('users');
    }

    //Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractConactData(payload) {
        const user = {
            email: payload.email,
            password: bcrypt.hashSync(payload.password, 8),
            name: payload.name,
        };
        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );
        return user;
    }

    async create(payload) {
        const user = this.extractConactData(payload);
        const result = await this.User.insertOne(user);
        return result;
    }

    async findByEmail(email) {
        const user = await this.User.findOne({ email: email });
        return user;
    }

    async login(email, password) {
        const user = await this.User.findOne({ email: email });

        if (!user) {
            return null;
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return null;
        }

        return user;
    }
}
module.exports = UserService;
