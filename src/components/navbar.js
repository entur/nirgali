import React from 'react';
import logo from '../img/entur_logo.jpg';
import Select from 'react-select';
import { PrimaryButton } from '@entur/button';
import { Contrast } from '@entur/layout';

const NavBar = ({ onSelectOrganization, user, name, logout }) => {
  const handleChange = (event) => {
    onSelectOrganization(event.value);
  };

  const returnOptions = () => {
    let selectValues = [];
    for (let i = 0; i < user.length; i++) {
      selectValues.push({
        label: name[i],
        value: user[i],
      });
    }
    return selectValues;
  };

  return (
    <nav className="navBar">
      <div className="padding">
        <a href="/">
          <img src={logo} width={126} height={54} alt="Entur" />
        </a>
        <div className="select-organization">
          <Select
            placeholder={name[0]}
            onChange={handleChange}
            options={returnOptions()}
          />
        </div>
        <div className="logout">
          <Contrast>
            <PrimaryButton onClick={() => logout()}>Logg ut</PrimaryButton>
          </Contrast>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
