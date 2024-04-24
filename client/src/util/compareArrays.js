const compareArr = ( referenceArray, arrayToCompare ) => {
  const updates = []

  referenceArray.map( (element,index) => {
    const elementFromArrayToCompare = arrayToCompare[index]
    if(JSON.stringify(element) == JSON.stringify(elementFromArrayToCompare) ) return
    else{
      const update = {id:element['id']}
      const keys = Object.keys(element)
      const filteredKeys = keys.filter( key => !key.includes('id'))
      filteredKeys.map( key => {
        if(element[key] != elementFromArrayToCompare[key]) update[key] = elementFromArrayToCompare[key]
      })
      updates.push(update)
    } 
  })

  return updates
}

export default compareArr