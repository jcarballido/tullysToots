import express from "express";
import queries from "../queries/queries.mjs";
import verifyAccessToken from "../middleware/verifyAccessToken.mjs";
import verifyRefreshToken from "../middleware/verifyRefreshToken.mjs";
import util from 'util'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

const router = express.Router();
router.use(cookieParser())

router.get('/testInterceptor', (req,res) => {
  console.log('VERIFYING ACCESS TOKEN')
  const accessToken = req.headers['authorization']
  console.log('Access token received: ', accessToken)
  if(!accessToken) return res.status(400).json({error: new Error('Missing access token')})
  const accessSecret = process.env.ACCESS_SECRET
  try{
    const decodeJwt = jwt.verify(accessToken, accessSecret)
    console.log('Decoded JWT: ', decodeJwt)
    const ownerId = decodeJwt.ownerId
    console.log('ownerId: ', ownerId)
    if(!ownerId) return res.status(400).json({ error: new Error('Missing owner ID') })
    return res.status(200).json({ownerId})
    // req.ownerId = ownerId
    // next()
  }catch(e){
    console.log('ERROR VERIFYING: ', e)
    console.log('Response sent err and staus code 400')
    return res.status(400).json({ error: e })
  } 
})

router.use(verifyAccessToken)
// router.use(verifyRefreshToken)

router.get("/get", async (req, res) => {

  const ownerId = req.ownerId;
  const encodedData = req.query.data
  if(!encodedData) return res.status(400).json({ error:new Error('No data received') })
  const decodedData = JSON.parse(decodeURIComponent(encodedData))
  const { referencePetId, referenceDate, timeWindow } = decodedData
  console.log("**Activity Router ** type of petId: ",typeof(referencePetId))
  const petIdString = referencePetId.replace(/^"|"$/g, '');
  const petId = parseInt(petIdString)
  console.log('**Activity Router** petId: ', petId)

  if (petId) {
    // Confirm active link between owner and pet.
    const confirmActiveLink = await queries.checkOwnerLink(ownerId, petId);
    if (confirmActiveLink) {
      const activityArray = await queries.getActivity(petId, referenceDate, timeWindow);
      const petIdArray = await queries.getOwnersPetIds(ownerId)
      return res.status(200).json({activityArray, petIdArray});
    } else {
      return res.status(401).json({ error: confirmActiveLink });
    }
  } else {
    try {
      const singlePetId = await queries.getSingleActivePetId(ownerId);
      const activityArray = await queries.getActivity(
        singlePetId,
        referenceDate,
        timeWindow
      );
      console.log('activityRouter activityArray line 42: ',activityArray)
      return res.status(200).json({activityArray, petIdArray, singlePetId });
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  }
});

router.post("/add", async (req, res) => {
  // const result = await queries.addActivity(
  //   petId,
  //   ownerId,
  //   timestampWithoutTZ,
  //   pee,
  //   poo
  // );
  // if (!result) return res.send("ERROR: Did not save new activity");
  // return res.json({ result });
  const ownerId = req.ownerId
  console.log("**Activity Router ** type of petId: ",typeof(req.body.referencePetId))
  const petIdString = req.body.referencePetId.toString().replace(/^"|"$/g, '');
  const petId = parseInt(petIdString)
  const referenceDate = req.body.referenceDate;
  console.log('**Activity Router** referenceDate: ', referenceDate)
  const { pee, poo } = req.body.activity
  
  try{
    const result = await queries.addActivity(petId, ownerId, referenceDate,pee,poo)
    console.log('Line 71, result: ', result)
  }catch(e){
    console.log('Error adding activity; error code sent to client')
    return res.status(400).json({error:'Error adding activity to db'})
  }

  try{
    const result = await queries.getSingleDayActivity(petId, referenceDate); 
    console.log('Result from querying single day activity: ')
    console.log(util.inspect(result, { depth: null }))
    return res.status(200).json(result)
  }catch(e){
    return res.status(400).json({error:e})
  }

});

router.patch("/update", async (req, res) => {
  const { updatedActivity, referencePetId:petId, dateString:referenceDate } = req.body
  const result = await queries.updateActivity(updatedActivity);
  const { successful:successfulArray,failed:failedArray } = result
  
  if(failedArray.length == updatedActivity.length){
    console.log(result)
    return res.status(400).json({updateError:'Failed to save update(s)'})
  }

  const getSingleDateActivityResult = await queries.getSingleDayActivity(petId, referenceDate)
  return res.status(200).json({getSingleDateActivityResult,successfulArray,failedArray})
});

router.delete("/delete", async (req, res) => {
  // const queryActivityId = req.query.activityId
  // const activityId = parseInt(queryActivityId)
  const encodedData = req.query.data
  if(!encodedData) return res.status(400).json({ error:new Error('No data received') })
  const decodedData = JSON.parse(decodeURIComponent(encodedData))
  const { activityId, referenceDate, referencePetId } = decodedData
  try{

    await queries.deleteActivityById(activityId)
    console.log('Successfully deleted')
  }catch(e){
    console.log('**Activity router, delete request** Error attempting to delete: ',e)
    return res.status(400).json({error:e})
  }

  try{
    const result = await queries.getSingleDayActivity(referencePetId, referenceDate); 
    console.log('Result from querying single day activity: ')
    console.log(util.inspect(result, { depth: null }))
    return res.status(200).json(result)
  }catch(e){
    return res.status(400).json({error:e})
  }
  
});

export default router;
