const calculateAge = (dob) => {
    const currentDate = new Date()
    const birthday = new Date(dob)
    switch (true) {
        case (currentDate.getMonth() > birthday.getMonth()):
            return (currentDate.getFullYear() - birthday.getFullYear())
        case (currentDate.getMonth() < birthday.getMonth()):
            return (currentDate.getFullYear() - birthday.getFullYear() - 1)
        default:
            if (currentDate.getDate() >= birthday.getDate()) {
                return (currentDate.getFullYear() - birthday.getFullYear())
            }
            return (currentDate.getFullYear() - birthday.getFullYear() - 1)
    }
}




export default calculateAge