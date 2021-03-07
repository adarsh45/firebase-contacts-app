import React, { useContext } from "react";

import { Container, ListGroup, ListGroupItem, Spinner } from "reactstrap";
import Contact from "../components/Contact";
import { MdAdd } from "react-icons/md";
import { useHistory } from "react-router-dom";
import { ContactContext } from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";

const Contacts = () => {
  const { state, dispatch } = useContext(ContactContext);

  // destructuring contacts and isLoading from state
  const { contacts, isLoading } = state;

  // history hooks from react router dom to get history
  const history = useHistory();

  // handle fab icon button click
  // will set in state of the contact to update and send it to the contact/add route
  const AddContact = () => {
    //TODO: DONE use dispatch to send user to add contact screen
    
    // payload is set to null because user might go to add contact screen by using direct URL
    // to prevent this , by default payload is set to null , so fresh contact can be added there
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null
    })
    history.push("/contact/add");
  };

  // return loading spinner
  if (isLoading) {
    return (
      <div className="Center">
        <Spinner color="primary" />
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      {/* TODO: DONE Loop through FIREBASE objects  */}
      {
        contacts.length === 0 && !isLoading ? (
          <div className="Center text-large text-primary">No contacts found!</div>
        ) : (
            <ListGroup>
              {Object.entries(contacts).map(([key, value])=> {
                console.log(`${key} : ${value}`);
                return (
                  <ListGroupItem key={key}>
                    <Contact contact={value} contactKey={key} />
                  </ListGroupItem>
                )
              })}
            </ListGroup>
            
        )
      }
      <MdAdd className="fab icon " onClick={AddContact} />
    </Container>
  );
};

export default Contacts;
