// https://firebase.google.com/docs/storage/web/upload-files#full_example
// https://www.npmjs.com/package/browser-image-resizer#asyncawait

import React, { useState, useContext, useEffect } from "react";
import firebase from "firebase/app";

import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col
} from "reactstrap";

// to compress image before uploading to the server
import { readAndCompressImage } from "browser-image-resizer";

// configs for image resizing
//TODO: DONE: add image configurations
import { imageConfig } from '../utils/config';

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaRegStar, FaStar } from "react-icons/fa";

import { v4 } from "uuid";

// context stuffs
import { ContactContext } from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";

import { useHistory } from "react-router-dom";

import { toast } from "react-toastify";

const AddContact = () => {
  // destructuring state and dispatch from context state
  const { state, dispatch } = useContext(ContactContext);

  const { contactToUpdate, contactToUpdateKey } = state;

  // history hooks from react router dom to send to different page
  const history = useHistory();

  // simple state of all component
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [star, setStar] = useState(false);
  const [friend, setFriend] = useState(false);
  const [lastUpdateDate, setLastUpdateDate] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);

  // when their is the contact to update in the Context state
  // then setting state with the value of the contact
  // will changes only when the contact to update changes
  useEffect(() => {
    if (contactToUpdate) {
      setName(contactToUpdate.name);
      setEmail(contactToUpdate.email);
      setPhoneNumber(contactToUpdate.phoneNumber);
      setAddress(contactToUpdate.address);
      setStar(contactToUpdate.star);
      setFriend(contactToUpdate.friend);
      setLastUpdateDate(contactToUpdate.lastUpdateDate);
      setDownloadUrl(contactToUpdate.picture);

      // also setting is update to true to make the update action instead the addContact action
      setIsUpdate(true);
    }
  }, [contactToUpdate]);

  const getCurrentDate = ()=> {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    
    return `${dd}/${mm}/${yyyy}`;
  }

  // To upload image to firebase and then set the the image link in the state of the app
  const imagePicker = async e => {
    // TODO: DONE: upload image and set D-URL to state
    try {
      const file = e.target.files[0];
      const metadata = {
        contentType: file.type
      }
      let resizedImage = await readAndCompressImage(file, imageConfig);
      const storageRef = await firebase.storage().ref();

      const uploadTask = storageRef
      .child(`contact-images/${file.name}`)
      .put(resizedImage, metadata);

      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        // first callback : got the snapshot
        (snapshot) => {
          setIsUploading(true);
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
              console.log("File uploading is Paused!");
              setIsUploading(false);
              break;
            case firebase.storage.TaskState.RUNNING:
              console.log("Uploading is in progress!");
              break;
            default:
                console.log(snapshot.state);
          }
          if (progress === 100) {
            toast("Image uploaded successfully!", {type: "success"});
          }

        },
        // second callback: got error instead of snapshot
        (error)=> {
          toast("Something went wrong!", {type: "error"})
          console.error(error);
        },
        // third callback: extra callback for our own use
        ()=> {
          uploadTask.snapshot.ref.getDownloadURL()
          .then(downloadURL => setDownloadUrl(downloadURL))
          .catch(err=>console.error(err))
        }
      )

    } catch (error) {
      console.error(error);
    }
  };

  // setting contact to firebase DB
  const addContact = async () => {
    //TODO: add contact method
    try {
      firebase.database().ref('contacts')
      .child(v4())
      .set({
        name, email, phoneNumber, address, picture: downloadUrl ? downloadUrl : null, star, friend, lastUpdateDate: getCurrentDate()
      })
        .then(() => {
          toast('Success!', { type: 'success' })
        })
        .catch((err) => {
          toast(`Error: ${err}`, { type: 'error' })
        })
    } catch (error) {
      console.error(error);
      toast("Something went wrong!", {type: "error"})
    }
  };

  // to handle update the contact when there is contact in state and the user had came from clicking the contact update icon
  const updateContact = async () => {
    //TODO: DONE: update contact method
    try {
      firebase.database()
      .ref(`contacts/${contactToUpdateKey}`)
      .set({
        name, email, phoneNumber, address, picture: downloadUrl ? downloadUrl : null, star, friend, lastUpdateDate: getCurrentDate()
      })
      .then(()=> {
        toast('Success!', { type: 'success' })
      })
      .catch((err)=> {
        toast(`Error: ${err}`, {type: 'error'})
      })
    } catch (error) {
      console.error(error);
      toast("Something went wrong!", {type: "error"})
    }
  };

  // firing when the user click on submit button or the form has been submitted
  const handleSubmit = e => {
    e.preventDefault();

    isUpdate ? updateContact() : addContact()

    // isUpdate wll be true when the user came to update the contact
    // when their is contact then updating and when no contact to update then adding contact
    //TODO: DONE set isUpdate value

    // to handle the bug when the user visit again to add contact directly by visiting the link
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null
    });

    // after adding/updating contact then sending to the contacts
    // TODO :- also sending when their is any errors
    history.push("/");
  };

  // return the spinner when the image has been added in the storage
  // showing the update / add contact based on the  state
  return (
    <Container fluid className="mt-5">
      <Row>
        <Col md="6" className="offset-md-3 p-2">
          <Form onSubmit={handleSubmit}>
            <div className="text-center">
              {isUploading ? (
                <Spinner type="grow" color="primary" />
              ) : (
                <div>
                  <label htmlFor="imagepicker" className="">
                    <img src={downloadUrl} alt="" className="profile" />
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="imagepicker"
                    accept="image/*"
                    multiple={false}
                    onChange={e => imagePicker(e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {lastUpdateDate ? (
              <div className="text-center text-center">
                Last Updated On: <span className="text-primary">{lastUpdateDate}</span>
              </div>
            ): (null)}

            <FormGroup>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="number"
                name="number"
                id="phonenumber"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="phone number"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="textarea"
                name="area"
                id="area"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="address"
              />
            </FormGroup>
            <FormGroup style={{ 'float': 'left'}}>
              Mark as Star
              {star ? (
                <FaStar onClick={() => { setStar(!star) }} className="starIcon" />
              ) : (
                  <FaRegStar onClick={() => { setStar(!star) }} className="starIcon" />
              )}
            </FormGroup>
            <FormGroup style={{'float': 'right'}}>
              {friend ? (
                <AiFillHeart onClick={() => { setFriend(!friend) }} className="heartIconLarge" />
              ) : (
                  <AiOutlineHeart onClick={() => { setFriend(!friend) }} className="heartIconLarge" />
              )}
              Mark as Friend
            </FormGroup>
            <Button
              type="submit"
              color="primary"
              block
              className="text-uppercase"
            >
              {isUpdate ? "Update Contact" : "Add Contact"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddContact;