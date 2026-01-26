export const FIELD_PROFILES = {
    firstName: {
        keywords: ["first name", "given name", "forename"],
        negative: ["last", "surname", "family"],
        inputTypes: ["text"],
    },
    lastName: {
        keywords: ["last name", "surname", "family name"],
        negative: ["first", "given"],
        inputTypes: ["text"],
    },
    email: {
        keywords: ["email", "e-mail"],
        inputTypes: ["email", "text"],
    },
    phone: {
        keywords: ["phone", "mobile", "tel"],
        inputTypes: ["tel", "text"],
    },
};
