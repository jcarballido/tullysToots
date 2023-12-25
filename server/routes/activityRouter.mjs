import express from 'express'
import queries from '../queries/queries.mjs'

const router = express.Router()

router.post('/getActivity', async (req,res) => {
  const targetDate = req.body.requestedDate
  const activity = await queries.getActivity(targetDate)
  return res.json(activity)
})

router.post('/updateActivity', async (req,res) => {
  const updatedActivityData = req.body.updates
  const result = await queries.updateActivity(updatedActivityData)
  if(result.rowCount) return res.send('Successfully updated')
  else return res.send('Error making changes')
})


export default router