import React, { useEffect, useState } from 'react'
import './Email_Verification.css'
import { useAuth } from '../../Context/AuthContext'
import { Alert, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function EmailVerification() {
  const {success,error,set_Error,set_success,send_verification_link,SignOut_delete_user} = useAuth()
  const [email,set_email]=useState('')
  const [password,set_password]=useState('')
  const navigator = useNavigate()


  const clearMessages = ()=>{
    set_Error('')
    set_success('')
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if(success!==''|| error !==''){
        clearMessages()
      }
    }, 4000)
    return () => clearTimeout(timeout)
  }, [success, clearMessages])


  const handle_Verify = ()=>{
      console.log("Email Verification function")
      send_verification_link()
  }

 
  const handle_signout = async ()=>{
  await await  SignOut_delete_user()
   window.location.reload()
  }


  return (
    <>
    <div style={{
      backgroundColor:'#23262F',
      height:'100vh',
      width:'100vw',
    }}>
    <div>
    <form className="Email_verification">
      <div style={{margin:10}}>
      
      { error !==''&& 
      <Alert variant="outlined" severity="error">
        {error}
      </Alert>
      }
      { success !=='' && 
      <Alert variant='outlined' severity='success'>
        {success}
      </Alert>
      }
      </div>
        <div style={{
            display: "flex",
            flexDirection:'column',
            justifyContent:"space-evenly"
        }}>
            <div>We have sent the Verification Email in your Account. Please Verify it</div>
        </div>
        <div style={{marginTop:20}}>
          <Button 
            sx={{backgroundColor:"#23262F",marginLeft:5,marginRight:5,marginTop:5}} 
            variant='contained' 
            onClick={handle_Verify}>Verify</Button>
        </div>
        <div style={{marginTop:25,
                    display:'flex',
                    cursor:"pointer",
                    justifyContent:'center',
                    backgroundColor:'#23262F',
                    borderRadius:10,
                    padding:5}}>
        <div onClick={handle_signout} style={{color:'white',marginLeft:10}}>Sign Out Your Account</div>  
      </div>
    </form>
    </div>
  </div>
</>
  )
}
