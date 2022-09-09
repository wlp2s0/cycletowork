const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Constant } = require('./utility/constant');
const {
    createUser,
    deleteUser,
    getUserInfo,
    updateUserInfo,
    sendEmailVerificationCode,
    verifiyEmailCode,
} = require('./service/user');
const {
    getListUserAdmin,
    checkAdminUser,
    setAdminUser,
    verifyUserAdmin,
} = require('./service/admin/user');
const { saveUserActivity, getListUserActivity } = require('./service/activity');
const {
    sendNotification,
    saveDeviceToken,
    removeDeviceToken,
    getListDeviceToken,
} = require('./service/notification');
const { loggerError, loggerLog, loggerDebug } = require('./utility/logger');
const { getString } = require('./localization');
const { elasticSearch } = require('./utility/elastic_search');
const {
    saveCompany,
    getCompanyListNameSearch,
    getCompanyList,
    getCompanyFromName,
} = require('./service/company');
const { updateCompany, verifyCompany } = require('./service/admin/company');
const { saveSurveyResponse } = require('./service/survey');
const { saveSurvey, getSurveyList } = require('./service/admin/survey');
const {
    saveChallenge,
    getChallengeList,
    publishChallenge,
} = require('./service/admin/challenge');
const {
    getActiveChallengeList,
    registerChallenge,
    getListActiveRegisterdChallenge,
    getListRegisterdChallenge,
    updateUserRankingCo2,
    updateCompanyRankingCo2,
    updateCompanyRankingPercentRegistered,
    getListCyclistClassificationByRankingCo2,
    getListCompanyClassificationByRankingCo2,
    getListCompanyClassificationByRankingPercentRegistered,
    getUserCyclistClassification,
    getUserCompanyClassification,
    updateCompanyPercentRegistered,
    getChallengeRegistryFromBusinessEmail,
} = require('./service/challenge');

admin.initializeApp();

exports.updateUserRankingCo2 = functions
    .region(Constant.appRegion)
    .firestore.document(
        `${Constant.challengeCollectionName}/{challengeId}/${Constant.usersCollectionName}/{documentId}`
    )
    .onWrite((change, context) => {
        const challengeId = context.params.challengeId;
        return updateUserRankingCo2(challengeId);
    });

exports.updateCompanyRankingCo2 = functions
    .region(Constant.appRegion)
    .firestore.document(
        `${Constant.challengeCollectionName}/{challengeId}/${Constant.companyCollectionName}/{documentId}`
    )
    .onWrite((change, context) => {
        const challengeId = context.params.challengeId;
        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (
            newValue.co2 != previousValue.co2 ||
            newValue.distance != previousValue.distance
        ) {
            return updateCompanyRankingCo2(challengeId);
        }
    });

exports.updateCompanyPercentRegistered = functions
    .region(Constant.appRegion)
    .firestore.document(
        `${Constant.challengeCollectionName}/{challengeId}/${Constant.companyCollectionName}/{documentId}`
    )
    .onUpdate((change, context) => {
        const challengeId = context.params.challengeId;
        const documentId = context.params.documentId;

        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (
            newValue.employeesNumberRegistered !=
            previousValue.employeesNumberRegistered
        ) {
            updateCompanyPercentRegistered(challengeId, documentId, newValue);
        }
    });

exports.updateMicroCompanyRankingPercentRegistered = functions
    .region(Constant.appRegion)
    .firestore.document(
        `${Constant.challengeCollectionName}/{challengeId}/${Constant.microCompanyCollectionName}/{documentId}`
    )
    .onUpdate((change, context) => {
        const challengeId = context.params.challengeId;

        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.percentRegistered != previousValue.percentRegistered) {
            const companyCollectionForSizeCategory =
                Constant.getCompanyCollectionForSizeCategory(
                    newValue.employeesNumber
                );

            return updateCompanyRankingPercentRegistered(
                challengeId,
                companyCollectionForSizeCategory
            );
        }
    });

