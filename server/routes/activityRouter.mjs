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
  const petIdString = referencePetId.replace(/^"|"$/g, '');
  const petId = parseInt(petIdString)

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
  const petIdString = req.body.referencePetId.replace(/^"|"$/g, '');
  const petId = parseInt(petIdString)
  const referenceDate = req.body.referenceDate;
  const { pee, poo } = req.body.activity
  
  try{
    const result = await queries.addActivity(petId, ownerId, referenceDate,pee,poo)
    console.log('Line 71, result: ', result)
  }catch(e){
    return res.status(400).json({error:e})
  }

  try{
    const result = await queries.getSingleDayActivity(petId, referenceDate); 
    console.log('Result from querying single day activity: ', result)
    return res.status(200).json(result)
  }catch(e){
    return res.status(400).json({error:e})
  }

});

router.post("/update", async (req, res) => {
  const updatedActivityDataArray = req.body.updates;
  const petId = req.body.petId;
  const result = await queries.updateActivity(updatedActivityDataArray, petId);
  if (!result.rowCount) return res.send("Error making changes");
  return res.send("Successfully updated");
});

router.post("/delete", async (req, res) => {});

export default router;
