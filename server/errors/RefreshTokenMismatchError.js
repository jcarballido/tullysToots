class RefreshTokenMismatchError extends Error{
  constructor(message){
    super(message)
    this.name = this.constructor.name
  }
}

export default RefreshTokenMismatchError