import React,{useEffect,useState,useRef} from 'react';
import {db,storage} from '../../../Firebase';
import { ref, uploadBytesResumable, getDownloadURL,deleteObject } from "firebase/storage";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy } from 'firebase/firestore';

function Banner(props) {
    const inputRef = useRef(null);
    const [bannerList, setBannerList] = useState([]);
    const [file, setFile] = useState("");
    const [percent, setPercent] = useState(0);

    useEffect(()=>{
        getBanners();
    },[]);

    // Handle file upload event and update state
    function handleChange(event) {
        setFile(event.target.files[0]);
    }
    const handleUpload = () => {
        if (!file) {
            alert("Please upload an image first!");
        }else{

            const storageRef = ref(storage, `/Slider Images/${new Date()+file.name}`);
    
            // progress can be paused and resumed. It also exposes progress updates.
            // Receives the storage reference and the file to upload.
            const uploadTask = uploadBytesResumable(storageRef, file);
    
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const percent = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
    
                    // update progress
                    setPercent(percent);
                },
                (err) => console.log(err),
                () => {
                    // download url
                    getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
                        //console.log(url);
                        //Set to firebase database
                        const docRef = collection(db,"BannerImages")
                        await addDoc(docRef,{
                          image: url,
                          dateTime : new Date()
                        })
                        .then(() => {
                        alert('Image added!');
                        //Set file to empty
                        setFile("");
                        inputRef.current.value = null;
                        });
                        //get Updated Data
                        getBanners ()
                    });
                
                    }
                );

        }
    };

   async function getBanners() {
    
    const li = [];
      const bannerCollection = collection(db, "BannerImages");    
     // const docRef = orderBy(bannerCollection,'dateTime','desc')
     await getDocs(bannerCollection).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.data())

        li.push({ ...doc.data(), id: doc.id });
      });
      setBannerList(li);
    });


      /*
      await getDocs(bannerCollection).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(doc.data())

          li.push({ ...doc.data(), id: doc.id });
        });
        console.log("li:", li);
        setBannerList(li);
      });
      */
    }

    //for delete file from database and storage
    function deleteFile(banner) {
      const bannerDocRef = doc(db, 'BannerImages', banner.id);
  
      // Delete from database
      deleteDoc(bannerDocRef)
          .then(() => {
              // Delete file from storage
              const pictureRef = ref(storage, banner.image);
              deleteObject(pictureRef)
                  .then(() => {
                      alert("Picture is deleted successfully!");
                      // Get updated data
                      getBanners();
                  })
                  .catch((err) => {
                      alert("Error while deleting file: " + err.message);
                  });
          })
          .catch((err) => {
              alert("Error while deleting document from database: " + err.message);
          });
  }
    return (
        <div style={{marginTop:'30px'}}>
            <h1 className="text-center mb-5">Banner Images</h1>
            <div className="col text-center justify-content-center align-self-center" >
                <div className="d-flex justify-content-center mt-5">
                    <input style={{maxWidth:300}} className="form-control" type="file" onChange={handleChange} ref={inputRef} id="imageFile" accept="image/jpeg,image/png" />
                </div>
                <button className="btn btn-primary mt-2"onClick={handleUpload}>Upload to Firebase</button>
                <p className="text-center">{percent} "% done"</p>
            </div>
            
            <div className="container">
                
            {
               bannerList.map((banner,index)=>(
                <div className="">
                    <img src={banner.image} className="rounded mx-auto d-block img-fluid img-thumbnail mt-3" alt="...." width="500"/>
                    <div className="d-flex justify-content-center">
                        <span className="btn btn-outline-danger" onClick={()=>deleteFile(banner)}>Delete</span>
                    </div>
                    <hr/>
                </div>
                
                )) 
            }
            </div>
        </div>
    );
}

export default Banner;