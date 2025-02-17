import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Paper, Typography } from '@mui/material';
import { auth } from '../../../../Firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const cardStyle = {
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  marginBottom: '20px',
};

const buttonStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
};





export default function Account() {
  const navigator = useNavigate()
  
const handle_signOut = async ()=>{
  await signOut(auth).then((e)=>{
    console.log("User Signed out")
    window.alert("User Loged Out")
    window.location.reload()
  }).catch((E)=>{
    console.log(E)
  })
}


  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <Paper elevation={3} style={{ padding: '30px', marginTop: '30px' }}>
            <Typography variant="h4" gutterBottom>
              Account Information
            </Typography>
            <Card style={cardStyle}>
              {/* Firebase User Details Display */}
              <Typography variant="h6" gutterBottom>
                User Details:
              </Typography>
              {/* Add your Firebase user details here */}
              <div style={{display:"flex",flexDirection:'column',marginTop:10,marginBottom:10}}>
              <Typography sx={{fontWeight:'bold'}}>Email: </Typography><Typography>{auth.currentUser.email}</Typography>
              </div>
              <div style={{display:"flex",flexDirection:'row',marginTop:10,marginBottom:10}}>
              <Typography sx={{fontWeight:'bold',marginRight:2}}>Name: </Typography><Typography> {auth.currentUser.displayName}</Typography>
              </div>
              <div style={{display:"flex",flexDirection:'row',marginTop:10,marginBottom:10}}>
              <Typography sx={{fontWeight:'bold',marginRight:2}}>Email Verified: </Typography><Typography> {auth.currentUser.emailVerified.toString()}</Typography>
              </div>
              {/* Additional user details go here */}

              {/* Update Account Information Button */}
             
              <Button variant="primary" onClick={handle_signOut} style={buttonStyle} className="mt-3">
                Log Out
              </Button>
            </Card>

            {/* Additional sections for account management */}
            {/* Add more Card components for additional sections */}

          </Paper>
        </Col>
      </Row>
    </Container>
  );
}