exports.updateSmallCompanyRankingPercentRegistered = functions
    .region(Constant.appRegion)
    .firestore.document(
        `${Constant.challengeCollectionName}/{challengeId}/${Constant.smallCompanyCollectionName}/{documentId}`
    )
    .onUpdate((change, context) => {
        const challengeId = context.params.challengeId;

        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.percentRegistered != previousValue.percentRegistered) {
            const companyCollectionForSizeCategory =
                Constant.getCompanyCollectionForSizeCategory(
                    newValue.employeesNumber
                );

            return updateCompanyRankingPercentRegistered(
                challengeId,
                companyCollectionForSizeCategory
            );
        }
    });

exports.updateMediumCompanyRankingPercentRegistered = functions
    .region(Constant.appRegion)
    .firestore.document(
        `${Constant.challengeCollectionName}/{challengeId}/${Constant.mediumCompanyCollectionName}/{documentId}`
    )
    .onUpdate((change, context) => {
        const challengeId = context.params.challengeId;

        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.percentRegistered != previousValue.percentRegistered) {
            const companyCollectionForSizeCategory =
                Constant.getCompanyCollectionForSizeCategory(
                    newValue.employeesNumber
                );

            return updateCompanyRankingPercentRegistered(
                challengeId,
                companyCollectionForSizeCategory
            );
        }
    });

exports.updateLargeCompanyRankingPercentRegistered = functions
    .region(Constant.appRegion)
    .firestore.document(
        `${Constant.challengeCollectionName}/{challengeId}/${Constant.largeCompanyCollectionName}/{documentId}`
    )
    .onUpdate((change, context) => {
        const challengeId = context.params.challengeId;

        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.percentRegistered != previousValue.percentRegistered) {
            const companyCollectionForSizeCategory =
                Constant.getCompanyCollectionForSizeCategory(
                    newValue.employeesNumber
                );

            return updateCompanyRankingPercentRegistered(
                challengeId,
                companyCollectionForSizeCategory
            );
        }
    });

exports.onCreateUser = functions
    .region(Constant.appRegion)
    .auth.user()
    .onCreate(async (user) => {
        await createUser(user);
    });

exports.onDeleteUser = functions
    .region(Constant.appRegion)
    .auth.user()
    .onDelete(async (user) => {
        await deleteUser(user);
    });

exports.onCompanyCreated = functions
    .region(Constant.appRegion)
    .firestore.document(`${Constant.companyCollectionName}/{id}`)
    .onCreate(async (snap, context) => {
        const id = context.params.id;
        const company = snap.data();

        elasticSearch.index({
            index: Constant.companyCollectionName,
            id,
            body: company,
        });
    });

