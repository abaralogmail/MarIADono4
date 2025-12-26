//const adminPhoneNumbers = ['5493812010781','5491137556119']; // Add all admin numbers here
const adminPhoneNumbers = ['5493812010781']; // Add all admin numbers here

export const isAdmin = (phoneNumber) => {
    return adminPhoneNumbers.includes(phoneNumber);
}

export const getAdmin = () => {
    return adminPhoneNumbers;
}

// Default export for compatibility
export default { isAdmin, getAdmin };

