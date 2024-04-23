import React from 'react'

const ExisitingRecord = ({ record,updateEnabled, openConfirmationModal }) => {

  return (
    <div className='w-full border-[2px] border-solid border-red-400 flex items-start'>
      <Checkbox id={record.id} setNewActivity={setNewActivity} checked={record.pee} activity='pee' />
      <Checkbox id={record.id} setNewActivity={setNewActivity} checked={record.poo} activity='poo' />
      <input type='time' value={time} className='invisible absolute' disabled />
      <div>@</div>
      <div onClick={() => setTimeModalVisible(true)}>{time}</div>
      <button onClick={}>
          SAVE
      </button>
      <button onClick={(e) => deleteNewActivity(e,record.newId)} >
          CANCEL
      </button>
      {updateEnabled
      ? <button onClick={(e) => openConfirmationModal(e, record.activity_id)}>
          DELETE
        </button>
      : null
      }
    </div>
  )
}

export default ExisitingRecord