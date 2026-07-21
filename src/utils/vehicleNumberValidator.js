const validateVehicleNumber = (vehicleNumber) => {

    // Remove spaces and convert to uppercase
    vehicleNumber = vehicleNumber.replace(/\s+/g, "").toUpperCase();

    // Indian Vehicle Number Regex
    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;

    return regex.test(vehicleNumber);
};

module.exports = {
    validateVehicleNumber
};