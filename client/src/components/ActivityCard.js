import React, { useState, useEffect } from 'react'
import DateComponent from './Date'
import timestampParser from '../util/timestampParser'
import axios from '../api/axios'

function ActivityCard({ index, dateString, activityArray, activityMap, setActivity, referencePetId }) {
  // dailyActivity: [ [dateString1,activityArray1],[dateString2, activityArray2],... ] (derived from 'dateMap')
  // activityArray: [id1,id2,id3,...] 
  // activityMap: { id1:{...details1}, id2:{...details2},... }
  const records = activityArray.map( id => activityMap.get(id))

  // const [ records, setRecords ] = useState([])
  const [ newActivity, setNewActivity ] = useState([])
  const [ updateEnabled, setUpdateEnabled ] = useState(false)

  const { dayName,date, monthName, year, isToday, isYesterday } = timestampParser(dateString)

  // records: [ {details1},{details2},... ]
  // details: {activity_id:1, pee: true, poo: false, set_on_at:'2024-10-23',set_by:'hp017'}

  // useEffect( () => {
  //   if(activityArray){
  //     setRecords(activityArray.map( id => activityMap.get(id)))
  //   }
  // },[activityArray])

  const addActivity = (e) => {
    e.preventDefault()
    setNewActivity( prevNewActivity => {
      return [...prevNewActivity,{newId:(prevNewActivity.length+1), setOnAt:new Date(), pee:true,poo:true}]
    })
  }

  const deleteNewActivity = (e, key) => {
    e.preventDefault()
    setNewActivity( prevNewActivity => {
      const updatedNewActivityArray = prevNewActivity.filter( newRecord => {
        return newRecord.newId != key
      })
      return updatedNewActivityArray
    })
  }

  const sendNewActivity = async (e) => {
    e.preventDefault()
    try{
      const response = await axios.post('/activity/add', {referencePetId, referenceDate:dateString})
      // expecting: {'YYYY-MM-DD':[ {},{},... ]}
      const referenceDateActivity = response.data
      setActivity(prevActivity => {
        const updatedActivityArray = prevActivity.map( dailyActivityLog => {
          const dailyActivityDate = Object.keys(dailyActivityLog)[0]
          const referenceDate = Object.keys(referenceDateActivity)[0]
          if(dailyActivityDate == referenceDate){
            return referenceDateActivity
          }else{
            return dailyActivityLog
          }
        })
        return updatedActivityArray
      })
    }catch(e){
      console.log(e)
    }
  }

  const deleteActivity = (e) => {
    e.preventDefault()
  }

  const updatedActivity = (e) => {
    e.preventDefault()
  }

  const enableUpdate = (e) => {
    e.preventDefault()
    setUpdateEnabled(true)
  }

  const sendUpdate = (e) => {
    e.preventDefault()
    setUpdateEnabled(false)
  }


  return(
    <div className='bg-red-600 h-full w-full flex flex-col items-center'>
      <DateComponent dayName={dayName} date={date} monthName={monthName} year={year} isToday={isToday} isYesterday={isYesterday} />
      { records.map( record => {
        console.log('record: ', record)
        console.log('record.activity_id: ', record.activity_id)
        return (
        <div key={record.activity_id} className='max-w-max border-purple-400 border-2 flex items-center justify-center'>
          {record.pet_id}
          {updateEnabled
            ? <button onClick={deleteExistingActivity}>
                DELETE
              </button>
            : null
          }   
        </div>
      )})}
      { newActivity.map( record => {
        console.log('record.newId: ',record.newId)
        return (
          <div key={record.newId} className='max-w-full border-4 border-yellow-700'>
            <button onClick={sendNewActivity}>
              SAVE
            </button>
            <button onClick={(e) => deleteNewActivity(e,record.newId)} >
              CANCEL
            </button>
          </div>
        )
      })}
      <div className='flex justify-center items-center border-black border-2'>
      { updateEnabled
        ? <button onClick={addActivity} className='border-2 border-white rounded-xl'>CONFIRM</button>
        : <div className='flex justify-center items-center'><button onClick={addActivity} className='border-2 border-white rounded-xl max-w-max '>ADD</button></div>
      }
      { records.length > 0 
        ? updateEnabled
          ? <button onClick={sendUpdate} className='border-2 border-red-700 rounded-xl '>CANCEL</button>
          : <button onClick={enableUpdate} className='border-2 border-green-700 rounded-xl'>UPDATE</button>
        :null}  
      </div>
    </div>
  )
}

export default ActivityCard