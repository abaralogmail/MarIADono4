//const adminPhoneNumbers = ['5493812010781','5491137556119']; // Add all admin numbers here
const adminPhoneNumbers = ['5493812010781']; // Add all admin numbers here

const isAdmin = (phoneNumber) => {
    return adminPhoneNumbers.includes(phoneNumber);
}

const getAdmin = () => {
    return adminPhoneNumbers;
}

module.exports = { isAdmin, getAdmin };

