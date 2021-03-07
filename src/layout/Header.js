//TODO: DONE set NavbarBrand to go to home page and export Header

import React from "react";
import { Navbar, NavbarBrand, NavbarText } from "reactstrap";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Navbar color="info" light>
      {/* <Link to="/"> */}
        <NavbarBrand tag={Link} to="/" className="text-white">Firebase Contacts App</NavbarBrand>
      {/* </Link> */}
      <NavbarText className="text-white float-right">
        A simple Contact app
      </NavbarText>
    </Navbar>
  );
};

export default Header;