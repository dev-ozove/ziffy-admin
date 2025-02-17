import React,{useEffect,useState,useRef} from 'react';
import moment from 'moment';
import {db,storage} from '../../../Firebase'
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";
import Table from 'react-bootstrap/Table';
import { Timestamp, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

function PastMatches(props) {
    const [pageHeader,setPageHeader] = useState(null);
    const [matchList, setMatchList] = useState([]);
    const inputDate1 = useRef(null);
    const inputDate2 = useRef(null);
    const [predictionImage, setPredictionImage] = useState('');
    const predictionImageRef = useRef(null);
    const [open, setOpen] = React.useState(false);
    const [Main_match,set_MainMatch]=useState()

    const [matchName,set_matchName]=useState('')
    const [MatchType,set_MatchType]=useState('')
    const [BetType,set_BetType]=useState('')
    const [matchDate,set_matchDate]=useState('')
    const [betDate,set_betDate]=useState('')
    const [Odd,set_Odd]=useState('')
    const [heading,set_heading]=useState('')
    const [description,set_description]=useState('')


    const [loading,set_loading]=useState(false)
    const [delete_id,set_delete_id]=useState()


    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
  
    /** Delete confirmation Area */
    const [delete_open, setOpendelete] = useState(false);

    const delete_handleClickOpen = () => {
        setOpendelete(true);
    };

    const delete_handleClose = () => {
        setOpendelete(false);
    };



    useEffect(()=>{
        //set dates
        var nowPlus10 = new Date();
        nowPlus10.setMinutes((new Date()).getMinutes()-10)
        var before1Month = new Date();
        before1Month.setMonth(before1Month.getMonth() - 1);
        before1Month.setHours(0, 0, 0, 0);
        //get Matches
        getMatches(before1Month,nowPlus10);
    },[]);

    //Getting data from firebase
    function getMatches(from, to) {
      console.log("getting matches between " + from + to);
  
      const matchCollection = collection(db, "Matches_Test");
  
      const q = query(
          matchCollection,
          where('matchDate', '<=', to),
          where('matchDate', '>=', from),
          orderBy('matchDate', 'desc')
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const li = [];
          querySnapshot.forEach((doc) => {
              li.push({ ...doc.data(), id: doc.id });
          });
          setMatchList(li);
      });
  
      // Set value to header
      setPageHeader("Past Matches from " + moment(from).format('DD-MM-YYYY') + " to " + moment(to).format('DD-MM-YYYY'));
  
      // Remember to call unsubscribe when you no longer need the listener
      // e.g., componentWillUnmount or useEffect cleanup
       //return ()=>{unsubscribe};
  }

    //Update status of match
    async function updateStatus(status,id){
        console.log(status+id)
        const DocRef = doc(db,'Matches_Test',id)
        await updateDoc(DocRef,{
          "status":status,
        })
        .then(()=>{
            //update matches data
            var nowPlus10 = new Date();
            nowPlus10.setMinutes((new Date()).getMinutes()-10)
            var before1Month = new Date();
            before1Month.setMonth(before1Month.getMonth() - 1);
            before1Month.setHours(0, 0, 0, 0);
            getMatches(before1Month,nowPlus10);
            alert("Match updated")
        })
    }

    //Update List
    function updateList(){
       
        const dateFrom = new Date(inputDate1.current.value+" 00:00:00");
        const dateTo = new Date(inputDate2.current.value+" 23:59:59");

        getMatches(dateFrom,dateTo);

        //inputDate1.current.value = null;

        
    }

    function uploadPredictionImage (id){
        if(predictionImage == null)
        return;
        // console.log('Vandesh '+id)
        const storageRef = ref(storage, `/PedictionImage/${new Date()+predictionImage.name}`);
        const uploadTask = uploadBytesResumable(storageRef, predictionImage);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // const percent = Math.round(
                //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                // );
                // // update progress
                // setPercent(percent);
            },
            (err) => console.log(err),
            () => {
                // download url
                getDownloadURL(uploadTask.snapshot.ref).then( async (url) => {
                    //console.log(url);
                    // setMatch({...match,predictionImage:url})
                    const docRef = doc(db,'Matches_Test',id)
                    await updateDoc(docRef,{
                      predictionImage:url
                    })
                    db
                    .then(() => {
                         console.log('Match Updated');
                        //set dates
                        var nowPlus10 = new Date();
                        nowPlus10.setMinutes((new Date()).getMinutes()-10)
                        var before1Month = new Date();
                        before1Month.setMonth(before1Month.getMonth() - 1);
                        before1Month.setHours(0, 0, 0, 0);
                        //get Matches
                        getMatches(before1Month,nowPlus10);
                        alert('Match Updated');
                    });
                });
                //reset input
                predictionImageRef.current.value = null;
                }
            );
    }


    const Edit_data = (match)=>{
        console.log("Edit data ",match)
        set_MainMatch(match)

        set_matchName(match.matchTitle)
        set_MatchType(match.matchType)
        set_BetType(match.betType)
        set_Odd(match.odd)
        set_heading(match.heading)
        set_description(match.description)

        set_matchDate(moment(match.matchDate.toDate()).format('YYYY-MM-DDTHH:mm'))
        set_betDate( moment(match.betDate.toDate()).format('YYYY-MM-DDTHH:mm'))

        handleClickOpen()
    }
    
    const Delete_data =async (id)=>{
        console.log("Delete data ",id)
        set_delete_id(id)
        delete_handleClickOpen(id)
    }
    const Delete_it_from_firestore = async ()=>{
        set_loading(true)
        const docRef = doc(db,"Matches_Test",delete_id)
        await deleteDoc(docRef).then((e)=>{
            set_loading(false)
            window.alert("Data Deleted")
            window.location.reload()
        }).catch((E)=>{
            set_loading(false)
            console.log(E)
            window.alert("Error in deleting data")
        })
    }


    const handle_Chnage = async ()=>{
        set_loading(true)
        const docRef =doc(db,"Matches_Test",Main_match.id)
        await updateDoc(docRef,{
            matchTitle:matchName,
            matchType:MatchType,
            betType:BetType,
            heading:heading,
            description:description,
            odd:Odd,
            matchDate: Timestamp.fromDate(new Date(matchDate.toString())),
            betDate: Timestamp.fromDate(new Date(betDate.toString())),
        }).then((e)=>{
            set_loading(false)
            window.alert("Data Updated")
            handleClose()
        }).catch((e)=>{
            console.log(e)
        })
    }
    function formatDateForInput(date) {
        // Ensure the input value is in the format "YYYY-MM-DDTHH:mm"
        const formattedDate = date ? new Date(date).toISOString().slice(0, 16) : '';        
        return formattedDate;
      }

    return (
        <>
            <div style={{marginTop:'35px'}} className="container">
                <div ><h2 className="text-center mt-3">{pageHeader}</h2></div>
                <div className="d-flex justify-content-center">
                    <input ref={inputDate1} type="date" className="form-control" style={{maxWidth: "370px"}}/>
                    <input ref={inputDate2} type="date" className="form-control ms-2" style={{maxWidth: "370px"}}/>
                    <a className="btn btn-info ms-2" onClick={()=>{updateList()}}>Get Data</a>
                </div>
                <Table striped bordered hover responsive className="mt-5">
                    <thead>
                        <tr>
                            <th>Sr. No</th>
                            <th>Team Images</th>
                            <th>Prediction Image</th>
                            <th>Match Name</th>
                            <th>Match Type</th>
                            <th>Bet Type</th>
                            <th>Match Date</th>
                            <th>Bet Date</th>
                            <th>ODD</th>
                            <th>Status</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        matchList.map((match,index) => {
                                return(
                                <tr>
                                    <td>{index+1}</td>
                                    <td>
                                        <img src={match.team1Image} alt="Image not uploaded" width="50"/>
                                        <img src={match.team2Image} alt="Image not uploaded" width="50"/>
                                    </td>
                                    <td>
                                        <img src={match.predictionImage} alt="Image not uploaded" width="70"/>
                                        <div className="mb-3 row">
                                            <label  className="col-sm-4 col-form-label text-end"></label>
                                            <div className="col-sm-4">
                                                <input type="file" className="form-control" id="" ref={predictionImageRef} onChange={(e)=>{setPredictionImage(e.target.files[0])}}/>
                                                <span className="btn btn-primary" onClick={()=>uploadPredictionImage(match.id)}>Upload</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{match.matchTitle}</td>
                                    <td>{match.matchType}</td>
                                    <td>{match.betType}</td>
                                    <td>{match.matchDate ? moment(match.matchDate.toDate()).format('MMMM Do, h:mm a') : ''}</td>
                                    <td>{match.betDate ? moment(match.betDate.toDate()).format('MMMM Do, h:mm a') : ''}</td>
                                    <td>{match.odd}</td>
                                    <td>
                                        {match.status}
                                        <br/>
                                        <select onChange={(e)=> updateStatus(e.target.value,match.id)}>
                                            <option value="">--Select--</option>
                                            <option value="Win">Win</option>
                                            <option value="Lose">Lose</option>
                                        </select>
                                    </td>
                                    <td><Button onClick={()=>{Edit_data(match)}}>Edit</Button></td>
                                    <td><Button onClick={()=>{Delete_data(match.id)}} variant='contained' color='error'>Delete</Button></td>
                                </tr>
                        )})
                    }
                    </tbody>
                </Table>
                <Dialog
                    open={delete_open}
                    onClose={delete_handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                    {"Delete The past Matches"}
                    </DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Do You Sure Want to delete this match ? If it is deleted it can not be undone.                       
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={delete_handleClose} autoFocus>Disagree</Button>
                    <Button variant='contained' color='error' onClick={Delete_it_from_firestore} >
                        {loading?"Wait...":'Delete'}
                    </Button>
                    </DialogActions>
                </Dialog>


                <Dialog
                    open={open}
                    onClose={handleClose}>
                <DialogTitle>Subscribe</DialogTitle>
                    <DialogContent>
                     <DialogContentText sx={{fontWeight:"Bold"}}>
                      Edit the Match Data
                    </DialogContentText>
                        <TextField value={matchName} onChange={(e)=>{set_matchName(e.currentTarget.value)}} autoFocus required margin="dense"  label="Match Name"  type="text" fullWidth variant="standard"/>
                        <TextField value={heading} onChange={(e)=>{set_heading(e.currentTarget.value)}} autoFocus required margin="dense"  label="Match Name"  type="text" fullWidth variant="standard"/>
                        <TextField value={description} onChange={(e)=>{set_description(e.currentTarget.value)}} autoFocus required margin="dense"  label="Match Name"  type="text" fullWidth variant="standard"/>

                        <TextField value={MatchType} onChange={(e)=>{set_MatchType(e.currentTarget.value)}}  margin="dense"  label="Match Type"  type="text" fullWidth variant="standard"/>
                        <TextField value={BetType}   onChange={(e)=>{set_BetType(e.currentTarget.value)}} margin="dense"  label="Bet Type"  type="text" fullWidth variant="standard"/>
                        <div>
                        <label  className="col-sm-4 col-form-label text-end">Match Date:</label>
                        <input type="datetime-local"  
                               value={formatDateForInput(matchDate)}
                               className="form-control"
                               onChange={(e)=>{set_matchDate(e.currentTarget.value)}} 
                               />
                        </div>
                        <div>
                        <label  className="col-sm-4 col-form-label text-end">Bet Date:</label>
                        <input type="datetime-local"  
                               className="form-control" 
                               value={formatDateForInput(betDate)}   
                               onChange={(e)=>{set_betDate(e.currentTarget.value)}} 
                               />
                        </div>

                        <TextField value={Odd}       onChange={(e)=>{set_Odd(e.currentTarget.value)}} margin="dense"  label="ODD"  type="text" fullWidth variant="standard"/>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handle_Chnage}>{loading ?'Wait...':'Change'}</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default PastMatches;
