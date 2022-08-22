const appRegion = ['europe-west3'];

const usersCollectionName = 'users';

const UserType = {
    Other: 'other',
    Mondora: 'mondora',
    Fiab: 'fiab',
};

const permissionDeniedMessage = 'permission-denied';

const badRequestDeniedMessage = 'invalid-argument';

const unknownErrorMessage = 'unknown';

class Constant {
    static get appRegion() {
        return appRegion;
    }

    static get usersCollectionName() {
        return usersCollectionName;
    }

    static get permissionDeniedMessage() {
        return permissionDeniedMessage;
    }

    static get badRequestDeniedMessage() {
        return badRequestDeniedMessage;
    }

    static get unknownErrorMessage() {
        return unknownErrorMessage;
    }

    static get UserType() {
        return UserType;
    }
}

module.exports = { Constant };
