import express from "express";
import queries from "../queries/queries.mjs";
import verifyAccessToken from "../middleware/verifyAccessToken.mjs";
import verifyRefreshToken from "../middleware/verifyRefreshToken.mjs";
import util from 'util'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

const router = express.Router();
router.use(cookieParser())

router.post('/testEndpoint', async(req,res) => {  
  console.log('**BEGIN: Activity Router/testEndpoint...')
  const { currentTimestampFromClient, timezoneOffset } = req.body
  const recievedTimestamp = new Date(currentTimestampFromClient)
  console.log('*ActivityRouter* Receieved timestamp: ',recievedTimestamp, '+', timezoneOffset)

  const petId = '20';
  const ownerId = '2';
  const pee = true;
  const poo = false;

  try {
      const response = await queries.testEndpoint(petId, ownerId, recievedTimestamp, pee, poo)
      console.log('*Activity Router* Stored timestamp: ', response) 
      console.log('...Activity Router/testEndpoint** END')
      return res.status(200).json({ result: response })
      
  } catch (error) {
      console.log('Error attempting to store timestamp: ', error)
      console.log('...Activity Router/testEndpoint** END')
      return res.status(400).json({ err: error})
  }
  
})

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

// USE ENCODED DATA
router.get("/get", async (req, res) => {

  const ownerId = req.ownerId
  const encodedData = req.query.data
  if(!encodedData) return res.status(400).json({ error:new Error('No data received') })
  const decodedData = JSON.parse(decodeURIComponent(encodedData))
  const { referencePetId, referenceDate, timeWindowObj } = decodedData
  console.log('Decoded data:', decodedData)
  // console.log('Reference Pet id:')
  console.log(referencePetId)
  let petId
  if(typeof(referencePetId) == 'number') petId = referencePetId
  if(typeof(referencePetId) == 'string') {
    const petIdString = referencePetId.replace(/^"|"$/g, '');
    petId = parseInt(petIdString)
  }

  if(!petId){
    console.log('No pet id found')
    try{
      const singlePetId = await queries.getSingleActivePetId(ownerId);
      if(!singlePetId) throw new Error('No active links found.')
      req.petId = singlePetId
    }catch(error){
      console.log('Error getting single pet Activity:', error)
      return res.status(204)
    }
  }else{
    console.log('Pet ID attached to request')
    req.petId = petId
  }

  try {
    const confirmActiveLink = await queries.checkOwnerLink(ownerId, req.petId);   
    console.log('activityRouter/ get// Active link determined as: ', confirmActiveLink)
    req.activeLink = confirmActiveLink   
  } catch (error) {
    console.log('Error checking link with owner: ', error)
    req.activeLink = false
  }

  if(req.activeLink){
    try {
      const activityArray = await queries.getActivity(petId, referenceDate, timeWindowObj);
      // console.log('Activity array received:', activityArray)
      // console.log('Activity array received',util.inspect(activityArray, { depth: null }));
      const petIdArray = await queries.getOwnersPetIds(ownerId)        
      return res.status(200).json({ activityArray, petIdArray })
      // return res.status(200)
    } catch (error) {
    //   console.log('Error caught getting activity or pet ids:', error)
    //   return res.status(400).json({error})
    // }
    // try {
    //   console.log('Processed request.')
    //   return res.status(400)
    // } catch (error) {
      console.log('Error with get request:', error)
      return res.status(400)
    }
  }else{
    console.log('Initial pet id sent is not linked to owner')
    try {
      const singlePetId = await queries.getSingleActivePetId(ownerId);
      console.log('activityRouter/ get // singlePetId found:', singlePetId)
      if(!singlePetId) throw new Error('No active links found.')
      const activityArray = await queries.getActivity(
        singlePetId,
        referenceDate,
        timeWindowObj
      );
      const petIdArray = await queries.getOwnersPetIds(ownerId)
      return res.status(200).json({activityArray, petIdArray, singlePetId });
    
    } catch (e) {
      console.log('Some error caught: ', e)
      return res.status(204)
    }
  }

  // if a pet ID exists, check if there's a positive link.
  // If not, look for any existing petId to work with.
  // If no ID exists, send a message saying no active pet links
  // if (petId) {
  //   // Confirm active link between owner and pet.
    
  //   if (confirmActiveLink) {
  //     const activityArray = await queries.getActivity(petId, referenceDate, timeWindowObj);
  //     const petIdArray = await queries.getOwnersPetIds(ownerId)
  //     // return res.status(200).json({activityArray, petIdArray});
  //     return res.status(200).json({ activityArray, petIdArray })
  //   } else {
  //     return res.status(401).json({ error: 'Pet and owner are not linked' });
  //   }
  // } else {
  //     try {
  //       const singlePetId = await queries.getSingleActivePetId(ownerId);
  //       const activityArray = await queries.getActivity(
  //         singlePetId,
  //         referenceDate,
  //         timeWindowObj
  //       );
  //       const petIdArray = await queries.getOwnersPetIds(ownerId)
  //       console.log('activityRouter activityArray line 42: ',activityArray)
  //       return res.status(200).json({activityArray, petIdArray, singlePetId });
      
  //     } catch (e) {
  //       console.log('Some error caught: ', e)
  //       return res.status(400).json({ error: e });
  //     } 
  // }

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
  // console.log('**Activity Router** req.body: ', req.body)
  const ownerId = req.ownerId
  // console.log("**Activity Router ** type of petId: ",typeof(req.body.referencePetId))
  const petIdString = req.body.referencePetId.toString().replace(/^"|"$/g, '');
  const petId = parseInt(petIdString)
  const timestampUTCString = req.body.timestampUTCString;
  const { timezoneOffset } = req.body

  // const referenceTimezoneOffset = req.body.referenceTimezoneOffset
  console.log('**Activity Router** referenceDate: ', timestampUTCString)
  const { pee, poo } = req.body.activity
  
  try{
    // console.log('Attempt to add activity is being made.')
    const result = await queries.addActivity(petId, ownerId, timestampUTCString,timezoneOffset, pee,poo)
    // console.log('Line 71, result: ', result)
    const referenceDate = result.reference_date.toISOString()
    console.log('**ActivityRouter/ add** Reference date result split:',referenceDate)
    const referenceDateSplit = referenceDate.split('T')[0]
    console.log('Ref date split:', referenceDateSplit)
    req.referenceDate = referenceDateSplit
  }catch(e){
    console.log('Error adding activity; error code sent to client: ',e)
    return res.status(400).json({error:'Error adding activity to db'})
  }

  try{
    // console.log('*activityRouter* attempting to retrieve singleDayActivity')
    const result = await queries.getSingleDayActivity(petId, req.referenceDate); 
    // console.log('*activityRouter* Result from querying single day activity: ', result)
    console.log(util.inspect(result, { depth: null }))
    return res.status(200).json(result)
  }catch(e){
    console.log('*activityRouter* error getting single day activity: ', e)
    return res.status(400).json({error:e})
  }

});

router.patch("/update", async (req, res) => {
  const { updatedActivity, referencePetId:petId, dateString:referenceDate } = req.body
  console.log('**activityRouter** updatedActivity: ', updatedActivity)
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
  console.log('Decoded Data:', decodedData)
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