/**
 * const docRef = doc(db,"Matches_Test",id)
        await deleteDoc(docRef).then((e)=>{
            set_loading(false)
            window.alert("Data Deleted")
            window.location.reload()
        }).catch((E)=>{
            set_loading(false)
            console.log(E)
            window.alert("Error in deleting data")
        })
 * 
 * 
 */


/*
<div>
                        <label  className="col-sm-4 col-form-label text-end">Match Date:</label>
                        <input type="datetime-local"  
                               className="form-control"
                               onChange={(e)=>{set_matchDate(e.currentTarget.value)}} 
                               />
                        </div>
                        
                        <div>
                        <label  className="col-sm-4 col-form-label text-end">Bet Date:</label>
                        <input type="datetime-local"  
                               className="form-control"    
                               onChange={(e)=>{set_betDate(e.currentTarget.value)}} 
                               />
                        </div>
 */


/*
betDate
January 12, 2024 at 12:38:00 PM UTC+5:30
(timestamp)


betType
"Free"
(string)


description
"Both teams will score atleast one goal"
(string)


heading
"✅ Bet: Both Teams To Score - YES"
(string)


matchDate
January 12, 2024 at 7:30:00 PM UTC+5:30
(timestamp)


matchTitle
"Odisha FC 🆚 Bengaluru FC"
(string)


matchType
"Football"
(string)


odd
"1.50"
(string)


predictionImage
"https://firebasestorage.googleapis.com/v0/b/betx-ad052.appspot.com/o/PedictionImage%2FFri%20Jan%2012%202024%2012%3A38%3A47%20GMT%2B0530%20(India%20Standard%20Time)Picsart_24-01-12_12-37-07-960.png?alt=media&token=c8ac7763-7656-4e35-9382-f501e5c9dce6"
(string)


status
"Lose"
(string)


team1Image
"https://firebasestorage.googleapis.com/v0/b/betx-ad052.appspot.com/o/TeamImages%2FFri%20Jan%2012%202024%2012%3A38%3A55%20GMT%2B0530%20(India%20Standard%20Time)dea39ac082ab263ea579b7781e418357a0.png?alt=media&token=3d4a7486-28b3-4abc-8932-07481941d307"
(string)


team2Image
"https://firebasestorage.googleapis.com/v0/b/betx-ad052.appspot.com/o/TeamImages%2FFri%20Jan%2012%202024%2012%3A38%3A57%20GMT%2B0530%20(India%20Standard%20Time)aa716310e3e5459de0c3fda90ed634de33.png?alt=media&token=2bfbcd9e-4d4c-4a70-bb5d-eb95a96edd26"
(string)


vote
"92"
(string)


votecount
572
(number)


votecount_limit
609


*/