exports.saveDeviceToken = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const deviceToken = data.deviceToken;
        if (uid) {
            if (!deviceToken || deviceToken == '') {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                await saveDeviceToken(uid, deviceToken);
                return true;
            } catch (error) {
                loggerError(
                    'saveDeviceToken Error, UID:',
                    uid,
                    'deviceToken:',
                    deviceToken,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.removeDeviceToken = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const deviceToken = data.deviceToken;
        if (uid) {
            if (!deviceToken || deviceToken == '') {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                await removeDeviceToken(deviceToken);
                return true;
            } catch (error) {
                loggerError(
                    'removeDeviceToken Error, UID:',
                    uid,
                    'deviceToken:',
                    deviceToken,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getUserInfo = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            try {
                return await getUserInfo(uid);
            } catch (error) {
                loggerError('getUserInfo Error, UID:', uid, 'error:', error);
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.saveCompany = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const company = data.company;
        if (uid) {
            if (!company) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            loggerLog('saveCompany UID:', uid, 'company:', company);
            try {
                await saveCompany(company);
                return true;
            } catch (error) {
                loggerError(
                    'saveCompany Error, UID:',
                    uid,
                    'company:',
                    company,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getCompanyListNameSearch = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const name = data.name;

        if (uid) {
            if (!name) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            loggerLog('getCompanyListNameSearch UID:', uid, 'name:', name);
            try {
                return await getCompanyListNameSearch(name);
            } catch (error) {
                loggerError(
                    'getCompanyListNameSearch Error, UID:',
                    uid,
                    'name:',
                    name,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getCompanyFromName = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.companyName) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const companyName = data.companyName;

            loggerLog('getCompanyFromName UID:', uid, 'data:', data);
            try {
                return await getCompanyFromName(companyName);
            } catch (error) {
                loggerError(
                    'getCompanyFromName Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getCompanyList = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.pagination) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const pageSize = data.pagination.pageSize;
            const lastCompanyName = data.pagination.lastCompanyName;

            loggerLog('getCompanyList UID:', uid, 'data:', data);
            try {
                return await getCompanyList(lastCompanyName, pageSize);
            } catch (error) {
                loggerError(
                    'getCompanyList Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getSurveyList = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.pagination) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const pageSize = data.pagination.pageSize;
            const lastSurveyName = data.pagination.lastSurveyName;

            loggerLog('getSurveyList UID:', uid, 'data:', data);
            try {
                return await getSurveyList(lastSurveyName, pageSize);
            } catch (error) {
                loggerError(
                    'getSurveyList Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getActiveChallengeList = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            loggerLog('getActiveChallengeList UID:', uid, 'data: ', data);
            try {
                const result = await getActiveChallengeList();
                if (result && result.length) {
                    const user = await getUserInfo(uid);
                    if (
                        user &&
                        user.listChallengeIdRegister &&
                        user.listChallengeIdRegister.length
                    ) {
                        const addedChallenges = user.listChallengeIdRegister;
                        return result.filter(
                            (el) => addedChallenges.indexOf(el.id) < 0
                        );
                    } else {
                        return result;
                    }
                } else {
                    return [];
                }
            } catch (error) {
                loggerError(
                    'getActiveChallengeList Error, UID:',
                    uid,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.saveSurveyResponse = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        if (uid) {
            if (!data) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                const challenge = data.challenge;
                const surveyResponse = data.surveyResponse;

                loggerLog('saveSurveyResponse, UID:', uid, 'data:', data);
                await saveSurveyResponse(challenge, surveyResponse);
                return true;
            } catch (error) {
                loggerError(
                    'saveSurveyResponse Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.sendEmailVerificationCode = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        if (uid) {
            if (!data) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                const email = data.email;
                const displayName = data.displayName;

                loggerLog(
                    'sendEmailVerificationCode, UID:',
                    uid,
                    'data:',
                    data
                );
                await sendEmailVerificationCode(uid, email, displayName);
                return true;
            } catch (error) {
                loggerError(
                    'sendEmailVerificationCode Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.verifiyEmailCode = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        if (uid) {
            if (!data) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                const email = data.email;
                const code = data.code;

                loggerLog('verifiyEmailCode, UID:', uid, 'data:', data);
                await verifiyEmailCode(uid, email, code);
                return true;
            } catch (error) {
                loggerError(
                    'verifiyEmailCode Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.registerChallenge = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        if (uid) {
            if (!data) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                const challengeRegistry = data.challengeRegistry;

                loggerLog('registerChallenge, UID:', uid, 'data:', data);
                await registerChallenge(uid, challengeRegistry);
                return true;
            } catch (error) {
                loggerError(
                    'registerChallenge Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.saveUserActivity = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const userActivity = data.userActivity;
        if (uid) {
            if (!userActivity) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                await saveUserActivity(uid, userActivity);
                return true;
            } catch (error) {
                loggerError(
                    'saveUserActivity Error, UID:',
                    uid,
                    'userActivity:',
                    userActivity,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getListUserActivity = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.pagination) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const pageSize = data.pagination.pageSize;
            const startDate = data.pagination.startDate;

            loggerLog('getListUserActivity UID:', uid, 'data:', data);
            try {
                return await getListUserActivity(uid, startDate, pageSize);
            } catch (error) {
                loggerError(
                    'getListUserActivity Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getListActiveRegisterdChallenge = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            loggerLog(
                'getListActiveRegisterdChallenge UID:',
                uid,
                'data: ',
                data
            );
            try {
                return await getListActiveRegisterdChallenge(uid);
            } catch (error) {
                loggerError(
                    'getListActiveRegisterdChallenge Error, UID:',
                    uid,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getListCyclistClassificationByRankingCo2 = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.pagination || !data.challengeId) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const challengeId = data.challengeId;
            const pageSize = data.pagination.pageSize;
            const lastRankingCo2 = data.pagination.lastRankingCo2;

            loggerLog(
                'getListCyclistClassificationByRankingCo2 UID:',
                uid,
                'challengeId:',
                challengeId,
                'data:',
                data
            );
            try {
                return await getListCyclistClassificationByRankingCo2(
                    challengeId,
                    lastRankingCo2,
                    pageSize
                );
            } catch (error) {
                loggerError(
                    'getListCyclistClassificationByRankingCo2 Error, UID:',
                    uid,
                    'challengeId:',
                    challengeId,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getListCompanyClassificationByRankingCo2 = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.pagination || !data.challengeId) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const challengeId = data.challengeId;
            const pageSize = data.pagination.pageSize;
            const lastRankingCo2 = data.pagination.lastRankingCo2;

            loggerLog(
                'getListCompanyClassificationByRankingCo2 UID:',
                uid,
                'challengeId:',
                challengeId,
                'data:',
                data
            );
            try {
                return await getListCompanyClassificationByRankingCo2(
                    challengeId,
                    lastRankingCo2,
                    pageSize
                );
            } catch (error) {
                loggerError(
                    'getListCompanyClassificationByRankingCo2 Error, UID:',
                    uid,
                    'challengeId:',
                    challengeId,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getListCompanyClassificationByRankingPercentRegistered = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (
                !data ||
                !data.pagination ||
                !data.challengeId ||
                !data.companyEmployeesNumber
            ) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const challengeId = data.challengeId;
            const companyEmployeesNumber = data.companyEmployeesNumber;
            const pageSize = data.pagination.pageSize;
            const lastPercentRegistered = data.pagination.lastPercentRegistered;

            loggerLog(
                'getListCompanyClassificationByRankingPercentRegistered UID:',
                uid,
                'challengeId:',
                challengeId,
                'companyEmployeesNumber:',
                companyEmployeesNumber,
                'data:',
                data
            );
            try {
                return await getListCompanyClassificationByRankingPercentRegistered(
                    challengeId,
                    lastPercentRegistered,
                    pageSize,
                    companyEmployeesNumber
                );
            } catch (error) {
                loggerError(
                    'getListCompanyClassificationByRankingPercentRegistered Error, UID:',
                    uid,
                    'challengeId:',
                    challengeId,
                    'companyEmployeesNumber:',
                    companyEmployeesNumber,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getChallengeRegistryFromBusinessEmail = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.challengeId || !data.businessEmail) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const challengeId = data.challengeId;
            const businessEmail = data.businessEmail;
            loggerLog(
                'getChallengeRegistryFromBusinessEmail UID:',
                uid,
                'challengeId:',
                challengeId,
                'data:',
                data
            );
            try {
                return await getChallengeRegistryFromBusinessEmail(
                    challengeId,
                    businessEmail
                );
            } catch (error) {
                loggerError(
                    'getChallengeRegistryFromBusinessEmail Error, UID:',
                    uid,
                    'challengeId:',
                    challengeId,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getUserCyclistClassification = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.challengeId) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const challengeId = data.challengeId;
            loggerLog(
                'getUserCyclistClassification UID:',
                uid,
                'challengeId:',
                challengeId,
                'data:',
                data
            );
            try {
                return await getUserCyclistClassification(challengeId, uid);
            } catch (error) {
                loggerError(
                    'getUserCyclistClassification Error, UID:',
                    uid,
                    'challengeId:',
                    challengeId,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getUserCompanyClassification = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.challengeId || !data.companyId) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const challengeId = data.challengeId;
            const companyId = data.companyId;
            loggerLog(
                'getUserCompanyClassification UID:',
                uid,
                'challengeId:',
                challengeId,
                'data:',
                data
            );
            try {
                return await getUserCompanyClassification(
                    challengeId,
                    companyId
                );
            } catch (error) {
                loggerError(
                    'getUserCompanyClassification Error, UID:',
                    uid,
                    'challengeId:',
                    challengeId,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getListRegisterdChallenge = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            loggerLog('getListRegisterdChallenge UID:', uid, 'data: ', data);
            try {
                return await getListRegisterdChallenge(uid);
            } catch (error) {
                loggerError(
                    'getListRegisterdChallenge Error, UID:',
                    uid,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.updateUserInfo = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        if (uid) {
            if (!data) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                loggerLog('updateUserInfo, UID:', uid, 'data:', data);
                await updateUserInfo(uid, data);
                return true;
            } catch (error) {
                loggerError(
                    'updateUserInfo Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

// **** ADMIN FUNCTIONS **** //
exports.getListUserAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            if (!data || !data.pagination) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const pageSize = data.pagination.pageSize;
            const nextPageToken = data.pagination.nextPageToken;

            try {
                loggerLog(
                    'getListUserAdmin, UID:',
                    uid,
                    'pageSize:',
                    pageSize,
                    'nextPageToken:',
                    nextPageToken,
                    'data.filter:',
                    data.filter
                );
                return await getListUserAdmin(
                    nextPageToken,
                    pageSize,
                    data.filter
                );
            } catch (error) {
                loggerError(
                    'getListUserAdmin Error, UID:',
                    uid,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getUserInfoAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const adminUid = context.auth.uid;
        const uid = data.uid;

        if (!adminUid) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
        loggerLog('getUserInfoAdmin UID:', uid, 'Admin UID:', adminUid);
        const isAdmin = await checkAdminUser(adminUid);
        if (!isAdmin) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }

        if (!uid || uid == '') {
            throw new functions.https.HttpsError(
                Constant.badRequestDeniedMessage
            );
        }

        try {
            return await getUserInfo(uid);
        } catch (error) {
            loggerError('getUserInfoAdmin Error, UID:', uid, 'error:', error);
            throw new functions.https.HttpsError(Constant.unknownErrorMessage);
        }
    });

exports.setAdminUser = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const adminUid = context.auth.uid;
        const uid = data.uid;

        if (!adminUid) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
        loggerLog('setAdminUser UID:', uid, 'Admin UID:', adminUid);
        const isAdmin = await checkAdminUser(adminUid);
        if (!isAdmin) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }

        if (!uid || uid == '') {
            throw new functions.https.HttpsError(
                Constant.badRequestDeniedMessage
            );
        }

        try {
            await setAdminUser(uid);

            const user = await getUserInfo(uid);
            const listDeviceToken = await getListDeviceToken(uid);
            if (user && listDeviceToken && listDeviceToken.length) {
                const language = user.language;
                const congratulation = getString(language, 'congratulation');
                const title = `${congratulation} ${
                    user.displayName ? user.displayName : ''
                }`;
                const description = getString(
                    language,
                    'you_have_become_admin'
                );

                await sendNotification(listDeviceToken, title, description);
            }

            return true;
        } catch (error) {
            loggerError('setAdminUser Error, UID:', uid, 'error:', error);
            throw new functions.https.HttpsError(Constant.unknownErrorMessage);
        }
    });

exports.verifyUserAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const adminUid = context.auth.uid;
        const uid = data.uid;

        if (!adminUid) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
        loggerLog('verifyUserAdmin UID:', uid, 'Admin UID:', adminUid);
        const isAdmin = await checkAdminUser(adminUid);
        if (!isAdmin) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }

        if (!uid || uid == '') {
            throw new functions.https.HttpsError(
                Constant.badRequestDeniedMessage
            );
        }

        try {
            await verifyUserAdmin(uid);

            const user = await getUserInfo(uid);
            const listDeviceToken = await getListDeviceToken(uid);
            if (user && listDeviceToken && listDeviceToken.length) {
                const language = user.language;
                const congratulation = getString(language, 'congratulation');
                const title = `${congratulation} ${
                    user.displayName ? user.displayName : ''
                }`;
                const description = getString(
                    language,
                    'you_have_been_verified'
                );

                await sendNotification(listDeviceToken, title, description);
            }

            return true;
        } catch (error) {
            loggerError('verifyUserAdmin Error, UID:', uid, 'error:', error);
            throw new functions.https.HttpsError(Constant.unknownErrorMessage);
        }
    });

exports.verifyCompanyAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const adminUid = context.auth.uid;
        const company = data.company;

        if (!adminUid) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
        loggerLog('verifyCompanyAdmin Admin UID:', adminUid, 'data:', data);
        const isAdmin = await checkAdminUser(adminUid);
        if (!isAdmin) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }

        if (!company || company == '') {
            throw new functions.https.HttpsError(
                Constant.badRequestDeniedMessage
            );
        }

        try {
            await verifyCompany(company);

            if (!company.registerUserUid) {
                return true;
            }

            const user = await getUserInfo(company.registerUserUid);
            const listDeviceToken = await getListDeviceToken(
                company.registerUserUid
            );
            if (user && listDeviceToken && listDeviceToken.length) {
                const language = user.language;
                const congratulation = getString(language, 'congratulation');
                const title = `${congratulation} ${
                    user.displayName ? user.displayName : ''
                }`;
                const theCompany = getString(language, 'the_company');
                const hasBeenVerified = getString(
                    language,
                    'has_been_verified_for_company'
                );
                const description = `${theCompany} ${
                    company.name
                } ${hasBeenVerified.toLowerCase()}`;

                await sendNotification(listDeviceToken, title, description);
            }

            return true;
        } catch (error) {
            loggerError(
                'verifyCompanyAdmin Error, UID:',
                adminUid,
                'data:',
                data,
                'error:',
                error
            );
            throw new functions.https.HttpsError(Constant.unknownErrorMessage);
        }
    });

exports.updateCompanyAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const company = data.company;
        if (uid) {
            loggerLog('updateCompanyAdmin UID:', uid, 'company:', company);
            const isAdmin = await checkAdminUser(uid);
            if (!isAdmin) {
                throw new functions.https.HttpsError(
                    Constant.permissionDeniedMessage
                );
            }
            if (!company) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                await updateCompany(company);
                return true;
            } catch (error) {
                loggerError(
                    'updateCompanyAdmin Error, UID:',
                    uid,
                    'company:',
                    company,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.saveSurveyAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const survey = data.survey;
        if (uid) {
            loggerLog('saveSurveyAdmin UID:', uid, 'survey:', survey);
            const isAdmin = await checkAdminUser(uid);
            if (!isAdmin) {
                throw new functions.https.HttpsError(
                    Constant.permissionDeniedMessage
                );
            }
            if (!survey) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                await saveSurvey(survey);
                return true;
            } catch (error) {
                loggerError(
                    'saveSurveyAdmin Error, UID:',
                    uid,
                    'survey:',
                    survey,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.saveChallengeAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;
        const challenge = data.challenge;
        if (uid) {
            loggerLog('saveChallengeAdmin UID:', uid, 'challenge:', challenge);
            const isAdmin = await checkAdminUser(uid);
            if (!isAdmin) {
                throw new functions.https.HttpsError(
                    Constant.permissionDeniedMessage
                );
            }
            if (!challenge) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }
            try {
                await saveChallenge(challenge);
                return true;
            } catch (error) {
                loggerError(
                    'saveChallengeAdmin Error, UID:',
                    uid,
                    'challenge:',
                    challenge,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.getChallengeListAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const uid = context.auth.uid;

        if (uid) {
            const isAdmin = await checkAdminUser(uid);
            if (!isAdmin) {
                throw new functions.https.HttpsError(
                    Constant.permissionDeniedMessage
                );
            }

            if (!data || !data.pagination) {
                throw new functions.https.HttpsError(
                    Constant.badRequestDeniedMessage
                );
            }

            const pageSize = data.pagination.pageSize;
            const lastChallengeName = data.pagination.lastChallengeName;

            loggerLog('getChallengeListAdmin UID:', uid, 'data:', data);
            try {
                return await getChallengeList(lastChallengeName, pageSize);
            } catch (error) {
                loggerError(
                    'getChallengeListAdmin Error, UID:',
                    uid,
                    'data:',
                    data,
                    'error:',
                    error
                );
                throw new functions.https.HttpsError(
                    Constant.unknownErrorMessage
                );
            }
        } else {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
    });

exports.publishChallengeAdmin = functions
    .region(Constant.appRegion)
    .https.onCall(async (data, context) => {
        const adminUid = context.auth.uid;
        const challenge = data.challenge;

        if (!adminUid) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }
        loggerLog(
            'publishChallengeAdmin UID:',
            adminUid,
            'challenge:',
            challenge
        );
        const isAdmin = await checkAdminUser(adminUid);
        if (!isAdmin) {
            throw new functions.https.HttpsError(
                Constant.permissionDeniedMessage
            );
        }

        if (!challenge || challenge == '') {
            throw new functions.https.HttpsError(
                Constant.badRequestDeniedMessage
            );
        }

        try {
            await publishChallenge(challenge);

            let sentToAllUser = false;
            let nextPageToken;
            const UserSlot = 1000;
            while (!sentToAllUser) {
                try {
                    const result = await getListUserAdmin(
                        nextPageToken,
                        UserSlot
                    );

                    if (result) {
                        if (
                            result.pagination &&
                            result.pagination.hasNextPage
                        ) {
                            nextPageToken = result.pagination.nextPageToken;
                        } else {
                            sentToAllUser = true;
                        }

                        const allUserSlot = result.users;
                        for (
                            let index = 0;
                            index < allUserSlot.length;
                            index++
                        ) {
                            const userUid = allUserSlot[index].uid;

                            const user = await getUserInfo(userUid);
                            const listDeviceToken = await getListDeviceToken(
                                userUid
                            );
                            if (
                                user &&
                                listDeviceToken &&
                                listDeviceToken.length
                            ) {
                                const language = user.language;
                                const title = getString(
                                    language,
                                    'new_challenge_opened'
                                );
                                const signUpNow = getString(
                                    language,
                                    'sign_up_now'
                                );
                                const description = `${signUpNow} ${
                                    user.displayName ? user.displayName : '!'
                                }`;

                                const data = {
                                    type: 'new_challenge',
                                };

                                await sendNotification(
                                    listDeviceToken,
                                    title,
                                    description,
                                    data
                                );
                            }
                        }
                    }
                } catch (error) {
                    loggerError(
                        'publishChallengeAdmin SendNotification Error, UID:',
                        adminUid,
                        'error:',
                        error
                    );
                }
            }

            return true;
        } catch (error) {
            loggerError(
                'publishChallengeAdmin Error, UID:',
                adminUid,
                'error:',
                error
            );
            throw new functions.https.HttpsError(Constant.unknownErrorMessage);
        }
    });
