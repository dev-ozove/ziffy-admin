import React,{useState,useEffect,useRef} from 'react'
import firebase from 'firebase/compat/app';
import {db,storage} from '../../../Firebase'
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";
import moment from 'moment';
import Table from 'react-bootstrap/Table';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';

const UpcommingMatches = () => {

    const inputImage1Ref = useRef(null);
    const inputImage2Ref = useRef(null);
    const predictionImageRef = useRef(null);

    // const datess  = firebase.firestore.Timestamp.fromDate(new Date('2022-08-24T23:01'));
    // console.log ("date iso string "+datess)
    // console.log("date "+moment().format('yyyy-MM-DDThh:mm'));
    const [matchList, setMatchList] = useState([]);
    const [match, setMatch] = useState({
        betType:'',
        matchType:'',
        matchTitle:'',
        odd:'',
        matchDate:'',
        betDate:'',
        team1Image:'',
        team2Image:'',
        predictionImage:'',
        vote:'',
        votecount:'',
        votecount_limit:'',
        heading:'',
        description:'',
    });
    const [matchId, setMatchId] = useState();

    const [team1Image, setTeam1Image] = useState('');
    const [team2Image, setTeam2Image] = useState('');
    const [predictionImage, setPredictionImage] = useState('');
    
    useEffect(()=>{
        getMatches();
        // deleteUsersByName("8");
    },[]);

    //Getting data from firebase
    function getMatches() {
        const nowPlus10 = new Date();
        nowPlus10.setMinutes(new Date().getMinutes() - 10);
    
        const matchCollection = collection(db, 'Matches_Test');
        const matchQuery = query(matchCollection, where('matchDate', '>=', nowPlus10), orderBy('matchDate', 'desc'));
    
        const li = [];
    
        const unsubscribe = onSnapshot(matchQuery, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                li.push({ ...doc.data(), id: doc.id });
            });
            setMatchList(li);
        });
    
        // Remember to unsubscribe when the component unmounts or when you no longer need the updates.
        // unsubscribe();
    }
    
   
    


// Get form data fromuser
let name,value;
const getMatchData = (event) =>{
    name = event.target.name;
    value = event.target.value;
    if (name === 'votecount') {
        value = parseInt(value); 
    }
    if (name === 'votecount_limit'){
        value = parseInt(value);         
    }

    setMatch({ ...match, [name]: value });
    console.log("get match data", match);
    
}
//save data to firebase
const saveData = async(e) => {
    e.preventDefault();
    if(match.betType && match.matchType && match.matchTitle && match.odd && match.matchDate && match.betDate && match.team1Image && match.team2Image && match.predictionImage && match.vote && match.votecount &&match.heading && match.description){
        const{matchDate,betDate,...matchData} = match;
        try {
            console.log(JSON.stringify(match));
            const docRef = collection(db,"Matches_Test")
            await addDoc(docRef,{
              ...matchData,
              matchDate: Timestamp.fromDate(new Date(matchDate.toString())),
              betDate: Timestamp.fromDate(new Date(betDate.toString())),
            }).then((docRef)=>{
              //Send Notification to all users
              window.alert("Prediction Uploaded to the server")
              sewndNotification('New Prediction Available 💰',`${match.matchType} - ${match.matchTitle}`)
              console.log("Document written with ID: ", docRef.id);
              //set data to empty
              setMatchEmpty();
              //get updated list
              getMatches();
            }) 
            .catch((error) => {
                console.error("Error adding document: ", error);
            });

          } catch (e) {
            console.error("Error adding document: ", e);
          }
    }else{
        window.alert("Please fill all data");
    }
    
}

//Update Datra to firebase
const updateData = async(e) => {
    e.preventDefault();
    if(matchId && match.betType && match.matchType && match.matchTitle && match.odd && match.matchDate && match.betDate ){
        const{matchDate,betDate,...matchData} = match;

        const docRef = doc(db,"Matches_Test",matchId)
        await setDoc(docRef,{
          ...matchData,
          matchDate: Timestamp.fromDate(new Date(matchDate.toString())),
          betDate: Timestamp.fromDate(new Date(betDate.toString())),
  
        })
        .then(() => {
            console.log('Match Updated');
            window.alert("Data Updated")
            //set data to empty
            setMatchEmpty();
            //get updated list
            getMatches();
        });
    }else{
        window.alert("please fill all match data")
    }

}
//Set Edit data
const editData =(match) => {
    //object destructuring
    const{id,matchDate,betDate,...newMatch} = match;
    
    setMatch({...newMatch,
        matchDate:moment(matchDate.toDate()).format('yyyy-MM-DDTHH:mm'),
        betDate:moment(betDate.toDate()).format('yyyy-MM-DDTHH:mm')})
    setMatchId(id)
}

