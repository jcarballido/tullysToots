import pg from 'pg'

const { Pool } = pg

const pool = new Pool()

const text1 = `INSERT INTO activity (userId, petId, meridiem, time_stamp, pee, poo)
VALUES (##,##, AM | PM, YYYYMMDD-13:25, true, false)`
// RETURN: 'Success...'

// UPDATE ACTIVITY - CHANGE, DELETE
// Expecting: petId, #meridiem, #date, #time, #pee, #poo

const text2 = `UPDATE activity 
SET col=new_value
WHERE pet_id=petId
`
//RETURN: 'Success...'

// ADD PET
// Expecting: userId, petName

const text3 = `INSERT INTO pet_id (user_Id, petName)
VALUES (userId, 'petName')`
// RETURN: 'Success...'