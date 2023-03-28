const { ObjectId } = require("mongodb");
const bcrypt = require('bcryptjs');

class UserService {
    constructor(client) {
        this.User = client.db().collection('users');
    }

    //Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractUserData(payload) {
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

    async signUp(payload) {
        const user = this.extractUserData(payload);
        const result = await this.User.insertOne(user);
        return result;
    }

    async findByEmail(email) {
        const user = await this.User.findOne({ email: email });
        return user;
    }

    async signIn(email, password) {
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

    async addToken(userId, token) {
        const result = await this.User.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { token: token } }
        );
        return result.modifiedCount > 0;
    }
    
    async deleteToken(userId, token) {
        const result = await this.User.updateOne(
            { _id: new ObjectId(userId), token: token },
            { $unset: { token: 1 } }
        );
        return result.modifiedCount > 0;
    }
    
      

}
module.exports = UserService;