//Make form Empty
const setMatchEmpty = () => {
    setMatch({
        betType:'',
        matchType:'',
        matchTitle:'',
        odd:'',
        matchDate:'',
        betDate:'',
        team1Image:'',
        team2Image:'',
        predictionImage:'',
        vote:'',
        votecount:'',
        votecount_limit:'',
        heading:'',
        description:'',
        
    });
    setMatchId();
}

function uploadTeam1Image (){
    if(team1Image == null)
    return;
    const storageRef = ref(storage, `/TeamImages/${new Date()+team1Image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, team1Image);
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
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                //console.log(url);
                setMatch({...match,team1Image:url})
            });
            //reset input
            inputImage1Ref.current.value = null;
            }
        );
}
function uploadTeam2Image (){
    if(team2Image == null)
    return;
    const storageRef = ref(storage, `/TeamImages/${new Date()+team2Image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, team2Image);
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
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                //console.log(url);
                setMatch({...match,team2Image:url})
            });
            //reset input
            inputImage2Ref.current.value = null;
            }
        );
}

function uploadPredictionImage (){
    if(predictionImage == null)
    return;
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
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                //console.log(url);
                setMatch({...match,predictionImage:url})
            });
            //reset input
            predictionImageRef.current.value = null;
            }
        );
}

