import express from 'express'
import queries from '../queries/queries.mjs'
import verifyAccessToken from '../middleware/verifyAccessToken.mjs'
import verifyRefreshToken from '../middleware/verifyRefreshToken.mjs'

// router.use(verifyAccessToken)
// router.use(verifyRefreshToken)

const router = express.Router()

router.post('/get', async (req,res) => {
  const ownerId = req.ownerId
  const targetDate = req.body.referenceDate
  const activityArray = await queries.getActivity(ownerId,targetDate)
  return res.status(200).json(activityArray)
})

router.post('/addActivity', async(req,res) => {

  const result = await queries.addActivity(petId, ownerId, timestampWithoutTZ, pee, poo)
  if(!result) return res.send('ERROR: Did not save new activity')
  return res.json({ result })
})

router.post('/updateActivity', async (req,res) => {
  const updatedActivityDataArray = req.body.updates
  const petId = req.body.petId
  const result = await queries.updateActivity(updatedActivityDataArray, petId)
  if(!result.rowCount) return res.send('Error making changes')
  return res.send('Successfully updated')
})


export default router