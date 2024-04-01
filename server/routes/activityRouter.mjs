import express from "express";
import queries from "../queries/queries.mjs";
import verifyAccessToken from "../middleware/verifyAccessToken.mjs";
import verifyRefreshToken from "../middleware/verifyRefreshToken.mjs";
import util from 'util'
import cookieParser from 'cookie-parser'

const router = express.Router();
router.use(cookieParser())

router.post('/testInterceptor', (req,res) => {
  console.log('Request to "/activity/testInterceptor" received')
  console.log(req.body);
  if(!req.body.someMissingProperty) return res.status(401).send('Returned an error')
  else return res.status(200).send(`someMissingProperty was present: ${req.body.someMissingProperty}`)
})

router.use(verifyAccessToken)
router.use(verifyRefreshToken)

router.post("/get", async (req, res) => {


  const ownerId = req.ownerId;
  
  const petIdString = req.body.referencePetId.replace(/^"|"$/g, '');
  const petId = parseInt(petIdString)
  const referenceDate = req.body.referenceDate;
  const timeWindow = req.body.timeWindow

  if (petId) {
    // Confirm active link between owner and pet.
    const confirmActiveLink = await queries.checkOwnerLink(ownerId, petId);
    if (confirmActiveLink) {
      console.log('Line 28: ', petId, referenceDate, timeWindow)
      const activityArray = await queries.getActivity(petId, referenceDate, timeWindow);
      console.log('activityRouter activityArray line 42: ',activityArray)

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
    console.log('')
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