const sewndNotification = async (title, body) => {
    console.log('Sending notification to users');
    await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    body: JSON.stringify({
        "notification":{
            "body":body,
            "title":title
          },
          "data": {
        // "message": "This is a Firebase Cloud Messaging Topic Message!",
       },
          "to":"/topics/all"
    }),
    headers: {
    'Content-type': 'application/json; charset=UTF-8',
    'Authorization': 'key=AAAAIM9cRqI:APA91bHGcraWIsSq9ofV_myTquyOGYkXKKoy0UATQbGCU9VFj7yQl_kB_t-PBTb4hwpxZvlcFmPppvXCj2Z8LsZUkxm9k_cZX7l7dUsnilh07pe_Gopgry-7J-Lm1TUIZFH2w3DQpl8D '
    },
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('data from FCM server ',data)
    // setPosts((posts) => [data, ...posts]);
    // setTitle('');
    // setBody('');
    })
    .catch((err) => {
    console.log(err.message);
    });
    };


  return (
    <>
    {/* <a onClick={()=>sewndNotification('title','Body')}>Send notifoication</a> */}
    <div className="container">
        <div className="container mt-5">
            <form>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Bet type:</label>
                    <div className="col-sm-4">
                    <select className="form-control" value={match.betType} name="betType" onChange={getMatchData}>
                        <option value="">--Select--</option>
                        <option value="Premium">Premium</option>
                        <option value="Free">Free</option>
                        <option value="Free-High">Free-High</option>
                    </select>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Match type:</label>
                    <div className="col-sm-4">
                    <select className="form-control" value={match.matchType} name="matchType" onChange={getMatchData}>
                        <option value="">--Select--</option>
                        <option value="AmericanFootball">American Football</option>
                        <option value="AussieRules">Aussie Rules</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Baseball">Baseball</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Boxing">Boxing</option>
                        <option value="Counter Strike">Counter Strike</option>
                        <option value="CS:GO">CS:GO</option>
                        <option value="Cricket">Cricket</option>
                        <option value="Darts">Darts</option>
                        <option value="Dota2">Dota 2</option>
                        <option value="Football">Football</option>
                        <option value="Futsal">Futsal</option>
                        <option value="Handball">Handball</option>
                        <option value="Hockey">Hockey</option>
                        <option value="Ice Hockey">Ice Hockey</option>
                        <option value="Kabbadi">Kabbadi</option>
                        <option value="LeagueofLegends">League of Legends</option>
                        <option value="MMA">MMA</option>
                        <option value="Rugby">Rugby</option>
                        <option value="Snooker">Snooker</option>
                        <option value="Table Tennis">Table Tennis</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Volleyball">Volleyball</option>
                        <option value="WaterPolo">Water Polo</option>
                    </select>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Match Title:</label>
                    <div className="col-sm-4">
                    <input type="text" className="form-control" id="" value={match.matchTitle} name="matchTitle" onChange={getMatchData}/>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Match Date:</label>
                    <div className="col-sm-4">
                    <input type="datetime-local"  className="form-control" id="" value={match.matchDate} name="matchDate" onChange={getMatchData}/>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Bet Date:</label>
                    <div className="col-sm-4">
                    <input type="datetime-local" className="form-control" id="" value={match.betDate} name="betDate" onChange={getMatchData}/>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">ODD:</label>
                    <div className="col-sm-4">
                    <input type="text" className="form-control" id="" value={match.odd} name="odd" onChange={getMatchData} />
                    </div>
                </div>
                <div className='mb-3 row'>
                <label  className="col-sm-4 col-form-label text-end">Vote Winning % :</label>
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="" value={match.vote} name="vote" onChange={getMatchData} />
                    </div>
                </div>

                <div className='mb-3 row'>
                <label  className="col-sm-4 col-form-label text-end">Total vote count :</label>
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="" value={match.votecount} name="votecount" onChange={getMatchData} />
                    </div>
                </div>

                  
                <div className='mb-3 row'>
                <label  className="col-sm-4 col-form-label text-end">Vote Count Limit :</label>
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="" value={match.votecount_limit} name="votecount_limit" onChange={getMatchData} />
                    </div>
                </div>

                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Team 1 Image</label>
                    <div className="col-sm-4">
                    {/* <input type="text" className="form-control" id="" value={match.team1Image} name="team1Image" onChange={getMatchData}/> */}
                    <img src={match.team1Image} alt="Image not uploaded" width="50"/>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end"></label>
                    <div className="col-sm-4">
                        <input type="file" className="form-control" id="" ref={inputImage1Ref} onChange={(e)=>{setTeam1Image(e.target.files[0])}}/>
                        <span className="btn btn-primary" onClick={uploadTeam1Image}>Upload</span>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Team 2 Image</label>
                    <div className="col-sm-4">
                    {/* <input type="text" className="form-control" id="" value={match.team2Image} name="team2Image" onChange={getMatchData}/> */}
                    <img src={match.team2Image} alt="Image not uploaded" width="50"/>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end"></label>
                    <div className="col-sm-4">
                        <input type="file" className="form-control" id="" ref={inputImage2Ref} onChange={(e)=>{setTeam2Image(e.target.files[0])}}/>
                        <span className="btn btn-primary" onClick={uploadTeam2Image}>Upload</span>
                    </div>
                </div>
{/* here */}
                <div className='mb-3 row'>
                <label  className="col-sm-4 col-form-label text-end">Heading</label>
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="" value={match.heading} name="heading" onChange={getMatchData} />
                    </div>
                </div>


                <div className='mb-3 row'>
                <label  className="col-sm-4 col-form-label text-end">Description</label>
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="" value={match.description} name="description" onChange={getMatchData} />
                    </div>
                </div>


{/* end here */}
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end">Prediction Image</label>
                    <div className="col-sm-4">
                    {/* <input type="text" className="form-control" id="" value={match.team2Image} name="team2Image" onChange={getMatchData}/> */}
                    <img src={match.predictionImage} alt="Image not uploaded" width="50"/>
                    </div>
                </div>
                <div className="mb-3 row">
                    <label  className="col-sm-4 col-form-label text-end"></label>
                    <div className="col-sm-4">
                        <input type="file" className="form-control" id="" ref={predictionImageRef} onChange={(e)=>{setPredictionImage(e.target.files[0])}}/>
                        <span className="btn btn-primary" onClick={uploadPredictionImage}>Upload</span>
                    </div>
                </div>
                <div className="d-flex justify-content-center">
                    {matchId?
                        <div className="d-flex flex-column">
                            <button className="btn btn-warning btn-default" onClick={updateData}>Update</button>
                            <button className="btn btn-danger btn-default mt-2" onClick={setMatchEmpty}>Clear</button>
                        </div>
                        :<button className="btn btn-primary btn-default" onClick={saveData}>Submit</button>
                    }
                </div>
                
            </form>
        </div>

        {matchList.length?
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
                        <th>Vote</th>
                        <th>Votecount</th>
                        <th>Action</th>
                        <th>Heading </th>
                        <th>Description </th>

                    </tr>
                </thead>
                <tbody>
                {
                    matchList.map((match,index) => (
                            <tr>
                                <td>{index+1}</td>
                                <td>
                                    
                                    <img src={match.team1Image} alt="Image not uploaded" width="50"/>
                                    <img src={match.team2Image} alt="Image not uploaded" width="50"/>
                                </td>
                                <td>
                                    <img src={match.predictionImage} alt="Image not uploaded" width="60"/>
                                </td>
                                <td>{match.matchTitle}</td>
                                <td>{match.matchType}</td>
                                <td>{match.betType}</td>
                                <td>{match.matchDate ? moment(match.matchDate.toDate()).format('MMMM Do, h:mm a') : ''}</td>
                                <td>{match.betDate ? moment(match.betDate.toDate()).format('MMMM Do, h:mm a') : ''}</td>
                                <td>{match.odd}</td>
                                <td>{match.vote}</td>
                                <td>{match.votecount}</td>
                                <td>{match.heading}</td>
                                <td>{match.description}</td>
                                <td><span className="btn btn-primary" onClick={()=>{editData(match) ;  window.scrollTo(0, 0)}}>Edit</span></td>
                            </tr>
                    ))
                }
                </tbody>
            </Table>
         :<div>
           <hr/>
            <h2 className="text-center"></h2>
            <hr/>
            </div>  }
        
    </div>
    </>
  )
}

export default UpcommingMatches